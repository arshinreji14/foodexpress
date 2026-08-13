const STORAGE_KEY = "foodexpress_guest_order_ids";
const MAX_STORED_ORDERS = 25;

export function getStoredOrderIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function addStoredOrderId(id) {
  const ids = getStoredOrderIds().filter((existing) => existing !== id);
  ids.unshift(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_STORED_ORDERS)));
}
