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

  const updateQuantity = (supplier, itemIndex, quantity) => {
    if (!inventory || !inventory[supplier] || !inventory[supplier][itemIndex]) {
      setError("Invalid item reference");
      return;
    }

    try {
      const updated = { ...inventory };
      updated[supplier][itemIndex].quantity = quantity;
      updated[supplier][itemIndex].updatedAt = new Date().toLocaleDateString();
      setInventory(updated);
      
      // Clear any previous errors
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update item quantity.");
    }
  };

  const addItem = (supplier, newItem) => {
    if (!inventory || !inventory[supplier]) {
      setError("Invalid supplier");
      return;
    }

    try {
      const updated = { ...inventory };
      updated[supplier].push({
        name: newItem,
        quantity: 0,
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

  const getTotalStock = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.reduce((sum, item) => sum + (item.quantity || 0), 0), 0
    );
  };

  const getLowStockItems = () => {
    if (!inventory) return 0;
    return Object.values(inventory).reduce((total, items) => 
      total + items.filter(item => (item.quantity || 0) <= 5).length, 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-xl font-semibold text-red-600">Failed to load inventory data</div>
          <div className="text-gray-600 mt-2">Please refresh the page and try again</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Manager</h1>
                <p className="text-gray-600">Manage your restaurant supplies efficiently</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="hidden md:flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(inventory).length}</div>
                <div className="text-sm text-gray-600">Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalItems()}</div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getTotalStock()}</div>
                <div className="text-sm text-gray-600">Total Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{getLowStockItems()}</div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Mobile Stats */}
        <div className="md:hidden grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-blue-600">{Object.keys(inventory).length}</div>
            <div className="text-sm text-gray-600">Suppliers</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-green-600">{getTotalItems()}</div>
            <div className="text-sm text-gray-600">Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-purple-600">{getTotalStock()}</div>
            <div className="text-sm text-gray-600">Total Stock</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xl font-bold text-orange-600">{getLowStockItems()}</div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
        </div>

        {/* Supplier Cards */}
        {Object.keys(inventory).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-xl font-semibold text-gray-700 mb-2">No suppliers found</div>
            <div className="text-gray-500">Add some suppliers to get started</div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Inventory Manager. Built with React & Tailwind CSS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
