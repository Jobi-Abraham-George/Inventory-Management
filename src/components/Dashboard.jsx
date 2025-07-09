import { useMemo } from "react";

export default function Dashboard({ data }) {
  if (!data || !data.inventory || !data.suppliers) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">Loading Dashboard...</h3>
        <p className="text-slate-400">Please wait while we load your data.</p>
      </div>
    );
  }

  const suppliers = Object.values(data.suppliers);
  const inventory = data.inventory;

  // Basic statistics
  const totalSuppliers = suppliers.length;
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => (item.onHandQty || 0) <= 5 && (item.onHandQty || 0) > 0).length;
  const outOfStockItems = inventory.filter(item => (item.onHandQty || 0) === 0).length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🍽️ Welcome to InvoTraq</h2>
        <p className="text-blue-100">Your restaurant inventory management system</p>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-400">{totalSuppliers}</div>
              <div className="text-slate-400 text-sm">Total Suppliers</div>
            </div>
            <div className="text-3xl">🏭</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-100">{totalItems}</div>
              <div className="text-slate-400 text-sm">Inventory Items</div>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-400">{lowStockItems}</div>
              <div className="text-slate-400 text-sm">Low Stock Items</div>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-400">{outOfStockItems}</div>
              <div className="text-slate-400 text-sm">Out of Stock</div>
            </div>
            <div className="text-3xl">🚨</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium text-slate-100">Manage Inventory</div>
            <div className="text-sm text-slate-400">Update stock levels</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl mb-2">🏭</div>
            <div className="font-medium text-slate-100">Manage Suppliers</div>
            <div className="text-sm text-slate-400">Add and edit suppliers</div>
          </div>
          
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium text-slate-100">Manage Orders</div>
            <div className="text-sm text-slate-400">Create and track orders</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-slate-100 mb-3">System Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-300">System Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-slate-300">Data Synced</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}