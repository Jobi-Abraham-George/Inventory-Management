import { useState } from "react";

export default function SupplierCard({ supplier, items, onUpdateQuantity, onAddItem }) {
  const [newItem, setNewItem] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (index, field, value) => {
    const parsedValue = field === 'uom' ? value : (value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0));
    onUpdateQuantity(supplier, index, field, parsedValue);
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

  const getStockStatus = (onHandQty) => {
    if (onHandQty === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-800' };
    if (onHandQty <= 5) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800' };
    if (onHandQty <= 20) return { status: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800' };
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
  const totalStock = items.reduce((sum, item) => sum + (item.onHandQty || 0), 0);
  const lowStockItems = items.filter(item => (item.onHandQty || 0) <= 5).length;

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
              <p className="text-sm text-gray-600">{totalItems} items • {totalStock} units on hand</p>
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
          {/* Table Header */}
          <div className="mb-4">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-600 uppercase tracking-wide pb-3 border-b border-gray-200">
              <div className="col-span-4">Item Name</div>
              <div className="col-span-1 text-center">On Hand</div>
              <div className="col-span-1 text-center">Build</div>
              <div className="col-span-1 text-center">Order</div>
              <div className="col-span-2 text-center">UOM</div>
              <div className="col-span-2 text-center">Case Qty</div>
              <div className="col-span-1 text-center">Status</div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3 mb-6">
            {items.map((item, index) => {
              const stockStatus = getStockStatus(item.onHandQty || 0);
              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-3 p-4 rounded-lg border transition-all duration-200 items-center ${
                    stockStatus.status === 'out' ? 'border-red-200 bg-red-50' :
                    stockStatus.status === 'low' ? 'border-orange-200 bg-orange-50' :
                    'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Item Name */}
                  <div className="col-span-4">
                    <div className="font-semibold text-gray-900 text-sm mb-1">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.updatedAt ? `Updated: ${item.updatedAt}` : "Never updated"}
                    </div>
                  </div>
                  
                  {/* On Hand Qty */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      value={item.onHandQty || ''}
                      onChange={(e) => handleFieldChange(index, 'onHandQty', e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-md text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        stockStatus.status === 'out' ? 'border-red-300 bg-red-50' :
                        stockStatus.status === 'low' ? 'border-orange-300 bg-orange-50' :
                        'border-gray-300 bg-white'
                      }`}
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Build Qty */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      value={item.buildQty || ''}
                      onChange={(e) => handleFieldChange(index, 'buildQty', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Order Qty */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity || ''}
                      onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* UOM */}
                  <div className="col-span-2">
                    <select
                      value={item.uom || 'pieces'}
                      onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="pieces">pieces</option>
                      <option value="lbs">lbs</option>
                      <option value="gallons">gallons</option>
                      <option value="bottles">bottles</option>
                      <option value="jars">jars</option>
                      <option value="packages">packages</option>
                      <option value="bags">bags</option>
                      <option value="heads">heads</option>
                      <option value="cans">cans</option>
                      <option value="containers">containers</option>
                      <option value="trays">trays</option>
                      <option value="sheets">sheets</option>
                      <option value="sets">sets</option>
                      <option value="loaves">loaves</option>
                      <option value="cases">cases</option>
                      <option value="rolls">rolls</option>
                    </select>
                  </div>
                  
                  {/* Case Qty */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.caseQty || ''}
                      onChange={(e) => handleFieldChange(index, 'caseQty', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="1"
                    />
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="col-span-1 flex justify-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className={`w-4 h-4 rounded-full ${
                        stockStatus.status === 'out' ? 'bg-red-500' :
                        stockStatus.status === 'low' ? 'bg-orange-500' :
                        stockStatus.status === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      {item.onHandQty === 0 && (
                        <span className="text-xs text-red-600 font-medium">OUT</span>
                      )}
                      {item.onHandQty > 0 && item.onHandQty <= 5 && (
                        <span className="text-xs text-orange-600 font-medium">LOW</span>
                      )}
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
