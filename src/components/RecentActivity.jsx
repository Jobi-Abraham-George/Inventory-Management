import { useState, useEffect, useMemo } from 'react';

export default function RecentActivity({ inventory, orders, suppliers }) {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');

  // Generate activity feed based on data
  const activityFeed = useMemo(() => {
    const feed = [];

    // Add recent orders
    if (orders && Array.isArray(orders)) {
      orders.slice(-10).forEach(order => {
        const supplier = suppliers?.[order.supplierId];
        feed.push({
          id: `order-${order.id}`,
          type: 'order',
          action: order.isAutoOrder ? 'auto-order-created' : 'order-created',
          title: order.isAutoOrder ? 'Auto-order Created' : 'Order Placed',
          description: `${order.items?.length || 0} items ordered from ${supplier?.name || 'Unknown Supplier'}`,
          details: `Total: $${order.totalAmount?.toLocaleString() || '0'} • ${order.status}`,
          timestamp: order.createdAt || order.orderDate,
          icon: order.isAutoOrder ? '🤖' : '📋',
          color: order.status === 'pending' ? 'text-orange-400' : 
                 order.status === 'confirmed' ? 'text-blue-400' : 'text-green-400',
          priority: order.isAutoOrder ? 'high' : 'medium'
        });
      });
    }

    // Add inventory updates (simulate recent updates based on updatedAt field)
    if (inventory && Array.isArray(inventory)) {
      const recentlyUpdated = inventory
        .filter(item => item.updatedAt && item.updatedAt !== "Never updated")
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 15);

      recentlyUpdated.forEach(item => {
        const supplier = suppliers?.[item.supplierId];
        const stockStatus = getStockStatus(item.onHandQty || 0);
        
        feed.push({
          id: `inventory-${item.id}`,
          type: 'inventory',
          action: 'stock-updated',
          title: 'Stock Level Updated',
          description: `${item.name} - ${item.onHandQty || 0} ${item.uom || 'pieces'}`,
          details: `Supplier: ${supplier?.name || 'Unknown'} • ${stockStatus.label}`,
          timestamp: item.updatedAt,
          icon: stockStatus.icon,
          color: stockStatus.color,
          priority: stockStatus.priority
        });
      });
    }

    // Add stock alerts as activities
    const criticalItems = inventory?.filter(item => (item.onHandQty || 0) === 0) || [];
    const lowStockItems = inventory?.filter(item => {
      const qty = item.onHandQty || 0;
      return qty > 0 && qty <= 5;
    }) || [];

    if (criticalItems.length > 0) {
      feed.push({
        id: 'alert-critical',
        type: 'alert',
        action: 'critical-alert',
        title: 'Critical Stock Alert',
        description: `${criticalItems.length} item${criticalItems.length > 1 ? 's' : ''} out of stock`,
        details: criticalItems.slice(0, 3).map(item => item.name).join(', '),
        timestamp: new Date().toISOString(),
        icon: '🚨',
        color: 'text-red-400',
        priority: 'critical'
      });
    }

    if (lowStockItems.length > 0) {
      feed.push({
        id: 'alert-warning',
        type: 'alert',
        action: 'low-stock-alert',
        title: 'Low Stock Warning',
        description: `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low`,
        details: lowStockItems.slice(0, 3).map(item => `${item.name} (${item.onHandQty})`).join(', '),
        timestamp: new Date().toISOString(),
        icon: '⚠️',
        color: 'text-orange-400',
        priority: 'high'
      });
    }

    // Sort by timestamp (most recent first) and priority
    return feed
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .slice(0, 20); // Limit to 20 most recent/important activities
  }, [inventory, orders, suppliers]);

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { 
        label: 'Out of Stock', 
        icon: '🚨', 
        color: 'text-red-400', 
        priority: 'critical' 
      };
    } else if (quantity <= 5) {
      return { 
        label: 'Low Stock', 
        icon: '⚠️', 
        color: 'text-orange-400', 
        priority: 'high' 
      };
    } else if (quantity <= 20) {
      return { 
        label: 'Medium Stock', 
        icon: '📊', 
        color: 'text-yellow-400', 
        priority: 'medium' 
      };
    } else {
      return { 
        label: 'Good Stock', 
        icon: '✅', 
        color: 'text-green-400', 
        priority: 'low' 
      };
    }
  };

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activityFeed;
    return activityFeed.filter(activity => activity.type === filter);
  }, [activityFeed, filter]);

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filterOptions = [
    { key: 'all', label: 'All Activity', icon: '📊', count: activityFeed.length },
    { key: 'order', label: 'Orders', icon: '📋', count: activityFeed.filter(a => a.type === 'order').length },
    { key: 'inventory', label: 'Inventory', icon: '📦', count: activityFeed.filter(a => a.type === 'inventory').length },
    { key: 'alert', label: 'Alerts', icon: '🚨', count: activityFeed.filter(a => a.type === 'alert').length }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">⚡ Recent Activity</h3>
        <div className="flex gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                filter === option.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
              {option.count > 0 && (
                <span className="bg-slate-600 text-xs px-1 rounded-full">
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="text-slate-300 font-medium mb-2">No recent activity</h4>
            <p className="text-slate-400 text-sm">Activity will appear here as you use the system</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-slate-100 font-medium text-sm">
                        {activity.title}
                      </h4>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-1">
                      {activity.description}
                    </p>
                    
                    <p className={`text-xs ${activity.color} opacity-90`}>
                      {activity.details}
                    </p>
                  </div>
                  
                  {activity.priority === 'critical' && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-red-100">
                        Critical
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}