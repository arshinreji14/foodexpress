import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "../components/Layout/ProtectedRoute";

const useAuthMock = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>Secret Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows a loading state while auth is resolving", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: true });
    renderProtected();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderProtected();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders the protected content when authenticated", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });
    renderProtected();

    expect(screen.getByText("Secret Content")).toBeInTheDocument();
  });
});
