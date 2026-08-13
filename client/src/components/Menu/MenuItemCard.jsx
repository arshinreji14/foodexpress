import { useCart } from "../../context/CartContext";

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-40 w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
        <p className="flex-1 text-sm text-slate-600">{item.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-slate-900">${Number(item.price).toFixed(2)}</span>
          <button
            type="button"
            onClick={() => addItem(item)}
            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
