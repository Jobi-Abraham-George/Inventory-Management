import { useState, useEffect } from "react";
import SupplierCard from "./components/SupplierCard";
import initialData from "./data/initialData.json";

export default function App() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory");
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  const updateQuantity = (supplier, itemIndex, quantity) => {
    const updated = { ...inventory };
    updated[supplier][itemIndex].quantity = quantity;
    updated[supplier][itemIndex].updatedAt = new Date().toLocaleDateString();
    setInventory(updated);
  };

  const addItem = (supplier, newItem) => {
    const updated = { ...inventory };
    updated[supplier].push({
      name: newItem,
      quantity: 0,
      updatedAt: new Date().toLocaleDateString(),
    });
    setInventory(updated);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Inventory Manager</h1>
      {Object.keys(inventory).map((supplier) => (
        <SupplierCard
          key={supplier}
          supplier={supplier}
          items={inventory[supplier]}
          onUpdateQuantity={updateQuantity}
          onAddItem={addItem}
        />
      ))}
    </div>
  );
}
