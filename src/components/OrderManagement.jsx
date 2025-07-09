import React, { useState, useMemo } from 'react';

export default function OrderManagement({ 
  suppliers, 
  inventory, 
  onUpdateInventory,
  orders = [],
  onCreateOrder,
  onUpdateOrder 
}) {
  const [activeView, setActiveView] = useState('overview');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: [],
    notes: '',
    expectedDelivery: '',
    priority: 'medium'
  });
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalValue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
    return stats;
  }, [orders]);

  // Get items that need to be ordered (based on fix count)
  const itemsToOrder = useMemo(() => {
    if (!inventory || !suppliers) return [];
    
    return inventory.filter(item => {
      const onHand = item.onHandQty || 0;
      const fixCount = item.fixCount || 0;
      const orderQty = item.quantity || 0;
      return fixCount > 0 && onHand < fixCount; // Items below fix count level
    }).map(item => ({
      ...item,
      supplierName: suppliers[item.supplierId]?.name || 'Unknown Supplier',
      suggestedQty: Math.max(item.quantity || 0, (item.fixCount || 0) - (item.onHandQty || 0)),
      estimatedCost: (item.pricing?.casePrice || 0) * Math.ceil((item.quantity || 0) / (item.caseQty || 1)),
      shortfall: (item.fixCount || 0) - (item.onHandQty || 0)
    }));
  }, [inventory, suppliers]);

  // Group items by supplier for easier ordering
  const itemsBySupplier = useMemo(() => {
    const grouped = {};
    itemsToOrder.forEach(item => {
      if (!grouped[item.supplierId]) {
        grouped[item.supplierId] = {
          supplier: suppliers[item.supplierId],
          items: []
        };
      }
      grouped[item.supplierId].items.push(item);
    });
    return grouped;
  }, [itemsToOrder, suppliers]);

  // Handle creating a new order
  const handleCreateOrder = () => {
    if (!selectedSupplier || newOrder.items.length === 0) {
      alert('Please select a supplier and add items to the order');
      return;
    }

    const supplier = suppliers[selectedSupplier];
    const totalAmount = newOrder.items.reduce((sum, item) => 
      sum + (item.quantity * (item.estimatedCost || 0)), 0
    );

    const order = {
      id: `order-${Date.now()}`,
      supplierId: selectedSupplier,
      supplierName: supplier.name,
      items: newOrder.items,
      status: 'pending',
      totalAmount,
      orderDate: new Date().toLocaleDateString(),
      expectedDelivery: newOrder.expectedDelivery,
      priority: newOrder.priority,
      notes: newOrder.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCreateOrder(order);
    
    // Reset form
    setNewOrder({
      supplier: '',
      items: [],
      notes: '',
      expectedDelivery: '',
      priority: 'medium'
    });
    setSelectedSupplier('');
    setShowCreateOrder(false);
    setActiveView('orders');
  };

  // Add item to new order
  const addItemToOrder = (item) => {
    const existingItemIndex = newOrder.items.findIndex(orderItem => orderItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.suggestedQty
      };
      setNewOrder(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      setNewOrder(prev => ({
        ...prev,
        items: [...prev.items, {
          ...item,
          quantity: item.suggestedQty,
          estimatedCost: item.estimatedCost
        }]
      }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-600 text-yellow-100',
      processing: 'bg-blue-600 text-blue-100',
      shipped: 'bg-purple-600 text-purple-100',
      delivered: 'bg-green-600 text-green-100',
      cancelled: 'bg-red-600 text-red-100'
    };
    return colors[status] || 'bg-slate-600 text-slate-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400'
    };
    return colors[priority] || 'text-slate-400';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="py-6 space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'create', label: 'Create Order', icon: '📝' },
          { id: 'orders', label: 'Order History', icon: '📋' },
          { id: 'analytics', label: 'Analytics', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Order Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">{orderStats.total}</div>
              <div className="text-sm text-slate-400">Total Orders</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-yellow-400">{orderStats.pending}</div>
              <div className="text-sm text-slate-400">Pending</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">{orderStats.processing}</div>
              <div className="text-sm text-slate-400">Processing</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-purple-400">{orderStats.shipped}</div>
              <div className="text-sm text-slate-400">Shipped</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-green-400">{orderStats.delivered}</div>
              <div className="text-sm text-slate-400">Delivered</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-red-400">{orderStats.cancelled}</div>
              <div className="text-sm text-slate-400">Cancelled</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-xl font-bold text-green-400">{formatCurrency(orderStats.totalValue)}</div>
              <div className="text-sm text-slate-400">Total Value</div>
            </div>
          </div>

          {/* Items Needing Orders */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">
              🚨 Items Below Fix Count ({itemsToOrder.length})
            </h3>
            
            {itemsToOrder.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-slate-400">All items are at or above fix count levels!</p>
                <p className="text-xs text-slate-500 mt-2">Set fix count levels for items to enable auto-ordering</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(itemsBySupplier).map(([supplierId, supplierData]) => (
                  <div key={supplierId} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-slate-100">{supplierData.supplier.name}</h4>
                      <button
                        onClick={() => {
                          setSelectedSupplier(supplierId);
                          setActiveView('create');
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Create Order
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {supplierData.items.map(item => (
                        <div key={item.id} className="bg-slate-800 p-3 rounded border border-slate-600">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-slate-100 text-sm">{item.name}</span>
                            <span className="px-2 py-1 rounded text-xs bg-red-600 text-red-100">
                              Below Fix Count
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            <div>Fix Count: {item.fixCount || 0} {item.uom}</div>
                            <div>On Hand: {item.onHandQty || 0} {item.uom}</div>
                            <div>Shortfall: {item.shortfall} {item.uom}</div>
                            <div>Auto-Order: {item.quantity || 0} {item.uom}</div>
                            <div>Est. Cost: {formatCurrency(item.estimatedCost)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">📋 Recent Orders</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-slate-400">No orders yet. Create your first order!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-slate-100">Order #{order.id}</span>
                        {order.isAutoOrder && (
                          <span className="ml-2 px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                            AUTO
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {order.supplierName} • {order.items.length} items • {order.orderDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Order Tab */}
      {activeView === 'create' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-6">📝 Create New Order</h3>
            
            {/* Supplier Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Supplier
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a supplier...</option>
                {Object.entries(suppliers).map(([id, supplier]) => (
                  <option key={id} value={id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            {/* Items for Selected Supplier */}
            {selectedSupplier && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-100 mb-3">Available Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemsBySupplier[selectedSupplier]?.items.map(item => (
                    <div key={item.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-slate-100">{item.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.onHandQty === 0 ? 'bg-red-600 text-red-100' : 'bg-orange-600 text-orange-100'
                        }`}>
                          {item.onHandQty === 0 ? 'Out' : 'Low'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mb-3">
                        <div>On Hand: {item.onHandQty || 0} {item.uom}</div>
                        <div>Suggested: {item.suggestedQty} {item.uom}</div>
                        <div>Est. Cost: {formatCurrency(item.estimatedCost)}</div>
                      </div>
                      <button
                        onClick={() => addItemToOrder(item)}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Add to Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            {newOrder.items.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-100 mb-3">Order Items ({newOrder.items.length})</h4>
                <div className="bg-slate-700 rounded-lg p-4">
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium text-slate-100">{item.name}</div>
                        <div className="text-sm text-slate-400">{item.quantity} {item.uom}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-100">{formatCurrency(item.estimatedCost)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-600 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-100">Total:</span>
                      <span className="text-slate-100">
                        {formatCurrency(newOrder.items.reduce((sum, item) => sum + item.estimatedCost, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  value={newOrder.expectedDelivery}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={newOrder.priority}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Order Notes
              </label>
              <textarea
                value={newOrder.notes}
                onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special instructions or notes..."
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>

            {/* Create Order Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setNewOrder({
                    supplier: '',
                    items: [],
                    notes: '',
                    expectedDelivery: '',
                    priority: 'medium'
                  });
                  setSelectedSupplier('');
                }}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={!selectedSupplier || newOrder.items.length === 0}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order History Tab */}
      {activeView === 'orders' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-6">📋 Order History</h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-slate-400 mb-4">No orders yet</p>
                <button
                  onClick={() => setActiveView('create')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600 text-left">
                      <th className="py-3 px-4 font-medium text-slate-300">Order ID</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Supplier</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Items</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Total</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Status</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Date</th>
                      <th className="py-3 px-4 font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-slate-100">
                          <div className="flex items-center">
                            #{order.id}
                            {order.isAutoOrder && (
                              <span className="ml-2 px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                                AUTO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-100">{order.supplierName}</td>
                        <td className="py-3 px-4 text-slate-400">{order.items.length} items</td>
                        <td className="py-3 px-4 text-slate-100">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{order.orderDate}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-6">📈 Order Analytics</h3>
            
            {/* Coming Soon */}
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-slate-100 mb-2">Analytics Coming Soon</h4>
              <p className="text-slate-400 mb-6">
                Track order trends, supplier performance, and cost analysis
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-medium text-slate-100">Order Trends</div>
                  <div className="text-sm text-slate-400">Monthly ordering patterns</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🏭</div>
                  <div className="font-medium text-slate-100">Supplier Performance</div>
                  <div className="text-sm text-slate-400">Delivery times and reliability</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-medium text-slate-100">Cost Analysis</div>
                  <div className="text-sm text-slate-400">Spending patterns and savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}