import { useEffect, useState } from "react";
import { fetchMenuItems } from "../../api/menuApi";
import MenuItemCard from "./MenuItemCard";

export default function MenuList() {
  const [menuItems, setMenuItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    fetchMenuItems()
      .then((data) => {
        if (isMounted) {
          setMenuItems(data);
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

  if (status === "loading") {
    return <p className="text-center text-slate-500">Loading menu...</p>;
  }

  if (status === "error") {
    return <p className="text-center text-red-500">Failed to load the menu. Please try again.</p>;
  }

  if (menuItems.length === 0) {
    return <p className="text-center text-slate-500">No menu items available right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {menuItems.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
