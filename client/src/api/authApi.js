import apiClient from "./client";

export async function requestOtp(email) {
  const { data } = await apiClient.post("/auth/request-otp", { email });
  return data;
}

export async function verifyOtp({ email, code, name }) {
  const { data } = await apiClient.post("/auth/verify-otp", { email, code, name });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
