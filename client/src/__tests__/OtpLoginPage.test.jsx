import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OtpLoginPage from "../pages/OtpLoginPage";

const sendCodeMock = vi.fn();
const confirmCodeMock = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ sendCode: sendCodeMock, confirmCode: confirmCodeMock }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <OtpLoginPage />
    </MemoryRouter>
  );
}

describe("OtpLoginPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends a code and moves to the code step for an existing user", async () => {
    sendCodeMock.mockResolvedValue({ isNewUser: false });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    expect(await screen.findByText(/we sent a 6-digit code/i)).toBeInTheDocument();
    expect(sendCodeMock).toHaveBeenCalledWith("jane@example.com");
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  it("shows a name field for a brand-new email", async () => {
    sendCodeMock.mockResolvedValue({ isNewUser: true, devCode: "654321" });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    expect(await screen.findByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByText("654321")).toBeInTheDocument();
  });

  it("verifies the code and navigates on success", async () => {
    sendCodeMock.mockResolvedValue({ isNewUser: false });
    confirmCodeMock.mockResolvedValue({ id: 1, name: "Jane Doe", email: "jane@example.com" });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await screen.findByText(/we sent a 6-digit code/i);

    await user.type(screen.getByLabelText(/6-digit code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify & log in/i }));

    await waitFor(() => {
      expect(confirmCodeMock).toHaveBeenCalledWith({
        email: "jane@example.com",
        code: "123456",
        name: "",
      });
    });
    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows an error message when verification fails", async () => {
    sendCodeMock.mockResolvedValue({ isNewUser: false });
    confirmCodeMock.mockRejectedValue({ response: { data: { error: "Incorrect code" } } });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await screen.findByText(/we sent a 6-digit code/i);

    await user.type(screen.getByLabelText(/6-digit code/i), "000000");
    await user.click(screen.getByRole("button", { name: /verify & log in/i }));

    expect(await screen.findByText("Incorrect code")).toBeInTheDocument();
  });

  it("lets the user go back and use a different email", async () => {
    sendCodeMock.mockResolvedValue({ isNewUser: false });
    renderPage();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));
    await screen.findByText(/we sent a 6-digit code/i);

    await user.click(screen.getByRole("button", { name: /use a different email/i }));

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.queryByText(/we sent a 6-digit code/i)).not.toBeInTheDocument();
  });
});
