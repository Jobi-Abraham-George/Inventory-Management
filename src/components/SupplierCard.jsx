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
      dot: 'bg-red-500'
    };
    if (onHandQty <= 5) return { 
      status: 'low', 
      color: 'text-orange-700', 
      bg: 'bg-orange-50',
      dot: 'bg-orange-500'
    };
    return { 
      status: 'good', 
      color: 'text-green-700', 
      bg: 'bg-green-50',
      dot: 'bg-green-500'
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
      {/* Professional Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">{getSupplierIcon(supplier)}</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-gray-900">{supplier}</h3>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{totalItems} items</span>
                <span>{totalStock} total stock</span>
                {lowStockItems > 0 && (
                  <span className="text-orange-600 font-medium">{lowStockItems} low</span>
                )}
                {outOfStockItems > 0 && (
                  <span className="text-red-600 font-medium">{outOfStockItems} out</span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <span className={`transform transition-transform duration-200 text-xs ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Professional Table Layout */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-2/5 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                <th className="w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Build</th>
                <th className="w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="w-16 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => {
                const stockStatus = getStockStatus(item.onHandQty || 0);
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {/* Item Name */}
                    <td className="px-3 py-2">
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
                    
                    {/* On Hand */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.onHandQty || ''}
                        onChange={(e) => handleFieldChange(index, 'onHandQty', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          stockStatus.status === 'out' ? 'border-red-300 bg-red-50 text-red-700' :
                          stockStatus.status === 'low' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                          'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="0"
                      />
                    </td>
                    
                    {/* Build */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.buildQty || ''}
                        onChange={(e) => handleFieldChange(index, 'buildQty', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    
                    {/* Order */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity || ''}
                        onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </td>
                    
                    {/* UOM */}
                    <td className="px-3 py-2 text-center">
                      <select
                        value={item.uom || 'pieces'}
                        onChange={(e) => handleFieldChange(index, 'uom', e.target.value)}
                        className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    
                    {/* Case */}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.caseQty || ''}
                        onChange={(e) => handleFieldChange(index, 'caseQty', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </td>
                    
                    {/* Status */}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <div className={`w-3 h-3 rounded-full ${stockStatus.dot}`}></div>
                        <span className={`text-xs font-medium ${
                          stockStatus.status === 'out' ? 'text-red-600' :
                          stockStatus.status === 'low' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {stockStatus.status === 'out' ? 'OUT' :
                           stockStatus.status === 'low' ? 'LOW' :
                           'OK'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Add New Item */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add new item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
