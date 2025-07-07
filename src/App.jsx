import { useState, useEffect } from "react";
import SupplierCard from "./components/SupplierCard";
import initialData from "./data/initialData.json";

export default function App() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize inventory from localStorage or use initial data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inventory");
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Validate that the parsed data is an object
        if (typeof parsedData === 'object' && parsedData !== null) {
          setInventory(parsedData);
        } else {
          throw new Error("Invalid data format in localStorage");
        }
      } else {
        setInventory(initialData);
      }
    } catch (error) {
      console.error("Error loading inventory from localStorage:", error);
      setError("Failed to load saved inventory. Using default data.");
      setInventory(initialData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    if (inventory) {
      try {
        localStorage.setItem("inventory", JSON.stringify(inventory));
      } catch (error) {
        console.error("Error saving inventory to localStorage:", error);
        setError("Failed to save inventory changes.");
      }
    }
  }, [inventory]);

  const updateQuantity = (supplier, itemIndex, field, value) => {
    if (!inventory || !inventory[supplier] || !inventory[supplier][itemIndex]) {
      setError("Invalid item reference");
      return;
    }

    try {
      const updated = { ...inventory };
      updated[supplier][itemIndex][field] = value;
      updated[supplier][itemIndex].updatedAt = new Date().toLocaleDateString();
      setInventory(updated);
      
      // Clear any previous errors
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating field:", error);
      setError(`Failed to update ${field}.`);
    }
  };

  const addItem = (supplier, newItemName) => {
    if (!inventory || !inventory[supplier]) {
      setError("Invalid supplier");
      return;
    }

    try {
      const updated = { ...inventory };
      updated[supplier].push({
        name: newItemName,
        onHandQty: 0,
        buildQty: 0,
        quantity: 0,
        uom: "pieces",
        caseQty: 1,
        updatedAt: new Date().toLocaleDateString(),
      });
      setInventory(updated);
      
      // Clear any previous errors
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add new item.");
    }
  };

  const getTotalItems = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => total + items.length, 0);
  };

  const getTotalOnHandStock = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.reduce((sum, item) => sum + (item.onHandQty || 0), 0), 0
    );
  };

  const getTotalBuildQty = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.reduce((sum, item) => sum + (item.buildQty || 0), 0), 0
    );
  };

  const getTotalOrderQty = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.reduce((sum, item) => sum + (item.quantity || 0), 0), 0
    );
  };

  const getLowStockItems = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.filter(item => (item.onHandQty || 0) <= 5).length, 0
    );
  };

  const getOutOfStockItems = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.filter(item => (item.onHandQty || 0) === 0).length, 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <div className="text-sm font-medium text-gray-700">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">�</div>
          <div className="text-lg font-semibold text-red-600">Failed to load inventory data</div>
          <div className="text-sm text-gray-600 mt-1">Please refresh the page and try again</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-3 py-3">
          <div className="flex flex-col space-y-3">
            {/* Top Row - Logo and Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📦</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Inventory Management</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Restaurant Supply Chain System</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-gray-900">{Object.keys(inventory).length}</div>
                <div className="text-xs text-gray-500">Suppliers</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-gray-900">{getTotalItems()}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-blue-600">{getTotalOnHandStock()}</div>
                <div className="text-xs text-gray-500">On Hand</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-green-600">{getTotalBuildQty()}</div>
                <div className="text-xs text-gray-500">To Build</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-purple-600">{getTotalOrderQty()}</div>
                <div className="text-xs text-gray-500">To Order</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-orange-600">{getLowStockItems()}</div>
                <div className="text-xs text-gray-500">Low Stock</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-red-600">{getOutOfStockItems()}</div>
                <div className="text-xs text-gray-500">Out of Stock</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 py-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-500 text-sm">⚠️</span>
                </div>
                <div className="ml-2">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 font-medium text-sm ml-4 touch-manipulation"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Mobile Field Legend - Collapsible */}
        <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">📋 Quick Reference</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Hand:</strong> Current stock</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Build:</strong> Need to make</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Order:</strong> Need to buy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-700"><strong>UOM:</strong> Unit type</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Case:</strong> Pack size</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700"><strong>Status:</strong> Stock level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Cards - Mobile Optimized */}
        {Object.keys(inventory).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-lg font-semibold text-gray-700 mb-1">No suppliers found</div>
            <div className="text-sm text-gray-500">Add some suppliers to get started</div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(inventory).map((supplier) => (
              <SupplierCard
                key={supplier}
                supplier={supplier}
                items={inventory[supplier]}
                onUpdateQuantity={updateQuantity}
                onAddItem={addItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile-Optimized Footer */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="w-full px-3 py-4">
          <div className="text-center text-gray-500 text-xs">
            <p>© 2024 Restaurant Inventory System</p>
            <p className="mt-1">Optimized for Mobile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
