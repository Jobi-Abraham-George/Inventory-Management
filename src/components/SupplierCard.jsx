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
      color: 'text-red-700', 
      bg: 'bg-red-50',
      dot: 'bg-red-500',
      border: 'border-red-300'
    };
    if (onHandQty <= 5) return { 
      status: 'low', 
      color: 'text-orange-700', 
      bg: 'bg-orange-50',
      dot: 'bg-orange-500',
      border: 'border-orange-300'
    };
    return { 
      status: 'good', 
      color: 'text-green-700', 
      bg: 'bg-green-50',
      dot: 'bg-green-500',
      border: 'border-green-300'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile-Optimized Header */}
      <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">{getSupplierIcon(supplier)}</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-base font-semibold text-gray-900">{supplier}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  {totalItems} items
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                  {totalStock} stock
                </span>
                {lowStockItems > 0 && (
                  <span className="flex items-center text-orange-600 font-medium">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                    {lowStockItems} low
                  </span>
                )}
                {outOfStockItems > 0 && (
                  <span className="flex items-center text-red-600 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    {outOfStockItems} out
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
          >
            <span className={`transform transition-transform duration-200 text-sm ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Mobile-First Responsive Content */}
      {isExpanded && (
        <div>
          {/* Mobile Card Layout (default) */}
          <div className="block lg:hidden">
            <div className="space-y-3 p-3">
              {items.map((item, index) => {
                const stockStatus = getStockStatus(item.onHandQty || 0);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${stockStatus.bg} ${stockStatus.border}`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-lg mr-2 flex-shrink-0">{getItemEmoji(item.name)}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-500">
                            {item.updatedAt ? `Updated: ${item.updatedAt}` : "Never updated"}
                          </p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${stockStatus.dot} ml-2`}></div>
                    </div>
                    
                    {/* Mobile Input Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">On Hand</label>
                        <input
                          type="number"
                          min="0"
                          value={item.onHandQty || ''}
                          onChange={(e) => handleFieldChange(index, 'onHandQty', e.target.value)}
                          className={`w-full px-3 py-3 text-base border-2 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation ${
                            stockStatus.status === 'out' ? 'border-red-300 bg-red-50 text-red-700' :
                            stockStatus.status === 'low' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                            'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Build</label>
                        <input
                          type="number"
                          min="0"
                          value={item.buildQty || ''}
                          onChange={(e) => handleFieldChange(index, 'buildQty', e.target.value)}
                          className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Case</label>
                        <input
                          type="number"
                          min="1"
                          value={item.caseQty || ''}
                          onChange={(e) => handleFieldChange(index, 'caseQty', e.target.value)}
                          className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                          placeholder="1"
                        />
                      </div>
                    </div>
                    
                    {/* UOM Selector */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit of Measure</label>
                      <select
                        value={item.uom || 'pieces'}
                        onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                        className="w-full px-3 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
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
                );
              })}
            </div>
          </div>

          {/* Desktop Table Layout (hidden on mobile) */}
          <div className="hidden lg:block">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Hand</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Build</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Case</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => {
                  const stockStatus = getStockStatus(item.onHandQty || 0);
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 min-w-0">
                        <div className="flex items-center">
                          <span className="text-sm mr-2 flex-shrink-0">{getItemEmoji(item.name)}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">
                              {item.updatedAt ? `Updated: ${item.updatedAt}` : "Never updated"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center w-20">
                        <input
                          type="number"
                          min="0"
                          value={item.onHandQty || ''}
                          onChange={(e) => handleFieldChange(index, 'onHandQty', e.target.value)}
                          className={`w-full px-1 py-1 text-xs border rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                            stockStatus.status === 'out' ? 'border-red-300 bg-red-50 text-red-700' :
                            stockStatus.status === 'low' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                            'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 text-center w-20">
                        <input
                          type="number"
                          min="0"
                          value={item.buildQty || ''}
                          onChange={(e) => handleFieldChange(index, 'buildQty', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 text-center w-20">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2 text-center w-20">
                        <select
                          value={item.uom || 'pieces'}
                          onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                          className="w-full px-0 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pieces">pcs</option>
                          <option value="lbs">lbs</option>
                          <option value="gallons">gal</option>
                          <option value="bottles">btl</option>
                          <option value="jars">jar</option>
                          <option value="packages">pkg</option>
                          <option value="bags">bag</option>
                          <option value="heads">hd</option>
                          <option value="cans">can</option>
                          <option value="containers">cnt</option>
                          <option value="trays">tray</option>
                          <option value="sheets">sht</option>
                          <option value="sets">set</option>
                          <option value="loaves">loaf</option>
                          <option value="cases">case</option>
                          <option value="rolls">roll</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.caseQty || ''}
                          onChange={(e) => handleFieldChange(index, 'caseQty', e.target.value)}
                          className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="1"
                        />
                      </td>
                      <td className="px-2 py-2 text-center w-16">
                        <div className="flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${stockStatus.dot}`}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Add New Item - Mobile Optimized */}
          <div className="bg-gray-50 px-3 py-4 border-t border-gray-200">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                maxLength={100}
              />
              <button
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                ➕ Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
