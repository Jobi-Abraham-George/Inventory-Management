import { useMemo } from 'react';

export default function DashboardKPIs({ inventory, orders, suppliers }) {
  const kpis = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) {
      return getEmptyKPIs();
    }

    // Basic counts
    const totalItems = inventory.length;
    const totalSuppliers = suppliers ? Object.keys(suppliers).length : 0;
    const totalStock = inventory.reduce((sum, item) => sum + (item.onHandQty || 0), 0);

    // Stock status analysis
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

    // Calculate inventory health score (0-100%)
    const healthScore = totalItems > 0 ? Math.round(
      ((goodStock * 100) + (mediumStock * 70) + (lowStock * 30) + (outOfStock * 0)) / (totalItems * 100) * 100
    ) : 0;

    // Fix count analysis
    const itemsWithFixCount = inventory.filter(item => (item.fixCount || 0) > 0);
    const itemsBelowFixCount = inventory.filter(item => {
      const onHand = item.onHandQty || 0;
      const fixCount = item.fixCount || 0;
      return fixCount > 0 && onHand < fixCount;
    });

    // Calculate days of stock remaining (simplified calculation)
    const averageDailyUsage = totalStock > 0 ? totalStock / 30 : 1; // Assume 30-day cycle
    const daysOfStock = Math.round(totalStock / averageDailyUsage);

    // Order analysis
    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
    const autoOrders = orders?.filter(order => order.isAutoOrder).length || 0;
    const monthlyOrderValue = orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;

    // Inventory value calculation (simplified)
    const totalInventoryValue = inventory.reduce((sum, item) => {
      const quantity = item.onHandQty || 0;
      const unitCost = item.pricing?.unitCost || 5; // Default cost if not available
      return sum + (quantity * unitCost);
    }, 0);

    // Supplier performance
    const supplierItemCounts = {};
    inventory.forEach(item => {
      const supplier = suppliers?.[item.supplierId];
      if (supplier) {
        if (!supplierItemCounts[supplier.name]) {
          supplierItemCounts[supplier.name] = { total: 0, outOfStock: 0, lowStock: 0 };
        }
        supplierItemCounts[supplier.name].total++;
        if ((item.onHandQty || 0) === 0) supplierItemCounts[supplier.name].outOfStock++;
        if ((item.onHandQty || 0) > 0 && (item.onHandQty || 0) <= 5) supplierItemCounts[supplier.name].lowStock++;
      }
    });

    const avgItemsPerSupplier = totalSuppliers > 0 ? Math.round(totalItems / totalSuppliers) : 0;

    // Calculate trends (simplified - would need historical data for real trends)
    const stockTrend = getStockTrend(healthScore);
    const orderTrend = getOrderTrend(autoOrders, totalOrders);

    return {
      // Core Metrics
      totalItems: {
        value: totalItems,
        label: 'Total Items',
        icon: '📦',
        trend: null,
        color: 'text-slate-100'
      },
      totalSuppliers: {
        value: totalSuppliers,
        label: 'Active Suppliers',
        icon: '🏭',
        trend: null,
        color: 'text-blue-400'
      },
      healthScore: {
        value: healthScore,
        label: 'System Health',
        icon: '💚',
        trend: stockTrend,
        color: healthScore >= 80 ? 'text-green-400' : healthScore >= 60 ? 'text-yellow-400' : 'text-red-400',
        suffix: '%'
      },
      totalInventoryValue: {
        value: totalInventoryValue,
        label: 'Inventory Value',
        icon: '💰',
        trend: null,
        color: 'text-green-400',
        prefix: '$',
        format: 'currency'
      },

      // Stock Analysis
      outOfStock: {
        value: outOfStock,
        label: 'Out of Stock',
        icon: '🚨',
        trend: outOfStock > 0 ? 'critical' : 'stable',
        color: 'text-red-400'
      },
      lowStock: {
        value: lowStock,
        label: 'Low Stock',
        icon: '⚠️',
        trend: lowStock > totalItems * 0.2 ? 'warning' : 'stable',
        color: 'text-orange-400'
      },
      goodStock: {
        value: goodStock,
        label: 'Well Stocked',
        icon: '✅',
        trend: goodStock > totalItems * 0.6 ? 'positive' : 'stable',
        color: 'text-green-400'
      },
      daysOfStock: {
        value: daysOfStock > 365 ? '365+' : daysOfStock,
        label: 'Days of Stock',
        icon: '📅',
        trend: daysOfStock < 7 ? 'critical' : daysOfStock < 14 ? 'warning' : 'stable',
        color: daysOfStock < 7 ? 'text-red-400' : daysOfStock < 14 ? 'text-orange-400' : 'text-green-400'
      },

      // Order Metrics
      pendingOrders: {
        value: pendingOrders,
        label: 'Pending Orders',
        icon: '📋',
        trend: pendingOrders > 5 ? 'warning' : 'stable',
        color: 'text-orange-400'
      },
      autoOrders: {
        value: autoOrders,
        label: 'Auto Orders',
        icon: '🤖',
        trend: orderTrend,
        color: 'text-purple-400'
      },
      monthlyOrderValue: {
        value: monthlyOrderValue,
        label: 'Order Value',
        icon: '💳',
        trend: null,
        color: 'text-blue-400',
        prefix: '$',
        format: 'currency'
      },
      avgItemsPerSupplier: {
        value: avgItemsPerSupplier,
        label: 'Items/Supplier',
        icon: '📊',
        trend: null,
        color: 'text-slate-100'
      },

      // Advanced Metrics
      fixCountCoverage: {
        value: totalItems > 0 ? Math.round((itemsWithFixCount.length / totalItems) * 100) : 0,
        label: 'Fix Count Coverage',
        icon: '🎯',
        trend: null,
        color: 'text-blue-400',
        suffix: '%'
      },
      belowFixCount: {
        value: itemsBelowFixCount.length,
        label: 'Below Fix Count',
        icon: '🎯',
        trend: itemsBelowFixCount.length > 0 ? 'warning' : 'stable',
        color: 'text-orange-400'
      }
    };
  }, [inventory, orders, suppliers]);

  function getEmptyKPIs() {
    return {
      totalItems: { value: 0, label: 'Total Items', icon: '📦', color: 'text-slate-100' },
      totalSuppliers: { value: 0, label: 'Active Suppliers', icon: '🏭', color: 'text-blue-400' },
      healthScore: { value: 0, label: 'System Health', icon: '💚', color: 'text-slate-400', suffix: '%' },
      totalInventoryValue: { value: 0, label: 'Inventory Value', icon: '💰', color: 'text-green-400', prefix: '$' }
    };
  }

  function getStockTrend(healthScore) {
    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 75) return 'positive';
    if (healthScore >= 60) return 'stable';
    if (healthScore >= 40) return 'warning';
    return 'critical';
  }

  function getOrderTrend(autoOrders, totalOrders) {
    if (totalOrders === 0) return 'stable';
    const autoOrderPercentage = (autoOrders / totalOrders) * 100;
    if (autoOrderPercentage >= 70) return 'excellent';
    if (autoOrderPercentage >= 50) return 'positive';
    return 'stable';
  }

  const formatValue = (kpi) => {
    if (kpi.format === 'currency') {
      return `${kpi.prefix || ''}${kpi.value.toLocaleString()}${kpi.suffix || ''}`;
    }
    return `${kpi.prefix || ''}${kpi.value}${kpi.suffix || ''}`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'excellent': return '🚀';
      case 'positive': return '📈';
      case 'stable': return '➡️';
      case 'warning': return '⚠️';
      case 'critical': return '🔻';
      default: return null;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'excellent': return 'text-emerald-400';
      case 'positive': return 'text-green-400';
      case 'stable': return 'text-slate-400';
      case 'warning': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Group KPIs into sections
  const kpiSections = [
    {
      title: 'Core Metrics',
      kpis: ['totalItems', 'totalSuppliers', 'healthScore', 'totalInventoryValue']
    },
    {
      title: 'Stock Analysis',
      kpis: ['outOfStock', 'lowStock', 'goodStock', 'daysOfStock']
    },
    {
      title: 'Order Management',
      kpis: ['pendingOrders', 'autoOrders', 'monthlyOrderValue', 'avgItemsPerSupplier']
    },
    {
      title: 'Advanced Insights',
      kpis: ['fixCountCoverage', 'belowFixCount']
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">🎯 Key Performance Indicators</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Updated:</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        {kpiSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-md font-medium text-slate-300 mb-3">{section.title}</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {section.kpis.map((kpiKey) => {
                const kpi = kpis[kpiKey];
                if (!kpi) return null;

                return (
                  <div
                    key={kpiKey}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{kpi.icon}</span>
                      {kpi.trend && (
                        <span className={`text-sm ${getTrendColor(kpi.trend)}`}>
                          {getTrendIcon(kpi.trend)}
                        </span>
                      )}
                    </div>
                    
                    <div className={`text-2xl font-bold mb-1 ${kpi.color}`}>
                      {formatValue(kpi)}
                    </div>
                    
                    <div className="text-sm text-slate-400">
                      {kpi.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Health Score Detail */}
      {kpis.healthScore && (
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-slate-100">System Health Breakdown</h4>
            <span className={`text-lg font-bold ${kpis.healthScore.color}`}>
              {kpis.healthScore.value}%
            </span>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                kpis.healthScore.value >= 80 ? 'bg-green-500' :
                kpis.healthScore.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${kpis.healthScore.value}%` }}
            />
          </div>
          
          <div className="text-sm text-slate-400">
            Based on stock levels: {kpis.goodStock.value} well-stocked, {kpis.lowStock.value} low stock, {kpis.outOfStock.value} out of stock
          </div>
        </div>
      )}
    </div>
  );
}