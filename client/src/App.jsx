import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Layout/Header";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import HomePage from "./pages/HomePage";
import OtpLoginPage from "./pages/OtpLoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import OrdersListPage from "./pages/OrdersListPage";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-slate-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<OtpLoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderStatusPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/orders" element={<OrdersListPage />} />
            </Route>
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
