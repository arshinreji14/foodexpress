import apiClient from "./client";

export async function placeOrder(payload) {
  const { data } = await apiClient.post("/orders", payload);
  return data;
}

export async function fetchOrder(id) {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data;
}

export async function fetchOrders() {
  const { data } = await apiClient.get("/orders");
  return data;
}
