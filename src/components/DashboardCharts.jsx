import { useState, useMemo } from 'react';

export default function DashboardCharts({ inventory, orders, suppliers }) {
  const [activeChart, setActiveChart] = useState('stock-status');

  const chartData = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) {
      return {
        stockStatus: [],
        supplierDistribution: [],
        inventoryValue: [],
        topItems: []
      };
    }

    // Stock Status Pie Chart Data
    const outOfStock = inventory.filter(item => (item.onHandQty || 0) === 0).length;
    const lowStock = inventory.filter(item => {
      const qty = item.onHandQty || 0;
      return qty > 0 && qty <= 5;
    }).length;
    const mediumStock = inventory.filter(item => {
      const qty = item.onHandQty || 0;
      return qty > 5 && qty <= 20;
    }).length;
    const goodStock = inventory.filter(item => (item.onHandQty || 0) > 20).length;

    const stockStatus = [
      { label: 'Out of Stock', value: outOfStock, color: 'bg-red-500', percentage: 0 },
      { label: 'Low Stock', value: lowStock, color: 'bg-orange-500', percentage: 0 },
      { label: 'Medium Stock', value: mediumStock, color: 'bg-yellow-500', percentage: 0 },
      { label: 'Good Stock', value: goodStock, color: 'bg-green-500', percentage: 0 }
    ];

    const totalItems = inventory.length;
    stockStatus.forEach(item => {
      item.percentage = totalItems > 0 ? Math.round((item.value / totalItems) * 100) : 0;
    });

    // Supplier Distribution
    const supplierCounts = {};
    inventory.forEach(item => {
      const supplier = suppliers?.[item.supplierId];
      if (supplier) {
        supplierCounts[supplier.name] = (supplierCounts[supplier.name] || 0) + 1;
      }
    });

    const supplierDistribution = Object.entries(supplierCounts)
      .map(([name, count]) => ({
        label: name,
        value: count,
        percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Top Items by Quantity
    const topItems = inventory
      .map(item => ({
        name: item.name,
        quantity: item.onHandQty || 0,
        supplier: suppliers?.[item.supplierId]?.name || 'Unknown'
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Inventory Value (simplified - would need pricing data for real calculation)
    const inventoryValue = inventory.map(item => ({
      name: item.name,
      value: (item.onHandQty || 0) * (item.pricing?.unitCost || 5), // Using mock pricing
      quantity: item.onHandQty || 0
    })).sort((a, b) => b.value - a.value).slice(0, 6);

    return {
      stockStatus,
      supplierDistribution,
      inventoryValue,
      topItems
    };
  }, [inventory, suppliers]);

  const charts = {
    'stock-status': {
      title: 'Stock Status Distribution',
      icon: '📊',
      component: <StockStatusChart data={chartData.stockStatus} />
    },
    'supplier-distribution': {
      title: 'Items by Supplier',
      icon: '🏭',
      component: <SupplierChart data={chartData.supplierDistribution} />
    },
    'top-items': {
      title: 'Highest Stock Items',
      icon: '📈',
      component: <TopItemsChart data={chartData.topItems} />
    },
    'inventory-value': {
      title: 'Inventory Value',
      icon: '💰',
      component: <InventoryValueChart data={chartData.inventoryValue} />
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">📈 Analytics Dashboard</h3>
        <div className="flex gap-2">
          {Object.entries(charts).map(([key, chart]) => (
            <button
              key={key}
              onClick={() => setActiveChart(key)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeChart === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className="mr-1">{chart.icon}</span>
              <span className="hidden sm:inline">{chart.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h4 className="text-lg font-medium text-slate-100 mb-4">
          {charts[activeChart].icon} {charts[activeChart].title}
        </h4>
        {charts[activeChart].component}
      </div>
    </div>
  );
}

// Stock Status Pie Chart Component
function StockStatusChart({ data }) {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Visual Chart */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          {data.map((item, index) => (
            <div key={item.label} className="absolute inset-0">
              <div
                className={`w-full h-full rounded-full ${item.color} opacity-20`}
                style={{
                  transform: `scale(${0.3 + (item.percentage / 100) * 0.7})`,
                  zIndex: 4 - index
                }}
              />
            </div>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-100">
                {data.reduce((sum, item) => sum + item.value, 0)}
              </div>
              <div className="text-sm text-slate-400">Total Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded ${item.color} mr-3`} />
              <span className="text-slate-300">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="text-slate-100 font-medium">{item.value}</div>
              <div className="text-slate-400 text-sm">{item.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Supplier Distribution Chart
function SupplierChart({ data }) {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">{item.label}</span>
            <div className="text-right">
              <span className="text-slate-100 font-bold">{item.value}</span>
              <span className="text-slate-400 text-sm ml-2">({item.percentage}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Top Items Chart
function TopItemsChart({ data }) {
  const maxQuantity = Math.max(...data.map(item => item.quantity));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex items-center space-x-4">
          <div className="w-8 text-center">
            <span className="text-slate-400 font-bold">#{index + 1}</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-100 font-medium truncate">{item.name}</span>
              <span className="text-slate-300 font-bold">{item.quantity}</span>
            </div>
            <div className="text-xs text-slate-400">{item.supplier}</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.quantity / maxQuantity) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Inventory Value Chart
function InventoryValueChart({ data }) {
  const maxValue = Math.max(...data.map(item => item.value));
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-green-400">
          ${totalValue.toLocaleString()}
        </div>
        <div className="text-slate-400">Total Inventory Value</div>
      </div>
      
      {data.map((item, index) => (
        <div key={`${item.name}-${index}`} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium truncate">{item.name}</span>
            <div className="text-right">
              <div className="text-slate-100 font-bold">${item.value.toLocaleString()}</div>
              <div className="text-slate-400 text-sm">Qty: {item.quantity}</div>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}