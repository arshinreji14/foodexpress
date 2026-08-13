import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TOKEN_STORAGE_KEY } from "../api/client";
import * as authApi from "../api/authApi";

vi.mock("../api/authApi");

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("starts unauthenticated with no stored token", async () => {
    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("requests an OTP for an email without changing auth state", async () => {
    authApi.requestOtp.mockResolvedValue({ isNewUser: true, devCode: "123456" });

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.sendCode("jane@example.com");
    });

    expect(authApi.requestOtp).toHaveBeenCalledWith("jane@example.com");
    expect(response).toEqual({ isNewUser: true, devCode: "123456" });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("confirms a code, stores the token, and marks the user as authenticated", async () => {
    authApi.verifyOtp.mockResolvedValue({
      user: { id: 1, name: "Jane Doe", email: "jane@example.com" },
      token: "new-token",
    });

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.confirmCode({ email: "jane@example.com", code: "123456", name: "Jane Doe" });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 1, name: "Jane Doe", email: "jane@example.com" });
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe("new-token");
  });

  it("restores the session from a stored token on mount", async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "existing-token");
    authApi.fetchCurrentUser.mockResolvedValue({
      id: 1,
      name: "Jane Doe",
      email: "jane@example.com",
    });

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: 1, name: "Jane Doe", email: "jane@example.com" });
  });

  it("clears the session when the stored token is invalid", async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "bad-token");
    authApi.fetchCurrentUser.mockRejectedValue(new Error("unauthorized"));

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("logs out and clears the stored token", async () => {
    authApi.verifyOtp.mockResolvedValue({
      user: { id: 1, name: "Jane Doe", email: "jane@example.com" },
      token: "new-token",
    });

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.confirmCode({ email: "jane@example.com", code: "123456" });
    });

    act(() => result.current.logout());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("throws when used outside of an AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
