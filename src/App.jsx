import React, { useState, useEffect, useMemo } from "react";
import SupplierCard from "./components/SupplierCard";
import SupplierManagement from "./components/SupplierManagement";
import SearchAndFilters from "./components/SearchAndFilters";
import OrderManagement from "./components/OrderManagement";
import initialData from "./data/initialData.json";

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Dashboard Error</h3>
          <p className="text-slate-400">Something went wrong loading the dashboard.</p>
          <pre className="text-xs text-slate-500 mt-4 bg-slate-800 p-4 rounded max-w-md mx-auto overflow-auto">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedUOMs, setSelectedUOMs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Migration function to convert old data structure to new structure
  const migrateOldData = (oldData) => {
    console.log("Migrating old data structure to new format...");
    
    // Create default suppliers
    const suppliers = {
      "cash-n-carry": {
        "id": "cash-n-carry",
        "name": "Cash n Carry",
        "contactInfo": {
          "phone": "(555) 123-4567",
          "email": "orders@cashncarry.com",
          "address": "1234 Wholesale Ave, Food City, FC 12345",
          "contactPerson": "Mike Johnson",
          "website": "www.cashncarry.com"
        },
        "businessInfo": {
          "leadTimeDays": 2,
          "minimumOrder": 100,
          "paymentTerms": "Net 30",
          "deliveryDays": ["Monday", "Wednesday", "Friday"],
          "notes": "Bulk food supplier specializing in restaurant supplies"
        },
        "status": "active",
        "createdAt": "2024-01-01",
        "updatedAt": "2024-01-01"
      }
    };

    // Create inventory array from old structure
    const inventory = [];
    let itemIdCounter = 1;

    Object.entries(oldData).forEach(([supplierName, items]) => {
      // Create supplier ID
      const supplierId = supplierName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Add supplier if not exists
      if (!suppliers[supplierId]) {
        suppliers[supplierId] = {
          id: supplierId,
          name: supplierName,
          contactInfo: {
            phone: "",
            email: "",
            address: "",
            contactPerson: "",
            website: ""
          },
          businessInfo: {
            leadTimeDays: 2,
            minimumOrder: 100,
            paymentTerms: "Net 30",
            deliveryDays: [],
            notes: ""
          },
          status: "active",
          createdAt: new Date().toLocaleDateString(),
          updatedAt: new Date().toLocaleDateString()
        };
      }

      // Convert items
      if (Array.isArray(items)) {
        items.forEach(item => {
          inventory.push({
            id: `item-${String(itemIdCounter).padStart(3, '0')}`,
            name: item.name,
            supplierId: supplierId,
            onHandQty: item.onHandQty || 0,
            quantity: item.quantity || 0,
            fixCount: item.fixCount || 0,
            uom: item.uom || "pieces",
            caseQty: item.caseQty || 1,
            pricing: {
              unitCost: Math.random() * 10, // Random pricing for migration
              casePrice: Math.random() * 50,
              lastUpdated: new Date().toLocaleDateString()
            },
            updatedAt: item.updatedAt || ""
          });
          itemIdCounter++;
        });
      }
    });

    return { suppliers, inventory };
  };

  // Migration function to add fixCount and image to existing data
  const migrateToFixCount = (data) => {
    console.log("Adding fixCount and image fields to existing inventory...");
    
    const updatedData = { ...data };
    
    if (updatedData.inventory) {
      updatedData.inventory = updatedData.inventory.map(item => ({
        ...item,
        fixCount: item.fixCount || 0,
        image: item.image || null
      }));
    }
    
    return updatedData;
  };

  // Initialize data from localStorage or use initial data
  useEffect(() => {
    // Add global debug helper
    window.clearInvotraqData = () => {
      localStorage.removeItem('inventory');
      localStorage.removeItem('inventoryData');
      localStorage.removeItem('orders');
      window.location.reload();
    };
    console.log('🔧 Debug: Run window.clearInvotraqData() to clear all data and refresh');
    
    try {
      const saved = localStorage.getItem("inventoryData");
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (typeof parsedData === 'object' && parsedData !== null && parsedData.suppliers && parsedData.inventory) {
          // New data structure - check if fixCount or image migration is needed
          const needsMigration = parsedData.inventory.some(item => 
            !item.hasOwnProperty('fixCount') || !item.hasOwnProperty('image')
          );
          
          if (needsMigration) {
            const migratedData = migrateToFixCount(parsedData);
            setData(migratedData);
            console.log("Data migration completed successfully!");
          } else {
            setData(parsedData);
          }
        } else if (typeof parsedData === 'object' && parsedData !== null) {
          // Check if it's old data structure (object with supplier names as keys)
          const isOldStructure = Object.keys(parsedData).some(key => 
            Array.isArray(parsedData[key]) && 
            parsedData[key].length > 0 && 
            parsedData[key][0].hasOwnProperty('name')
          );
          
          if (isOldStructure) {
            // Migrate old data
            const migratedData = migrateOldData(parsedData);
            setData(migratedData);
            console.log("Data migration completed successfully!");
          } else {
            throw new Error("Unknown data format in localStorage");
          }
        } else {
          throw new Error("Invalid data format in localStorage");
        }
      } else {
        // Check for old inventory key
        const oldSaved = localStorage.getItem("inventory");
        if (oldSaved) {
          const oldParsedData = JSON.parse(oldSaved);
          const migratedData = migrateOldData(oldParsedData);
          setData(migratedData);
          // Remove old key
          localStorage.removeItem("inventory");
          console.log("Migrated from old 'inventory' localStorage key!");
        } else {
          setData(initialData);
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setError("Failed to load saved data. Using default data.");
      setData(initialData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem("inventoryData", JSON.stringify(data));
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
        setError("Failed to save data changes.");
      }
    }
  }, [data]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving orders to localStorage:", error);
      setError("Failed to save orders.");
    }
  }, [orders]);

  // Load orders from localStorage on startup
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error("Error loading orders from localStorage:", error);
      setError("Failed to load saved orders.");
    }
  }, []);

  // Update inventory item
  const updateInventoryItem = (itemId, field, value) => {
    if (!data || !data.inventory) {
      setError("Invalid data structure");
      return;
    }

    try {
      const updatedData = { ...data };
      const itemIndex = updatedData.inventory.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        setError("Item not found");
        return;
      }

      updatedData.inventory[itemIndex] = {
        ...updatedData.inventory[itemIndex],
        [field]: value,
        updatedAt: new Date().toLocaleDateString()
      };
      
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setError(`Failed to update ${field}.`);
    }
  };

  // Add new inventory item
  const addInventoryItem = (supplierId, newItemName) => {
    if (!data || !data.suppliers || !data.suppliers[supplierId]) {
      setError("Invalid supplier");
      return;
    }

    try {
      const updatedData = { ...data };
      const newItemId = `item-${Date.now()}`;
      const newItem = {
        id: newItemId,
        name: newItemName,
        supplierId: supplierId,
        onHandQty: 0,
        quantity: 0,
        fixCount: 0,
        uom: "pieces",
        caseQty: 1,
        pricing: {
          unitCost: 0,
          casePrice: 0,
          lastUpdated: new Date().toLocaleDateString()
        },
        updatedAt: new Date().toLocaleDateString(),
      };

      updatedData.inventory.push(newItem);
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add new item.");
    }
  };

  // Advanced add inventory item with full data (for supplier management)
  const addInventoryItemFull = (supplierId, itemData) => {
    if (!data || !data.suppliers || !data.suppliers[supplierId]) {
      setError("Invalid supplier");
      return;
    }

    try {
      const updatedData = { ...data };
      const newItemId = `item-${Date.now()}`;
      const newItem = {
        id: newItemId,
        name: itemData.name,
        supplierId: supplierId,
        onHandQty: itemData.onHandQty || 0,
        quantity: itemData.quantity || 0,
        fixCount: itemData.fixCount || 0,
        uom: itemData.uom || "pieces",
        caseQty: itemData.caseQty || 1,
        image: itemData.image || null,
        pricing: itemData.pricing || {
          unitCost: 0,
          casePrice: 0,
          lastUpdated: new Date().toLocaleDateString()
        },
        updatedAt: new Date().toLocaleDateString(),
      };

      updatedData.inventory.push(newItem);
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add new item.");
    }
  };

  // Update inventory item with full data
  const updateInventoryItemFull = (itemId, itemData) => {
    if (!data || !data.inventory) {
      setError("Invalid data structure");
      return;
    }

    try {
      const updatedData = { ...data };
      const itemIndex = updatedData.inventory.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        setError("Item not found");
        return;
      }

      updatedData.inventory[itemIndex] = {
        ...updatedData.inventory[itemIndex],
        ...itemData,
        updatedAt: new Date().toLocaleDateString()
      };
      
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setError("Failed to update item.");
    }
  };

  // Delete inventory item
  const deleteInventoryItem = (itemId) => {
    if (!data || !data.inventory) {
      setError("Invalid data structure");
      return;
    }

    try {
      const updatedData = { ...data };
      updatedData.inventory = updatedData.inventory.filter(item => item.id !== itemId);
      
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item.");
    }
  };

  // Supplier CRUD operations
  const addSupplier = (supplierId, supplier) => {
    try {
      const updatedData = { ...data };
      updatedData.suppliers[supplierId] = supplier;
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      setError("Failed to add supplier.");
    }
  };

  const updateSupplier = (supplierId, updatedSupplier) => {
    try {
      const updatedData = { ...data };
      updatedData.suppliers[supplierId] = updatedSupplier;
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      setError("Failed to update supplier.");
    }
  };

  const deleteSupplier = (supplierId) => {
    try {
      const updatedData = { ...data };
      
      // Remove supplier
      delete updatedData.suppliers[supplierId];
      
      // Remove all inventory items for this supplier
      updatedData.inventory = updatedData.inventory.filter(item => item.supplierId !== supplierId);
      
      setData(updatedData);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setError("Failed to delete supplier.");
    }
  };

  // Order management functions
  const createOrder = (order) => {
    try {
      setOrders(prev => [...prev, order]);
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to create order.");
    }
  };

  const updateOrder = (orderId, updatedOrder) => {
    try {
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setError("Failed to update order.");
    }
  };

  // Auto-order creation function
  const handleAutoOrder = (supplierId, itemId, orderQuantity) => {
    try {
      const supplier = data.suppliers[supplierId];
      const item = data.inventory.find(inv => inv.id === itemId);
      
      if (!supplier || !item) return;

      // Check if there's already a pending auto-order for this supplier
      const existingAutoOrder = orders.find(order => 
        order.supplierId === supplierId && 
        order.status === 'pending' && 
        order.isAutoOrder
      );

      if (existingAutoOrder) {
        // Update existing auto-order
        const itemIndex = existingAutoOrder.items.findIndex(orderItem => orderItem.id === itemId);
        
        if (itemIndex >= 0) {
          // Update existing item in order
          const updatedItems = [...existingAutoOrder.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: orderQuantity,
            estimatedCost: (item.pricing?.casePrice || 0) * Math.ceil(orderQuantity / (item.caseQty || 1))
          };
          
          const updatedOrder = {
            ...existingAutoOrder,
            items: updatedItems,
            totalAmount: updatedItems.reduce((sum, orderItem) => sum + orderItem.estimatedCost, 0),
            updatedAt: new Date().toISOString()
          };
          
          updateOrder(existingAutoOrder.id, updatedOrder);
        } else {
          // Add new item to existing order
          const newItem = {
            ...item,
            quantity: orderQuantity,
            estimatedCost: (item.pricing?.casePrice || 0) * Math.ceil(orderQuantity / (item.caseQty || 1))
          };
          
          const updatedItems = [...existingAutoOrder.items, newItem];
          const updatedOrder = {
            ...existingAutoOrder,
            items: updatedItems,
            totalAmount: updatedItems.reduce((sum, orderItem) => sum + orderItem.estimatedCost, 0),
            updatedAt: new Date().toISOString()
          };
          
          updateOrder(existingAutoOrder.id, updatedOrder);
        }
      } else {
        // Create new auto-order
        const newItem = {
          ...item,
          quantity: orderQuantity,
          estimatedCost: (item.pricing?.casePrice || 0) * Math.ceil(orderQuantity / (item.caseQty || 1))
        };

        const autoOrder = {
          id: `auto-order-${Date.now()}`,
          supplierId: supplierId,
          supplierName: supplier.name,
          items: [newItem],
          status: 'pending',
          totalAmount: newItem.estimatedCost,
          orderDate: new Date().toLocaleDateString(),
          expectedDelivery: '',
          priority: 'medium',
          notes: 'Auto-generated order based on fix count levels',
          isAutoOrder: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        createOrder(autoOrder);
      }
      
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error creating auto-order:", error);
      setError("Failed to create auto-order.");
    }
  };

  // Helper function to get stock status
  const getStockStatus = (onHandQty) => {
    if (onHandQty === 0) return 'out';
    if (onHandQty <= 5) return 'low';
    if (onHandQty <= 20) return 'medium';
    return 'good';
  };

  // Group inventory by supplier for the inventory view
  const getInventoryBySupplier = () => {
    if (!data || !data.inventory || !data.suppliers) return {};
    
    const grouped = {};
    data.inventory.forEach(item => {
      const supplier = data.suppliers[item.supplierId];
      if (supplier) {
        if (!grouped[supplier.name]) {
          grouped[supplier.name] = [];
        }
        grouped[supplier.name].push(item);
      }
    });
    
    return grouped;
  };

  // Filter and search logic
  const filteredInventory = useMemo(() => {
    console.log("Filtering inventory with:", { searchQuery, selectedSuppliers, selectedStatuses, selectedUOMs });
    
    if (!data || !data.inventory || !data.suppliers) {
      console.log("No data available");
      return {};
    }

    try {
      let filteredItems = [...data.inventory];
      console.log("Starting with inventory:", filteredItems.length, "items");

      // Apply search filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        console.log("Applying search filter for:", query);
        
        filteredItems = filteredItems.filter(item => {
          if (!item) {
            console.log("Skipping null/undefined item");
            return false;
          }
          
          try {
            const itemName = (item.name || '').toLowerCase();
            const supplier = data.suppliers[item.supplierId];
            const supplierName = supplier ? supplier.name.toLowerCase() : '';
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
        
        console.log("After search filter:", filteredItems.length, "items");
      }

      // Apply supplier filter
      if (selectedSuppliers.length > 0) {
        console.log("Applying supplier filter for:", selectedSuppliers);
        filteredItems = filteredItems.filter(item => {
          const supplier = data.suppliers[item.supplierId];
          return supplier && selectedSuppliers.includes(supplier.name);
        });
        console.log("After supplier filter:", filteredItems.length, "items");
      }

      // Apply status filter
      if (selectedStatuses.length > 0) {
        console.log("Applying status filter for:", selectedStatuses);
        filteredItems = filteredItems.filter(item => {
          if (!item) return false;
          try {
            const status = getStockStatus(item.onHandQty || 0);
            return selectedStatuses.includes(status);
          } catch (statusError) {
            console.error("Error getting stock status:", statusError, item);
            return false;
          }
        });
        console.log("After status filter:", filteredItems.length, "items");
      }

      // Apply UOM filter
      if (selectedUOMs.length > 0) {
        console.log("Applying UOM filter for:", selectedUOMs);
        filteredItems = filteredItems.filter(item => {
          if (!item) return false;
          try {
            return selectedUOMs.includes(item.uom || 'pieces');
          } catch (uomError) {
            console.error("Error checking UOM:", uomError, item);
            return false;
          }
        });
        console.log("After UOM filter:", filteredItems.length, "items");
      }

      // Group filtered items by supplier
      const grouped = {};
      filteredItems.forEach(item => {
        const supplier = data.suppliers[item.supplierId];
        if (supplier) {
          if (!grouped[supplier.name]) {
            grouped[supplier.name] = [];
          }
          grouped[supplier.name].push(item);
        }
      });

      console.log("Final filtered result:", Object.keys(grouped));
      return grouped;
    } catch (error) {
      console.error("Error in filtering logic:", error);
      console.log("Returning original inventory due to error");
      return getInventoryBySupplier();
    }
  }, [data, searchQuery, selectedSuppliers, selectedStatuses, selectedUOMs]);

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
      if (!data || !data.inventory || !data.suppliers) {
        return { suppliers: 0, items: 0, onHand: 0, toOrder: 0, lowStock: 0, outOfStock: 0 };
      }

      const filteredItems = Object.values(filteredInventory).flat();
      const suppliers = Object.keys(filteredInventory).length;
      const items = filteredItems.length;
      const onHand = filteredItems.reduce((total, item) => total + (item?.onHandQty || 0), 0);
      const toOrder = filteredItems.reduce((total, item) => total + (item?.quantity || 0), 0);
      const lowStock = filteredItems.filter(item => item && (item.onHandQty || 0) <= 5 && (item.onHandQty || 0) > 0).length;
      const outOfStock = filteredItems.filter(item => item && (item.onHandQty || 0) === 0).length;

      return { suppliers, items, onHand, toOrder, lowStock, outOfStock };
    } catch (error) {
      console.error("Error calculating filtered stats:", error);
      return { suppliers: 0, items: 0, onHand: 0, toOrder: 0, lowStock: 0, outOfStock: 0 };
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

  if (!data) {
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
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Mobile Responsive */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo/Brand */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">🍽️</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Invotraq</h1>
              <p className="text-xs text-slate-400">Restaurant System</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="text-slate-400 text-lg">✕</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3 pb-20">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false); // Close mobile menu on selection
                }}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
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

      {/* Main Content - Responsive */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors mr-3"
              >
                <span className="text-slate-300 text-xl">☰</span>
              </button>
              
              <div>
                <h1 className="text-xl lg:text-2xl font-semibold text-white">
                  {activeTab === 'inventory' && 'Inventory Management'}
                  {activeTab === 'suppliers' && 'Supplier Management'}
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'orders' && 'Orders'}
                  {activeTab === 'reports' && 'Reports'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-slate-400 text-sm hidden sm:block">
                  {activeTab === 'inventory' && 'Manage your inventory items, track stock levels, and handle orders.'}
                  {activeTab === 'suppliers' && 'Manage your suppliers, contacts, and business terms.'}
                  {activeTab === 'dashboard' && 'Overview of your restaurant inventory system.'}
                  {activeTab === 'orders' && 'Manage purchase orders and supplier communications.'}
                  {activeTab === 'reports' && 'View reports and analytics for your inventory.'}
                  {activeTab === 'settings' && 'Configure system settings and preferences.'}
                </p>
              </div>
            </div>
            
            {/* Header Actions - Mobile Responsive */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <button className="hidden sm:flex px-3 lg:px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                Export
              </button>
              <button className="hidden sm:flex px-3 lg:px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                Import
              </button>
              <button className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation">
                <span className="hidden sm:inline">
                  {activeTab === 'inventory' && '+ Add Item'}
                  {activeTab === 'suppliers' && '+ Add Supplier'}
                  {activeTab !== 'inventory' && activeTab !== 'suppliers' && '+ Add'}
                </span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </header>

        {/* Alert Banner - Mobile Responsive */}
        {(stats.lowStock > 0 || stats.outOfStock > 0) && activeTab === 'inventory' && (
          <div className="bg-yellow-900/50 border border-yellow-600 mx-4 lg:mx-6 mt-4 p-3 lg:p-4 rounded-lg">
            <div className="flex items-start lg:items-center">
              <span className="text-yellow-500 mr-2 flex-shrink-0">⚠️</span>
              <div className="text-yellow-200">
                <span className="font-medium">Attention needed</span>
                <p className="text-sm text-yellow-300 mt-1 lg:mt-0">
                  {stats.lowStock} items are low in stock and {stats.outOfStock} item{stats.outOfStock !== 1 ? 's' : ''} {stats.outOfStock === 1 ? 'is' : 'are'} out of stock. Consider reordering soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Mobile Responsive */}
        <div className="px-4 lg:px-6 pb-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="py-6">
              {/* Welcome Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
                <h2 className="text-3xl font-bold mb-2">🍽️ Welcome to Invotraq</h2>
                <p className="text-blue-100">Your complete restaurant inventory management solution</p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-400">{data?.suppliers ? Object.keys(data.suppliers).length : 0}</div>
                      <div className="text-slate-400">Suppliers</div>
                    </div>
                    <div className="text-3xl">🏭</div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-slate-100">{data?.inventory ? data.inventory.length : 0}</div>
                      <div className="text-slate-400">Items</div>
                    </div>
                    <div className="text-3xl">📦</div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-orange-400">
                        {data?.inventory ? data.inventory.filter(item => (item.onHandQty || 0) <= 5 && (item.onHandQty || 0) > 0).length : 0}
                      </div>
                      <div className="text-slate-400">Low Stock</div>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-red-400">
                        {data?.inventory ? data.inventory.filter(item => (item.onHandQty || 0) === 0).length : 0}
                      </div>
                      <div className="text-slate-400">Out of Stock</div>
                    </div>
                    <div className="text-3xl">🚨</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📦</span>
                    <div>
                      <div className="font-semibold">Manage Inventory</div>
                      <div className="text-blue-200 text-sm">View and update stock levels</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('suppliers')}
                  className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏭</span>
                    <div>
                      <div className="font-semibold">Manage Suppliers</div>
                      <div className="text-green-200 text-sm">Add and edit supplier information</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <div className="font-semibold">View Reports</div>
                      <div className="text-purple-200 text-sm">Analyze inventory trends</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Inventory Tab - Keep existing functionality */}
          {activeTab === 'inventory' && (
            <>
              {/* Search and Filters - Mobile Responsive */}
              <div className="py-4">
                <SearchAndFilters
                  inventory={getInventoryBySupplier()}
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

              {/* Results Summary - Mobile Responsive */}
              {hasActiveFilters && (
                <div className="mb-4 bg-blue-900/50 border border-blue-600 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-blue-200">
                      <span className="font-medium">Filtered Results:</span>
                      <span className="ml-2">{stats.suppliers} suppliers, {stats.items} items</span>
                    </div>
                    <button
                      onClick={() => applyQuickFilter('clear')}
                      className="text-blue-300 hover:text-blue-100 text-sm underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}

              {/* Statistics Dashboard - Mobile Responsive */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
                <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-700">
                  <div className="text-2xl lg:text-3xl font-bold text-blue-400">{stats.suppliers}</div>
                  <div className="text-xs lg:text-sm text-slate-400">Suppliers</div>
                </div>
                <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-700">
                  <div className="text-2xl lg:text-3xl font-bold text-slate-100">{stats.items}</div>
                  <div className="text-xs lg:text-sm text-slate-400">Items</div>
                </div>
                <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-700">
                  <div className="text-2xl lg:text-3xl font-bold text-green-400">{stats.onHand}</div>
                  <div className="text-xs lg:text-sm text-slate-400">On Hand</div>
                </div>
                <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-700">
                  <div className="text-2xl lg:text-3xl font-bold text-blue-400">{stats.toOrder}</div>
                  <div className="text-xs lg:text-sm text-slate-400">To Order</div>
                </div>
                <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-700">
                  <div className="text-2xl lg:text-3xl font-bold text-orange-400">{stats.lowStock}</div>
                  <div className="text-xs lg:text-sm text-slate-400">Low Stock</div>
                </div>
                <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-700">
                  <div className="text-2xl lg:text-3xl font-bold text-red-400">{stats.outOfStock}</div>
                  <div className="text-xs lg:text-sm text-slate-400">Out of Stock</div>
                </div>
              </div>

              {/* Field Reference Guide - Mobile Responsive */}
              <div className="mb-6">
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">📚 Field Reference Guide</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-2xl mr-3">🎯</span>
                      <div>
                        <div className="font-medium text-slate-100">Fix Count</div>
                        <div className="text-sm text-slate-400">Minimum stock level that should always be maintained</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-2xl mr-3">📊</span>
                      <div>
                        <div className="font-medium text-slate-100">On Hand</div>
                        <div className="text-sm text-slate-400">Current stock quantity in inventory</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-2xl mr-3">📦</span>
                      <div>
                        <div className="font-medium text-slate-100">Order (Auto)</div>
                        <div className="text-sm text-slate-400">Auto-calculated order quantity based on fix count</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-2xl mr-3">📁</span>
                      <div>
                        <div className="font-medium text-slate-100">Case</div>
                        <div className="text-sm text-slate-400">Case quantities for packaging/ordering</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-2xl mr-3">📏</span>
                      <div>
                        <div className="font-medium text-slate-100">UOM</div>
                        <div className="text-sm text-slate-400">Unit of Measure (pieces, lbs, gallons, bottles, etc.)</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                    <div className="text-sm text-green-200">
                      <span className="font-medium">🚀 Auto-Order System:</span> Set Fix Count → Update On Hand → System auto-calculates Order quantity → Auto-orders created when needed!
                    </div>
                  </div>
                  <div className="mt-2 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                    <div className="text-sm text-blue-200">
                      <span className="font-medium">💡 Pro Tip:</span> Use the search bar to find items by name, supplier, or unit. 
                      Use quick filters to view items by stock status (Out of Stock, Low Stock, In Stock).
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Cards */}
              <div className="space-y-6">
                {Object.entries(filteredInventory).map(([supplierName, items]) => (
                  <SupplierCard
                    key={supplierName}
                    supplier={supplierName}
                    items={items}
                    onUpdateQuantity={updateInventoryItem}
                    onAddItem={addInventoryItem}
                    supplierId={items[0]?.supplierId}
                    onAutoOrder={handleAutoOrder}
                  />
                ))}
              </div>

              {Object.keys(filteredInventory).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No inventory items found</h3>
                  <p className="text-slate-400 mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your search or filters to see more items." 
                      : "Add your first inventory item to get started."
                    }
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => applyQuickFilter('clear')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <SupplierManagement
              suppliers={data.suppliers || {}}
              inventory={data.inventory || []}
              onUpdateSupplier={updateSupplier}
              onAddSupplier={addSupplier}
              onDeleteSupplier={deleteSupplier}
              onAddItem={addInventoryItemFull}
              onUpdateItem={updateInventoryItemFull}
              onDeleteItem={deleteInventoryItem}
            />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrderManagement
              suppliers={data?.suppliers || {}}
              inventory={data?.inventory || []}
              orders={orders}
              onCreateOrder={createOrder}
              onUpdateOrder={updateOrder}
              onUpdateInventory={updateInventoryItem}
            />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="py-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">�</div>
                <h3 className="text-2xl font-semibold text-slate-100 mb-4">Reports & Analytics</h3>
                <p className="text-slate-400 mb-6">Analyze your inventory data and trends</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="text-3xl mb-3">📈</div>
                    <h4 className="font-semibold text-slate-100 mb-2">Inventory Trends</h4>
                    <p className="text-slate-400 text-sm">Track inventory levels over time</p>
                  </div>
                  
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="text-3xl mb-3">💸</div>
                    <h4 className="font-semibold text-slate-100 mb-2">Cost Reports</h4>
                    <p className="text-slate-400 text-sm">Analyze spending patterns</p>
                  </div>
                  
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="text-3xl mb-3">⚡</div>
                    <h4 className="font-semibold text-slate-100 mb-2">Performance Metrics</h4>
                    <p className="text-slate-400 text-sm">Monitor key performance indicators</p>
                  </div>
                </div>

                <button className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="py-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-2xl font-semibold text-slate-100 mb-4">System Settings</h3>
                <p className="text-slate-400 mb-6">Configure your inventory system preferences</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="text-3xl mb-3">👤</div>
                    <h4 className="font-semibold text-slate-100 mb-2">User Management</h4>
                    <p className="text-slate-400 text-sm">Manage user accounts and permissions</p>
                  </div>
                  
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="text-3xl mb-3">🔔</div>
                    <h4 className="font-semibold text-slate-100 mb-2">Notifications</h4>
                    <p className="text-slate-400 text-sm">Configure alerts and notifications</p>
                  </div>
                  
                  <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="text-3xl mb-3">💾</div>
                    <h4 className="font-semibold text-slate-100 mb-2">Data Management</h4>
                    <p className="text-slate-400 text-sm">Backup and export your data</p>
                  </div>
                </div>

                <div className="mt-6 space-x-4">
                  <button className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    Export Data
                  </button>
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    System Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
