import { useOrderSocket } from "../../hooks/useOrderSocket";

const STEPS = [
  { key: "RECEIVED", label: "Order Received" },
  { key: "PREPARING", label: "Preparing" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderStatusTracker({ orderId, initialStatus }) {
  const status = useOrderSocket(orderId, initialStatus);
  const currentIndex = STEPS.findIndex((step) => step.key === status);

  return (
    <div className="flex flex-col gap-4" data-testid="order-status-tracker">
      <p className="text-sm text-slate-500">Order #{orderId}</p>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {STEPS.map((step, index) => {
          const isComplete = index <= currentIndex;
          return (
            <li key={step.key} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isComplete ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-sm font-medium ${
                  isComplete ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="mx-2 hidden h-px flex-1 bg-slate-200 sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
