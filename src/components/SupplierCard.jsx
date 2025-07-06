import { useState } from "react";

export default function SupplierCard({ supplier, items, onUpdateQuantity, onAddItem }) {
  const [newItem, setNewItem] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleQuantityChange = (e, index) => {
    const value = e.target.value;
    // Handle empty input
    if (value === "") {
      onUpdateQuantity(supplier, index, 0);
      return;
    }
    
    // Parse and validate the number
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      // Don't update if it's not a valid number
      return;
    }
    
    // Ensure non-negative values
    const quantity = Math.max(0, parsedValue);
    onUpdateQuantity(supplier, index, quantity);
  };

  const handleAddItem = () => {
    const trimmedItem = newItem.trim();
    if (trimmedItem && trimmedItem.length > 0) {
      onAddItem(supplier, trimmedItem);
      setNewItem("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800' };
    if (quantity <= 5) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800' };
    if (quantity <= 20) return { status: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-800' };
  };

  const getSupplierIcon = (supplierName) => {
    const icons = {
      'Cash n Carry': '🏪',
      'Veggie Order': '🥬',
      'Saputo Order': '🧀',
      'Sysco Order': '🍟',
      'Maroon Order': '🐟',
      'Fancy Lebanese': '🥙'
    };
    return icons[supplierName] || '📦';
  };

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockItems = items.filter(item => (item.quantity || 0) <= 5).length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">{getSupplierIcon(supplier)}</span>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{supplier}</h2>
              <p className="text-sm text-gray-600">{totalItems} items • {totalStock} units</p>
            </div>
          </div>
          
          {/* Stats badges */}
          <div className="flex items-center space-x-2">
            {lowStockItems > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {lowStockItems} low stock
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Items List */}
          <div className="space-y-3 mb-6">
            {items.map((item, index) => {
              const stockStatus = getStockStatus(item.quantity || 0);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                    stockStatus.status === 'out' ? 'border-red-200 bg-red-50' :
                    stockStatus.status === 'low' ? 'border-orange-200 bg-orange-50' :
                    'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 truncate">{item.name}</span>
                      {item.quantity === 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                      {item.quantity > 0 && item.quantity <= 5 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.updatedAt ? `Updated: ${item.updatedAt}` : "Never updated"}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 mr-2">Qty:</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleQuantityChange(e, index)}
                          className={`w-20 px-3 py-2 border rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            stockStatus.status === 'out' ? 'border-red-300 bg-red-50' :
                            stockStatus.status === 'low' ? 'border-orange-300 bg-orange-50' :
                            'border-gray-300 bg-white'
                          }`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    {/* Stock level indicator */}
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        stockStatus.status === 'out' ? 'bg-red-500' :
                        stockStatus.status === 'low' ? 'bg-orange-500' :
                        stockStatus.status === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Item */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add new item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span className="flex items-center">
                  <span className="mr-2">+</span>
                  Add
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
