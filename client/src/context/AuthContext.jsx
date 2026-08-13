import { createContext, useContext, useEffect, useState } from "react";
import { requestOtp, verifyOtp, fetchCurrentUser } from "../api/authApi";
import { TOKEN_STORAGE_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function sendCode(email) {
    return requestOtp(email);
  }

  async function confirmCode({ email, code, name }) {
    const result = await verifyOtp({ email, code, name });
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    sendCode,
    confirmCode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
