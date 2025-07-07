import { useState, useEffect, useMemo } from "react";
import SupplierCard from "./components/SupplierCard";
import SearchAndFilters from "./components/SearchAndFilters";
import initialData from "./data/initialData.json";

export default function App() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
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
    console.log("Filtering inventory with:", { searchQuery, selectedSuppliers, selectedStatuses, selectedUOMs });
    
    if (!inventory) {
      console.log("No inventory available");
      return {};
    }

    try {
      let filtered = { ...inventory };
      console.log("Starting with inventory:", Object.keys(filtered));

      // Apply search filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        console.log("Applying search filter for:", query);
        
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (!filtered[supplier] || !Array.isArray(filtered[supplier])) {
            console.log(`Skipping supplier ${supplier} - no valid items array`);
            return acc;
          }
          
          const filteredItems = filtered[supplier].filter(item => {
            if (!item) {
              console.log("Skipping null/undefined item");
              return false;
            }
            
            try {
              const itemName = (item.name || '').toLowerCase();
              const supplierName = (supplier || '').toLowerCase();
              const itemUom = (item.uom || '').toLowerCase();
              
              const matches = itemName.includes(query) ||
                             supplierName.includes(query) ||
                             itemUom.includes(query);
              
              if (matches) {
                console.log(`Item ${itemName} matches search`);
              }
              
              return matches;
            } catch (itemError) {
              console.error("Error processing item in search:", itemError, item);
              return false;
            }
          });
          
          if (filteredItems.length > 0) {
            acc[supplier] = filteredItems;
            console.log(`Found ${filteredItems.length} items for supplier ${supplier}`);
          }
          return acc;
        }, {});
        
        console.log("After search filter:", Object.keys(filtered));
      }

      // Apply supplier filter
      if (selectedSuppliers.length > 0) {
        console.log("Applying supplier filter for:", selectedSuppliers);
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (selectedSuppliers.includes(supplier) && filtered[supplier]) {
            acc[supplier] = filtered[supplier];
          }
          return acc;
        }, {});
        console.log("After supplier filter:", Object.keys(filtered));
      }

      // Apply status filter
      if (selectedStatuses.length > 0) {
        console.log("Applying status filter for:", selectedStatuses);
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (!filtered[supplier] || !Array.isArray(filtered[supplier])) {
            return acc;
          }
          
          const filteredItems = filtered[supplier].filter(item => {
            if (!item) return false;
            try {
              const status = getStockStatus(item.onHandQty || 0);
              return selectedStatuses.includes(status);
            } catch (statusError) {
              console.error("Error getting stock status:", statusError, item);
              return false;
            }
          });
          
          if (filteredItems.length > 0) {
            acc[supplier] = filteredItems;
          }
          return acc;
        }, {});
        console.log("After status filter:", Object.keys(filtered));
      }

      // Apply UOM filter
      if (selectedUOMs.length > 0) {
        console.log("Applying UOM filter for:", selectedUOMs);
        filtered = Object.keys(filtered).reduce((acc, supplier) => {
          if (!filtered[supplier] || !Array.isArray(filtered[supplier])) {
            return acc;
          }
          
          const filteredItems = filtered[supplier].filter(item => {
            if (!item) return false;
            try {
              return selectedUOMs.includes(item.uom || 'pieces');
            } catch (uomError) {
              console.error("Error checking UOM:", uomError, item);
              return false;
            }
          });
          
          if (filteredItems.length > 0) {
            acc[supplier] = filteredItems;
          }
          return acc;
        }, {});
        console.log("After UOM filter:", Object.keys(filtered));
      }

      console.log("Final filtered result:", Object.keys(filtered));
      return filtered;
    } catch (error) {
      console.error("Error in filtering logic:", error);
      console.log("Returning original inventory due to error");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
          <div className="text-sm font-medium text-slate-300">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-lg font-semibold text-red-400">Failed to load inventory data</div>
          <div className="text-sm text-slate-400 mt-1">Please refresh the page and try again</div>
        </div>
      </div>
    );
  }

  const stats = getFilteredStats();
  const hasActiveFilters = searchQuery || selectedSuppliers.length > 0 || selectedStatuses.length > 0 || selectedUOMs.length > 0;

  // Sidebar navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', active: activeTab === 'dashboard' },
    { id: 'inventory', label: 'Inventory', icon: '📦', active: activeTab === 'inventory' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭', active: activeTab === 'suppliers' },
    { id: 'orders', label: 'Orders', icon: '📋', active: activeTab === 'orders' },
    { id: 'reports', label: 'Reports', icon: '📈', active: activeTab === 'reports' },
    { id: 'settings', label: 'Settings', icon: '⚙️', active: activeTab === 'settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar Navigation */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700">
        {/* Logo/Brand */}
        <div className="flex items-center px-6 py-4 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">🍽️</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Invotraq</h1>
              <p className="text-xs text-slate-400">Restaurant System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-slate-300 text-sm font-medium">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Inventory Management</h1>
              <p className="text-slate-400 text-sm">Manage your inventory items, track stock levels, and handle orders.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                Export
              </button>
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                Import
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + Add Item
              </button>
            </div>
          </div>
        </header>

        {/* Alert Banner */}
        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <div className="bg-yellow-900/50 border border-yellow-600 mx-6 mt-4 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">⚠️</span>
              <div className="text-yellow-200">
                <span className="font-medium">Attention needed</span>
                <p className="text-sm text-yellow-300">
                  {stats.lowStock} items are low in stock and {stats.outOfStock} item{stats.outOfStock !== 1 ? 's' : ''} {stats.outOfStock === 1 ? 'is' : 'are'} out of stock. Consider reordering soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="px-6 py-4">
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
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6">
          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="mb-4 bg-blue-900/50 border border-blue-600 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-200">
                  <span className="font-medium">
                    Showing {stats.items} items from {stats.suppliers} suppliers
                  </span>
                  {searchQuery && <span> matching "{searchQuery}"</span>}
                </div>
                <button
                  onClick={() => applyQuickFilter('clear')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {/* Supplier Cards */}
          {Object.keys(filteredInventory).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">
                {hasActiveFilters ? '🔍' : '📦'}
              </div>
              <div className="text-lg font-semibold text-slate-300 mb-1">
                {hasActiveFilters ? 'No items match your filters' : 'No suppliers found'}
              </div>
              <div className="text-sm text-slate-400">
                {hasActiveFilters ? 'Try adjusting your search or filter criteria' : 'Add some suppliers to get started'}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => applyQuickFilter('clear')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
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
      </div>
    </div>
  );
}
