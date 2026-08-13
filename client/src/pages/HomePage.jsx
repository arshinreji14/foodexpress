import MenuList from "../components/Menu/MenuList";
import CartDrawer from "../components/Cart/CartDrawer";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Our Menu</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <MenuList />
        <CartDrawer />
      </div>
    </div>
  );
}
