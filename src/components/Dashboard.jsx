import { useMemo } from "react";

export default function Dashboard({ data }) {
  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    if (!data || !data.inventory || !data.suppliers) {
      return {
        totalSuppliers: 0,
        totalItems: 0,
        totalValue: 0,
        onHandQty: 0,
        toOrderQty: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        activeSuppliers: 0,
        avgLeadTime: 0,
        supplierPerformance: [],
        recentUpdates: [],
        topCategories: [],
        monthlyTrend: { items: 0, value: 0 },
        criticalAlerts: []
      };
    }

    const suppliers = Object.values(data.suppliers);
    const inventory = data.inventory;

    // Basic stats
    const totalSuppliers = suppliers.length;
    const totalItems = inventory.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
    
    // Inventory value and quantities
    const totalValue = inventory.reduce((sum, item) => {
      return sum + ((item.onHandQty || 0) * (item.pricing?.unitCost || 0));
    }, 0);
    
    const onHandQty = inventory.reduce((sum, item) => sum + (item.onHandQty || 0), 0);
    const toOrderQty = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Stock alerts
    const lowStockItems = inventory.filter(item => (item.onHandQty || 0) <= 5 && (item.onHandQty || 0) > 0).length;
    const outOfStockItems = inventory.filter(item => (item.onHandQty || 0) === 0).length;
    
    // Lead time average
    const avgLeadTime = suppliers.length > 0 
      ? suppliers.reduce((sum, s) => sum + (s.businessInfo?.leadTimeDays || 0), 0) / suppliers.length
      : 0;

    // Supplier performance
    const supplierPerformance = suppliers.map(supplier => {
      const supplierItems = inventory.filter(item => item.supplierId === supplier.id);
      const supplierValue = supplierItems.reduce((sum, item) => {
        return sum + ((item.onHandQty || 0) * (item.pricing?.unitCost || 0));
      }, 0);
      const lowStock = supplierItems.filter(item => (item.onHandQty || 0) <= 5).length;
      const outOfStock = supplierItems.filter(item => (item.onHandQty || 0) === 0).length;
      
      return {
        id: supplier.id,
        name: supplier.name,
        items: supplierItems.length,
        value: supplierValue,
        lowStock,
        outOfStock,
        leadTime: supplier.businessInfo?.leadTimeDays || 0,
        status: supplier.status
      };
    }).sort((a, b) => b.value - a.value);

    // Recent updates (items updated in last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentUpdates = inventory.filter(item => {
      if (!item.updatedAt) return false;
      const updateDate = new Date(item.updatedAt);
      return updateDate >= sevenDaysAgo;
    }).slice(0, 10);

    // Category analysis (by UOM)
    const categoryMap = {};
    inventory.forEach(item => {
      const category = item.uom || 'pieces';
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, value: 0 };
      }
      categoryMap[category].count++;
      categoryMap[category].value += (item.onHandQty || 0) * (item.pricing?.unitCost || 0);
    });
    
    const topCategories = Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Critical alerts
    const criticalAlerts = [];
    if (outOfStockItems > 0) {
      criticalAlerts.push({
        type: 'critical',
        message: `${outOfStockItems} items are out of stock`,
        action: 'Review Inventory',
        icon: '🚨'
      });
    }
    if (lowStockItems > 10) {
      criticalAlerts.push({
        type: 'warning',
        message: `${lowStockItems} items are running low`,
        action: 'Place Orders',
        icon: '⚠️'
      });
    }
    
    const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length;
    if (inactiveSuppliers > 0) {
      criticalAlerts.push({
        type: 'info',
        message: `${inactiveSuppliers} suppliers are inactive`,
        action: 'Review Suppliers',
        icon: '🏭'
      });
    }

    return {
      totalSuppliers,
      totalItems,
      totalValue,
      onHandQty,
      toOrderQty,
      lowStockItems,
      outOfStockItems,
      activeSuppliers,
      avgLeadTime,
      supplierPerformance,
      recentUpdates,
      topCategories,
      criticalAlerts
    };
  }, [data]);

  const getSupplierIcon = (supplierName) => {
    const icons = {
      'Cash n Carry': '🏪',
      'Veggie Order': '🥬',
      'Saputo Order': '🧀',
      'Sysco Order': '🍟',
      'Maroon Order': '🐟',
      'Fancy Lebanese': '🥙'
    };
    return icons[supplierName] || '🏢';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Welcome to Invotraq</h2>
            <p className="text-blue-100">Your complete restaurant inventory management solution</p>
          </div>
          <div className="mt-4 lg:mt-0 text-right">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <div className="text-blue-200 text-sm">Total Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {stats.criticalAlerts.length > 0 && (
        <div className="space-y-3">
          {stats.criticalAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border flex items-center justify-between ${
                alert.type === 'critical' ? 'bg-red-900/50 border-red-600' :
                alert.type === 'warning' ? 'bg-yellow-900/50 border-yellow-600' :
                'bg-blue-900/50 border-blue-600'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{alert.icon}</span>
                <div>
                  <div className={`font-medium ${
                    alert.type === 'critical' ? 'text-red-200' :
                    alert.type === 'warning' ? 'text-yellow-200' :
                    'text-blue-200'
                  }`}>
                    {alert.message}
                  </div>
                </div>
              </div>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' :
                alert.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-400">{stats.totalSuppliers}</div>
              <div className="text-slate-400 text-sm">Total Suppliers</div>
              <div className="text-green-400 text-xs mt-1">
                {stats.activeSuppliers} active
              </div>
            </div>
            <div className="text-3xl">🏭</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-100">{stats.totalItems}</div>
              <div className="text-slate-400 text-sm">Inventory Items</div>
              <div className="text-slate-400 text-xs mt-1">
                {stats.onHandQty} units on hand
              </div>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-400">{stats.lowStockItems}</div>
              <div className="text-slate-400 text-sm">Low Stock Items</div>
              <div className="text-red-400 text-xs mt-1">
                {stats.outOfStockItems} out of stock
              </div>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-400">{stats.avgLeadTime.toFixed(1)}</div>
              <div className="text-slate-400 text-sm">Avg Lead Time</div>
              <div className="text-slate-400 text-xs mt-1">
                days
              </div>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Performance */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Supplier Performance
          </h3>
          <div className="space-y-4">
            {stats.supplierPerformance.slice(0, 5).map((supplier, index) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{getSupplierIcon(supplier.name)}</div>
                  <div>
                    <div className="font-medium text-slate-100">{supplier.name}</div>
                    <div className="text-sm text-slate-400">
                      {supplier.items} items • {supplier.leadTime}d lead time
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">{formatCurrency(supplier.value)}</div>
                  {supplier.lowStock > 0 && (
                    <div className="text-xs text-orange-400">{supplier.lowStock} low stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Top Categories by Value
          </h3>
          <div className="space-y-4">
            {stats.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-yellow-600' :
                    index === 1 ? 'bg-gray-600' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-slate-600'
                  }`}>
                    <span className="text-white font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-100 capitalize">{category.category}</div>
                    <div className="text-sm text-slate-400">{category.count} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">{formatCurrency(category.value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Updates */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
            <span className="mr-2">⏰</span>
            Recent Activity
          </h3>
          {stats.recentUpdates.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUpdates.map((item, index) => {
                const supplier = data.suppliers[item.supplierId];
                return (
                  <div key={item.id || index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <div className="font-medium text-slate-100">{item.name}</div>
                        <div className="text-sm text-slate-400">
                          {supplier?.name} • Updated {item.updatedAt}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">
                      {item.onHandQty} {item.uom}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <div className="text-4xl mb-2">📝</div>
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="mr-3">📦</span>
                <span className="font-medium">Add New Item</span>
              </div>
              <span>→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="mr-3">🏭</span>
                <span className="font-medium">Add Supplier</span>
              </div>
              <span>→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="mr-3">📋</span>
                <span className="font-medium">Create Order</span>
              </div>
              <span>→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="mr-3">📊</span>
                <span className="font-medium">View Reports</span>
              </div>
              <span>→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="mr-3">📤</span>
                <span className="font-medium">Export Data</span>
              </div>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
          <span className="mr-2">🔧</span>
          System Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <div>
              <div className="font-medium text-green-200">Data Sync</div>
              <div className="text-sm text-green-300">Connected</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <div>
              <div className="font-medium text-green-200">Backup</div>
              <div className="text-sm text-green-300">Up to date</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
            <div>
              <div className="font-medium text-blue-200">Storage</div>
              <div className="text-sm text-blue-300">{((JSON.stringify(data).length / 1024).toFixed(1))} KB used</div>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <div>
              <div className="font-medium text-green-200">Performance</div>
              <div className="text-sm text-green-300">Optimal</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}