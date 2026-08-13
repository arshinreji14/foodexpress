import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <Link to="/" className="text-xl font-bold text-orange-500">
        FoodExpress
      </Link>

      <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
        <span>
          Cart: <span className="text-slate-900">{totalItems}</span> item
          {totalItems === 1 ? "" : "s"}
        </span>

        {isAuthenticated ? (
          <>
            <Link to="/orders" className="text-slate-700 hover:text-orange-500">
              My Orders
            </Link>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700">Hi, {user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-orange-500 hover:underline"
            >
              Log Out
            </button>
          </>
        ) : (
          <Link to="/login" className="text-orange-500 hover:underline">
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}
