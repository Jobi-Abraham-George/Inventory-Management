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
    if (onHandQty === 0) return { 
      status: 'out', 
      color: 'text-red-400', 
      bg: 'bg-red-900/30',
      dot: 'bg-red-500',
      border: 'border-red-600',
      inputBg: 'bg-red-900/20',
      inputText: 'text-red-300'
    };
    if (onHandQty <= 5) return { 
      status: 'low', 
      color: 'text-orange-400', 
      bg: 'bg-orange-900/30',
      dot: 'bg-orange-500',
      border: 'border-orange-600',
      inputBg: 'bg-orange-900/20',
      inputText: 'text-orange-300'
    };
    return { 
      status: 'good', 
      color: 'text-green-400', 
      bg: 'bg-green-900/30',
      dot: 'bg-green-500',
      border: 'border-green-600',
      inputBg: 'bg-slate-800',
      inputText: 'text-slate-100'
    };
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

  const getItemEmoji = (itemName) => {
    const emojis = {
      // Cash n Carry items
      'Burger buns': '🍔',
      'Ketchup gallon': '🍅',
      'Mustard Sauce': '🟡',
      'Pickles for burger': '🥒',
      'Beef tubes': '🥩',
      'Brothers pepperoni': '🍕',
      'Potato wedges': '🍟',
      
      // Veggie Order items
      'Green peppers': '🫑',
      'Tomatoes': '🍅',
      'Mushrooms': '🍄',
      'Onions': '🧅',
      'Cucumbers': '🥒',
      'Lettuce Iceberg': '🥬',
      'Romanian lettuce': '🥬',
      
      // Saputo Order items
      'Pizza flour': '🌾',
      'Crushed Tomatoes': '🍅',
      'Evaporated milk': '🥛',
      'Pineapple': '🍍',
      'Black Olives': '🫒',
      'Croutons': '🍞',
      'Vinegar': '🧴',
      'Black Pepper': '🌶️',
      'Hot Peppers': '🌶️',
      'Salt': '🧂',
      'Oregano': '🌿',
      'Honey garlic sauce': '🍯',
      'Hot Sauce': '🌶️',
      'Medium Sauce': '🌶️',
      'Mild Sauce': '🌶️',
      'Mozzarella cheese': '🧀',
      'Cheese curds': '🧀',
      'Cheddar cheese': '🧀',
      'Feta cheese': '🧀',
      'Cheddar shredded cheese': '🧀',
      'Tartar sauce': '🐟',
      'Sweet & Sour': '🍯',
      'Sour Cream': '🥛',
      'Ketchup Pots': '🍅',
      'Nachos': '🌮',
      'Bacon bits': '🥓',
      'Wings': '🍗',
      'Ham chopped': '🐷',
      'Beef': '🥩',
      'Pepperoni': '🍕',
      'Salami': '🥩',
      'Chicken fingers': '🍗',
      'Lasagna': '🍝',
      'Seasoned chicken (white)': '🍗',
      'Zesty chicken (spicy)': '🍗',
      'Italian Sausage': '🌭',
      'Gluten free crust': '🍕',
      'Egg Rolls Sheet': '🥟',
      'Bacon crumbled': '🥓',
      'Vegan Pepperoni': '🌱',
      'Stuffed crust cheese': '🧀',
      'Parmesan cheese': '🧀',
      'Garlic Spread': '🧄',
      'Paper plates': '🍽️',
      '12LB bags for dough': '🌾',
      'Fork & Knife': '🍴',
      'Boxes': '📦',
      
      // Sysco Order items
      'Fries': '🍟',
      'Philly steak': '🥩',
      'Onion Rings': '🧅',
      'Mozza sticks': '🧀',
      'Spicy Chicken Breast': '🍗',
      'Deep fried pickles': '🥒',
      'Jalapeno poppers': '🌶️',
      'Choco lava cake': '🍰',
      'Cheesecake': '🍰',
      'Sliced Turkey': '🦃',
      'Sliced Ham': '🐷',
      'Batter mix (for fish)': '🐟',
      'Oil': '🛢️',
      'Gravy mix (beef)': '🍖',
      'BBQ sauce (Bullseye)': '🍖',
      'Ranch Sauce': '🥗',
      'Mayo': '🥪',
      'Greek dressing': '🥗',
      'Salt Pots': '🧂',
      'Black Pepper Pots': '🌶️',
      'Drinks': '🥤',
      'Parchment paper (Sm & Lg)': '📄',
      
      // Maroon Order items
      '4oz fish': '🐟',
      'Donair Cones': '🌯',
      '60oz Paper cups & lids': '🥤',
      '3-25 oz Cups & Lids': '🥤',
      '5LB paper bags': '📦',
      '10LB Paper bags': '📦',
      '14LB Paper bags': '📦',
      '20LB Paper Bags': '📦',
      'Aluminium Small & Large Foils': '🛡️',
      '8x8 Containers': '📦',
      '9x6 Containers': '📦',
      '6x6 Containers': '📦',
      'Small aluminium containers & lids': '📦',
      'Lg aluminium containers & lids': '📦',
      
      // Fancy Lebanese items
      'Lg Subs': '🥙',
      'Small Subs': '🥙',
      '9" Pita (Super)': '🫓',
      '8" Pita (Lg & Md)': '🫓',
      '6" Pita (Sm)': '🫓',
      'Toast': '🍞'
    };
    return emojis[itemName] || '🍽️';
  };

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + (item.onHandQty || 0), 0);
  const lowStockItems = items.filter(item => (item.onHandQty || 0) <= 5).length;
  const outOfStockItems = items.filter(item => (item.onHandQty || 0) === 0).length;

  return (
    <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 overflow-hidden">
      {/* Professional Header */}
      <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">{getSupplierIcon(supplier)}</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-slate-100">{supplier}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {totalItems} items
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span>
                  {totalStock} total stock
                </span>
                {lowStockItems > 0 && (
                  <span className="flex items-center text-orange-400 font-medium">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {lowStockItems} low stock
                  </span>
                )}
                {outOfStockItems > 0 && (
                  <span className="flex items-center text-red-400 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {outOfStockItems} out of stock
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <span className={`transform transition-transform duration-200 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Professional Table Layout */}
      {isExpanded && (
        <div>
          {/* Desktop Table Layout */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-750 border-b border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID ↑↓</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name ↑↓</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">On Hand ↑↓</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Order ↑↓</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Case ↑↓</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">UOM ↑↓</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {items.map((item, index) => {
                  const stockStatus = getStockStatus(item.onHandQty || 0);
                  return (
                    <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-300 font-mono">
                        INV-{String(index + 1).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3 min-w-0">
                        <div className="flex items-center">
                          <span className="text-lg mr-3 flex-shrink-0">{getItemEmoji(item.name)}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-100 truncate">{item.name}</div>
                            <div className="text-xs text-slate-400">
                              {item.updatedAt ? `Updated: ${item.updatedAt}` : "Never updated"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.onHandQty || ''}
                          onChange={(e) => handleFieldChange(index, 'onHandQty', e.target.value)}
                          className={`w-16 px-2 py-1 text-sm text-center rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            stockStatus.status === 'out' ? 'border-red-600 bg-red-900/20 text-red-300' :
                            stockStatus.status === 'low' ? 'border-orange-600 bg-orange-900/20 text-orange-300' :
                            'border-slate-600 bg-slate-700 text-slate-100'
                          }`}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1 text-sm text-center rounded border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.caseQty || ''}
                          onChange={(e) => handleFieldChange(index, 'caseQty', e.target.value)}
                          className="w-16 px-2 py-1 text-sm text-center rounded border border-slate-600 bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={item.uom || 'pieces'}
                          onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                          className="w-20 px-1 py-1 text-xs border border-slate-600 bg-slate-700 text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stockStatus.status === 'out' ? 'bg-red-600 text-red-100' :
                          stockStatus.status === 'low' ? 'bg-orange-600 text-orange-100' :
                          'bg-green-600 text-green-100'
                        }`}>
                          {stockStatus.status === 'out' ? 'Out of Stock' :
                           stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="block lg:hidden">
            <div className="space-y-4 p-4">
              {items.map((item, index) => {
                const stockStatus = getStockStatus(item.onHandQty || 0);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${stockStatus.bg} ${stockStatus.border}`}
                  >
                    {/* Mobile Item Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-2xl mr-3 flex-shrink-0">{getItemEmoji(item.name)}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-semibold text-slate-100 leading-tight">{item.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            ID: INV-{String(index + 1).padStart(3, '0')} • {item.updatedAt ? `Updated: ${item.updatedAt}` : "Never updated"}
                          </p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${stockStatus.dot} ml-3 flex-shrink-0`}></div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stockStatus.status === 'out' ? 'bg-red-600 text-red-100' :
                        stockStatus.status === 'low' ? 'bg-orange-600 text-orange-100' :
                        'bg-green-600 text-green-100'
                      }`}>
                        {stockStatus.status === 'out' ? 'Out of Stock' :
                         stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                    
                    {/* Mobile Input Grid - Optimized for Touch */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">📊 On Hand</label>
                        <input
                          type="number"
                          min="0"
                          value={item.onHandQty || ''}
                          onChange={(e) => handleFieldChange(index, 'onHandQty', e.target.value)}
                          className={`w-full px-4 py-4 text-lg border-2 rounded-xl text-center font-bold focus:outline-none focus:ring-3 focus:ring-blue-500 transition-all touch-manipulation ${
                            stockStatus.status === 'out' ? 'border-red-600 bg-red-900/20 text-red-300' :
                            stockStatus.status === 'low' ? 'border-orange-600 bg-orange-900/20 text-orange-300' :
                            'border-slate-600 bg-slate-700 text-slate-100'
                          }`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">📦 Order</label>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                          className="w-full px-4 py-4 text-lg border-2 border-slate-600 bg-slate-700 rounded-xl text-center font-bold text-slate-100 focus:outline-none focus:ring-3 focus:ring-blue-500 transition-all touch-manipulation"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">📁 Case</label>
                        <input
                          type="number"
                          min="1"
                          value={item.caseQty || ''}
                          onChange={(e) => handleFieldChange(index, 'caseQty', e.target.value)}
                          className="w-full px-4 py-4 text-lg border-2 border-slate-600 bg-slate-700 rounded-xl text-center font-bold text-slate-100 focus:outline-none focus:ring-3 focus:ring-blue-500 transition-all touch-manipulation"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">📏 UOM</label>
                        <select
                          value={item.uom || 'pieces'}
                          onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                          className="w-full px-4 py-4 text-base border-2 border-slate-600 bg-slate-700 text-slate-100 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 transition-all touch-manipulation"
                        >
                          <option value="pieces">Pieces</option>
                          <option value="lbs">Pounds</option>
                          <option value="gallons">Gallons</option>
                          <option value="bottles">Bottles</option>
                          <option value="jars">Jars</option>
                          <option value="packages">Packages</option>
                          <option value="bags">Bags</option>
                          <option value="heads">Heads</option>
                          <option value="cans">Cans</option>
                          <option value="containers">Containers</option>
                          <option value="trays">Trays</option>
                          <option value="sheets">Sheets</option>
                          <option value="sets">Sets</option>
                          <option value="loaves">Loaves</option>
                          <option value="cases">Cases</option>
                          <option value="rolls">Rolls</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Add New Item - Mobile Optimized */}
          <div className="bg-slate-700 px-4 py-4 border-t border-slate-600">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 lg:py-2 text-base lg:text-sm border border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition-all touch-manipulation"
                maxLength={100}
              />
              <button
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="px-6 py-3 lg:py-2 bg-blue-600 text-white text-base lg:text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">+</span>
                  <span>Add Item</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
