import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartItem from "./CartItem";

export default function CartDrawer() {
  const { items, totalItems, totalPrice } = useCart();

  return (
    <aside className="flex h-fit flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Your Cart ({totalItems})</h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Your cart is empty. Add some items from the menu.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((entry) => (
            <CartItem key={entry.menuItem.id} entry={entry} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-semibold text-slate-900">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>

      <Link
        to="/checkout"
        aria-disabled={items.length === 0}
        onClick={(event) => {
          if (items.length === 0) event.preventDefault();
        }}
        className={`mt-1 rounded-lg px-4 py-2 text-center font-medium text-white transition ${
          items.length === 0
            ? "cursor-not-allowed bg-slate-300"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        Proceed to Checkout
      </Link>
    </aside>
  );
}
