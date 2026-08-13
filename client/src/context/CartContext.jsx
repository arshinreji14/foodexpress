import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(menuItem, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((entry) =>
          entry.menuItem.id === menuItem.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...prev, { menuItem, quantity }];
    });
  }

  function removeItem(menuItemId) {
    setItems((prev) => prev.filter((entry) => entry.menuItem.id !== menuItemId));
  }

  function updateQuantity(menuItemId, quantity) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.menuItem.id === menuItemId ? { ...entry, quantity } : entry
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, entry) => sum + Number(entry.menuItem.price) * entry.quantity, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
