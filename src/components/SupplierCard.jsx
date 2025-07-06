import { useState } from "react";

export default function SupplierCard({ supplier, items, onUpdateQuantity, onAddItem }) {
  const [newItem, setNewItem] = useState("");

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

  return (
    <div className="mb-6 border p-4 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-2">{supplier}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className="flex-1">{item.name}</span>
            <input
              type="number"
              min="0"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(e, index)}
              className="border p-1 w-24 ml-2"
              placeholder="0"
            />
            <span className="text-sm text-gray-500 ml-2">
              {item.updatedAt ? `Last: ${item.updatedAt}` : "Never updated"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="New item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border p-1 flex-grow"
          maxLength={100}
        />
        <button
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}
