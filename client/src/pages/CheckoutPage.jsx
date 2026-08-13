import { Navigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CheckoutForm from "../components/Checkout/CheckoutForm";

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
