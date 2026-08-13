import { useCart } from "../../context/CartContext";

export default function CartItem({ entry }) {
  const { updateQuantity, removeItem } = useCart();
  const { menuItem, quantity } = entry;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex-1">
        <p className="font-medium text-slate-900">{menuItem.name}</p>
        <p className="text-sm text-slate-500">${Number(menuItem.price).toFixed(2)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease quantity of ${menuItem.name}`}
          onClick={() => updateQuantity(menuItem.id, quantity - 1)}
          className="h-7 w-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          -
        </button>
        <span className="w-6 text-center">{quantity}</span>
        <button
          type="button"
          aria-label={`Increase quantity of ${menuItem.name}`}
          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
          className="h-7 w-7 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          +
        </button>
      </div>
      <button
        type="button"
        aria-label={`Remove ${menuItem.name} from cart`}
        onClick={() => removeItem(menuItem.id)}
        className="text-sm text-red-500 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
