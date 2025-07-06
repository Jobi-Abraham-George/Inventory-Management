import { useState, useEffect } from "react";
import SupplierCard from "./components/SupplierCard";
import initialData from "./data/initialData.json";

export default function App() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize inventory from localStorage or use initial data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inventory");
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Validate that the parsed data is an object
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

  const updateQuantity = (supplier, itemIndex, quantity) => {
    if (!inventory || !inventory[supplier] || !inventory[supplier][itemIndex]) {
      setError("Invalid item reference");
      return;
    }

    try {
      const updated = { ...inventory };
      updated[supplier][itemIndex].quantity = quantity;
      updated[supplier][itemIndex].updatedAt = new Date().toLocaleDateString();
      setInventory(updated);
      
      // Clear any previous errors
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update item quantity.");
    }
  };

  const addItem = (supplier, newItem) => {
    if (!inventory || !inventory[supplier]) {
      setError("Invalid supplier");
      return;
    }

    try {
      const updated = { ...inventory };
      updated[supplier].push({
        name: newItem,
        quantity: 0,
        updatedAt: new Date().toLocaleDateString(),
      });
      setInventory(updated);
      
      // Clear any previous errors
      if (error) {
        setError(null);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add new item.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center text-red-600">
          <div className="text-lg">Failed to load inventory data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Inventory Manager</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {Object.keys(inventory).length === 0 ? (
        <div className="text-center text-gray-500">
          <div className="text-lg">No suppliers found</div>
        </div>
      ) : (
        Object.keys(inventory).map((supplier) => (
          <SupplierCard
            key={supplier}
            supplier={supplier}
            items={inventory[supplier]}
            onUpdateQuantity={updateQuantity}
            onAddItem={addItem}
          />
        ))
      )}
    </div>
  );
}
