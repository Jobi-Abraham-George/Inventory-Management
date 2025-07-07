import { useState, useEffect, useMemo } from "react";
import SupplierCard from "./components/SupplierCard";
import SearchAndFilters from "./components/SearchAndFilters";
import initialData from "./data/initialData.json";

export default function App() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedUOMs, setSelectedUOMs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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

  // Helper function to get stock status
  const getStockStatus = (onHandQty) => {
    if (onHandQty === 0) return 'out';
    if (onHandQty <= 5) return 'low';
    if (onHandQty <= 20) return 'medium';
    return 'good';
  };

  // Filter and search logic
  const filteredInventory = useMemo(() => {
    if (!inventory) return {};

    try {
      let filtered = { ...inventory };

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          // Make sure we have items for this supplier
          if (!filtered[supplier] || !Array.isArray(filtered[supplier])) {
            return acc;
          }
          
          const filteredItems = filtered[supplier].filter(item => {
            // Safety check for item properties
            if (!item) return false;
            
            const itemName = (item.name || '').toLowerCase();
            const supplierName = (supplier || '').toLowerCase();
            const itemUom = (item.uom || '').toLowerCase();
            
            return itemName.includes(query) ||
                   supplierName.includes(query) ||
                   itemUom.includes(query);
          });
          
          if (filteredItems.length > 0) {
            acc[supplier] = filteredItems;
          }
          return acc;
        }, {});
      }

      // Apply supplier filter
      if (selectedSuppliers.length > 0) {
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (selectedSuppliers.includes(supplier) && filtered[supplier]) {
            acc[supplier] = filtered[supplier];
          }
          return acc;
        }, {});
      }

      // Apply status filter
      if (selectedStatuses.length > 0) {
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (!filtered[supplier] || !Array.isArray(filtered[supplier])) {
            return acc;
          }
          
          const filteredItems = filtered[supplier].filter(item => {
            if (!item) return false;
            const status = getStockStatus(item.onHandQty || 0);
            return selectedStatuses.includes(status);
          });
          
          if (filteredItems.length > 0) {
            acc[supplier] = filteredItems;
          }
          return acc;
        }, {});
      }

      // Apply UOM filter
      if (selectedUOMs.length > 0) {
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (!filtered[supplier] || !Array.isArray(filtered[supplier])) {
            return acc;
          }
          
          const filteredItems = filtered[supplier].filter(item => {
            if (!item) return false;
            return selectedUOMs.includes(item.uom || 'pieces');
          });
          
          if (filteredItems.length > 0) {
            acc[supplier] = filteredItems;
          }
          return acc;
        }, {});
      }

      return filtered;
    } catch (error) {
      console.error("Error in filtering logic:", error);
      // Return original inventory if filtering fails
      return inventory || {};
    }
  }, [inventory, searchQuery, selectedSuppliers, selectedStatuses, selectedUOMs]);

  // Quick filter functions
  const applyQuickFilter = (filterType) => {
    try {
      setSelectedSuppliers([]);
      setSelectedUOMs([]);
      setSearchQuery("");
      
      switch (filterType) {
        case 'low-stock':
          setSelectedStatuses(['low']);
          break;
        case 'out-of-stock':
          setSelectedStatuses(['out']);
          break;
        case 'in-stock':
          setSelectedStatuses(['medium', 'good']);
          break;
        case 'recently-updated':
          setSelectedStatuses([]);
          break;
        case 'clear':
          setSelectedStatuses([]);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error in quick filter:", error);
      setError("Failed to apply filter. Please try again.");
    }
  };

  // Get statistics for current view
  const getFilteredStats = () => {
    try {
      if (!filteredInventory || Object.keys(filteredInventory).length === 0) {
        return { suppliers: 0, items: 0, onHand: 0, toBuild: 0, toOrder: 0, lowStock: 0, outOfStock: 0 };
      }

      const suppliers = Object.keys(filteredInventory).length;
      const items = Object.values(filteredInventory).reduce((total, items) => {
        return total + (Array.isArray(items) ? items.length : 0);
      }, 0);
      const onHand = Object.values(filteredInventory).reduce((total, items) => {
        if (!Array.isArray(items)) return total;
        return total + items.reduce((sum, item) => sum + (item?.onHandQty || 0), 0);
      }, 0);
      const toBuild = Object.values(filteredInventory).reduce((total, items) => {
        if (!Array.isArray(items)) return total;
        return total + items.reduce((sum, item) => sum + (item?.buildQty || 0), 0);
      }, 0);
      const toOrder = Object.values(filteredInventory).reduce((total, items) => {
        if (!Array.isArray(items)) return total;
        return total + items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
      }, 0);
      const lowStock = Object.values(filteredInventory).reduce((total, items) => {
        if (!Array.isArray(items)) return total;
        return total + items.filter(item => item && (item.onHandQty || 0) <= 5).length;
      }, 0);
      const outOfStock = Object.values(filteredInventory).reduce((total, items) => {
        if (!Array.isArray(items)) return total;
        return total + items.filter(item => item && (item.onHandQty || 0) === 0).length;
      }, 0);

      return { suppliers, items, onHand, toBuild, toOrder, lowStock, outOfStock };
    } catch (error) {
      console.error("Error calculating filtered stats:", error);
      return { suppliers: 0, items: 0, onHand: 0, toBuild: 0, toOrder: 0, lowStock: 0, outOfStock: 0 };
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
          <div className="text-4xl mb-3">📦</div>
          <div className="text-lg font-semibold text-red-600">Failed to load inventory data</div>
          <div className="text-sm text-gray-600 mt-1">Please refresh the page and try again</div>
        </div>
      </div>
    );
  }

  const stats = getFilteredStats();
  const hasActiveFilters = searchQuery || selectedSuppliers.length > 0 || selectedStatuses.length > 0 || selectedUOMs.length > 0;

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
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors touch-manipulation ${
                  hasActiveFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-lg">🔍</span>
              </button>
            </div>
            
            {/* Mobile Stats Grid - Show filtered stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-gray-900">{stats.suppliers}</div>
                <div className="text-xs text-gray-500">Suppliers</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-gray-900">{stats.items}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-blue-600">{stats.onHand}</div>
                <div className="text-xs text-gray-500">On Hand</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-green-600">{stats.toBuild}</div>
                <div className="text-xs text-gray-500">To Build</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-purple-600">{stats.toOrder}</div>
                <div className="text-xs text-gray-500">To Order</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-orange-600">{stats.lowStock}</div>
                <div className="text-xs text-gray-500">Low Stock</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-lg font-semibold text-red-600">{stats.outOfStock}</div>
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

        {/* Search and Filters Component */}
        <SearchAndFilters
          inventory={inventory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSuppliers={selectedSuppliers}
          setSelectedSuppliers={setSelectedSuppliers}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedUOMs={selectedUOMs}
          setSelectedUOMs={setSelectedUOMs}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          applyQuickFilter={applyQuickFilter}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <span className="font-medium">
                  Showing {stats.items} items from {stats.suppliers} suppliers
                </span>
                {searchQuery && <span> matching "{searchQuery}"</span>}
              </div>
              <button
                onClick={() => applyQuickFilter('clear')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium touch-manipulation"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Supplier Cards - Mobile Optimized */}
        {Object.keys(filteredInventory).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">
              {hasActiveFilters ? '🔍' : '📦'}
            </div>
            <div className="text-lg font-semibold text-gray-700 mb-1">
              {hasActiveFilters ? 'No items match your filters' : 'No suppliers found'}
            </div>
            <div className="text-sm text-gray-500">
              {hasActiveFilters ? 'Try adjusting your search or filter criteria' : 'Add some suppliers to get started'}
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => applyQuickFilter('clear')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(filteredInventory).map((supplier) => (
              <SupplierCard
                key={supplier}
                supplier={supplier}
                items={filteredInventory[supplier]}
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
            <p className="mt-1">Optimized for Mobile • Enhanced with Search & Filters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
