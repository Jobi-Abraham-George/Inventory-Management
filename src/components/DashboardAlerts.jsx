import { useState, useEffect } from 'react';

export default function DashboardAlerts({ inventory, orders, suppliers }) {
  const [alerts, setAlerts] = useState([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts = [];

      if (!inventory || !Array.isArray(inventory)) return newAlerts;

      // Critical out-of-stock alerts
      const outOfStockItems = inventory.filter(item => (item.onHandQty || 0) === 0);
      if (outOfStockItems.length > 0) {
        newAlerts.push({
          id: 'out-of-stock',
          type: 'critical',
          title: `${outOfStockItems.length} item${outOfStockItems.length > 1 ? 's' : ''} out of stock`,
          message: `Immediate action required: ${outOfStockItems.slice(0, 3).map(item => item.name).join(', ')}${outOfStockItems.length > 3 ? ` and ${outOfStockItems.length - 3} more` : ''}`,
          icon: '🚨',
          timestamp: new Date().toISOString(),
          action: 'View Inventory',
          actionTab: 'inventory'
        });
      }

      // Low stock warnings
      const lowStockItems = inventory.filter(item => {
        const onHand = item.onHandQty || 0;
        return onHand > 0 && onHand <= 5;
      });
      if (lowStockItems.length > 0) {
        newAlerts.push({
          id: 'low-stock',
          type: 'warning',
          title: `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low`,
          message: `Consider reordering: ${lowStockItems.slice(0, 3).map(item => `${item.name} (${item.onHandQty})`).join(', ')}${lowStockItems.length > 3 ? ` and ${lowStockItems.length - 3} more` : ''}`,
          icon: '⚠️',
          timestamp: new Date().toISOString(),
          action: 'Manage Orders',
          actionTab: 'orders'
        });
      }

      // Fix count alerts (items below fix count)
      const belowFixCountItems = inventory.filter(item => {
        const onHand = item.onHandQty || 0;
        const fixCount = item.fixCount || 0;
        return fixCount > 0 && onHand < fixCount;
      });
      if (belowFixCountItems.length > 0) {
        newAlerts.push({
          id: 'below-fix-count',
          type: 'info',
          title: `${belowFixCountItems.length} item${belowFixCountItems.length > 1 ? 's' : ''} below fix count`,
          message: `Auto-orders may be needed for optimal stock levels`,
          icon: '🎯',
          timestamp: new Date().toISOString(),
          action: 'Review Inventory',
          actionTab: 'inventory'
        });
      }

      // Pending orders alert
      const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
      if (pendingOrders.length > 0) {
        newAlerts.push({
          id: 'pending-orders',
          type: 'info',
          title: `${pendingOrders.length} pending order${pendingOrders.length > 1 ? 's' : ''}`,
          message: `Orders waiting for processing or delivery`,
          icon: '📋',
          timestamp: new Date().toISOString(),
          action: 'View Orders',
          actionTab: 'orders'
        });
      }

      // Today's expected deliveries
      const today = new Date().toLocaleDateString();
      const todayDeliveries = orders?.filter(order => 
        order.expectedDelivery === today && 
        (order.status === 'confirmed' || order.status === 'shipped')
      ) || [];
      if (todayDeliveries.length > 0) {
        newAlerts.push({
          id: 'todays-deliveries',
          type: 'success',
          title: `${todayDeliveries.length} delivery${todayDeliveries.length > 1 ? 'ies' : ''} expected today`,
          message: `Prepare to receive orders from suppliers`,
          icon: '🚚',
          timestamp: new Date().toISOString(),
          action: 'View Orders',
          actionTab: 'orders'
        });
      }

      return newAlerts.sort((a, b) => {
        const priority = { critical: 3, warning: 2, info: 1, success: 0 };
        return priority[b.type] - priority[a.type];
      });
    };

    setAlerts(generateAlerts());
  }, [inventory, orders]);

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-900/50',
          border: 'border-red-600',
          text: 'text-red-100',
          badge: 'bg-red-600 text-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-orange-900/50',
          border: 'border-orange-600',
          text: 'text-orange-100',
          badge: 'bg-orange-600 text-orange-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-900/50',
          border: 'border-blue-600',
          text: 'text-blue-100',
          badge: 'bg-blue-600 text-blue-100'
        };
      case 'success':
        return {
          bg: 'bg-green-900/50',
          border: 'border-green-600',
          text: 'text-green-100',
          badge: 'bg-green-600 text-green-100'
        };
      default:
        return {
          bg: 'bg-slate-800',
          border: 'border-slate-600',
          text: 'text-slate-100',
          badge: 'bg-slate-600 text-slate-100'
        };
    }
  };

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 3);

  if (alerts.length === 0) {
    return (
      <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-100">All systems optimal</h3>
            <p className="text-green-200 text-sm">No critical alerts at this time</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-slate-100">🔔 Alerts & Notifications</h3>
          {alerts.length > 0 && (
            <span className="ml-3 px-2 py-1 bg-red-600 text-red-100 text-xs font-bold rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length > 3 && (
          <button
            onClick={() => setShowAllAlerts(!showAllAlerts)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            {showAllAlerts ? 'Show Less' : `Show All (${alerts.length})`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert) => {
          const styles = getAlertStyles(alert.type);
          return (
            <div
              key={alert.id}
              className={`${styles.bg} border ${styles.border} rounded-lg p-4 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <span className="text-2xl mr-3 flex-shrink-0">{alert.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${styles.text}`}>{alert.title}</h4>
                      <span className={`px-2 py-1 ${styles.badge} text-xs font-medium rounded-full uppercase`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className={`${styles.text} text-sm opacity-90`}>{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <button
                    onClick={() => {
                      // This will be handled by parent component
                      const event = new CustomEvent('navigateToTab', { 
                        detail: { tab: alert.actionTab } 
                      });
                      window.dispatchEvent(event);
                    }}
                    className="ml-4 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm rounded-lg transition-colors flex-shrink-0"
                  >
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}