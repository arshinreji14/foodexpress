import apiClient from "./client";

export async function fetchMenuItems() {
  const { data } = await apiClient.get("/menu");
  return data;
}

export async function fetchMenuItem(id) {
  const { data } = await apiClient.get(`/menu/${id}`);
  return data;
}
