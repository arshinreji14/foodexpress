import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OtpLoginPage() {
  const { sendCode, confirmCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [devCode, setDevCode] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await sendCode(email.trim());
      setIsNewUser(result.isNewUser);
      setDevCode(result.devCode || null);
      setStep("code");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send a code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await confirmCode({ email: email.trim(), code: code.trim(), name: name.trim() });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to verify that code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Log In</h1>

      {step === "email" && (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Sending code..." : "Send Code"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">
            We sent a 6-digit code to <span className="font-medium text-slate-900">{email}</span>.
          </p>

          {devCode && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Dev mode: your code is <span className="font-mono font-semibold">{devCode}</span>
            </p>
          )}

          {isNewUser && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-700">
              6-Digit Code
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-orange-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Verifying..." : "Verify & Log In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="text-sm text-slate-500 hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
