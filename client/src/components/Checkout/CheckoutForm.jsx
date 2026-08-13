import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { placeOrder } from "../../api/orderApi";

const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

function validate({ customerName, address, phone }) {
  const errors = {};
  if (!customerName.trim()) errors.customerName = "Name is required";
  if (!address.trim()) errors.address = "Address is required";
  if (!phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!PHONE_REGEX.test(phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }
  return errors;
}

export default function CheckoutForm() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: "", address: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const order = await placeOrder({
        customerName: form.customerName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        items: items.map((entry) => ({
          menuItemId: entry.menuItem.id,
          quantity: entry.quantity,
        })),
      });
      navigate(`/order/${order.id}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div>
        <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <input
          id="customerName"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
        {errors.customerName && <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>}
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
          Delivery Address
        </label>
        <textarea
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-semibold text-slate-900">
        <span>Order Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? "Placing order..." : "Place Order"}
      </button>
    </form>
  );
}
