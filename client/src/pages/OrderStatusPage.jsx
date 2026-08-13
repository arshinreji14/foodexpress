import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrder } from "../api/orderApi";
import { useCart } from "../context/CartContext";
import OrderStatusTracker from "../components/Order/OrderStatusTracker";

export default function OrderStatusPage() {
  const { id } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    clearCart();
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchOrder(id)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (status === "loading") {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-center text-slate-500">Loading order...</p>;
  }

  if (status === "error" || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-red-500">We couldn't find that order.</p>
        <Link to="/" className="mt-4 inline-block text-orange-500 hover:underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Order Status</h1>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <OrderStatusTracker orderId={order.id} initialStatus={order.status} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-900">Order Details</h2>
        <ul className="mb-3 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-1.5 text-sm text-slate-700">
              <span>
                {item.quantity} × {item.menuItem.name}
              </span>
              <span>${(Number(item.priceAtOrder) * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-slate-900">
          <span>Total</span>
          <span>${Number(order.totalAmount).toFixed(2)}</span>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Delivering to {order.address} &middot; {order.phone}
        </p>
      </div>

      <Link to="/" className="mt-6 inline-block text-orange-500 hover:underline">
        Back to menu
      </Link>
    </div>
  );
}
