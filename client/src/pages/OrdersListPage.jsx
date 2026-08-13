import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/orderApi";

const STATUS_LABELS = {
  RECEIVED: "Order Received",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    fetchOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Orders</h1>

      {status === "loading" && <p className="text-slate-500">Loading your orders...</p>}
      {status === "error" && (
        <p className="text-red-500">Failed to load your orders. Please try again.</p>
      )}
      {status === "success" && orders.length === 0 && (
        <p className="text-slate-500">
          You haven&apos;t placed any orders yet.{" "}
          <Link to="/" className="text-orange-500 hover:underline">
            Browse the menu
          </Link>
          .
        </p>
      )}

      {status === "success" && orders.length > 0 && (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/order/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-slate-900">Order #{order.id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-500">
                    {STATUS_LABELS[order.status] || order.status}
                  </p>
                  <p className="text-sm text-slate-700">${Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
