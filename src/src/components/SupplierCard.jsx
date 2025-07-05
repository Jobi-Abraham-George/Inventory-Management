import { useState } from "react";

export default function SupplierCard({ supplier, items, onUpdateQuantity, onAddItem }) {
  const [newItem, setNewItem] = useState("");

  return (
    <div className="mb-6 border p-4 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-2">{supplier}</h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{item.name}</span>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(supplier, index, parseInt(e.target.value))}
              className="border p-1 w-24"
            />
            <span className="text-sm text-gray-500">Last: {item.updatedAt}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="New item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-1 flex-grow"
        />
        <button
          onClick={() => {
            if (newItem.trim()) {
              onAddItem(supplier, newItem.trim());
              setNewItem("");
            }
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
