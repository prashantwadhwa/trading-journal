import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChartCandlestick } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "../lib/auth-client";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Client-side validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        setError(error.message || "Unable to create your account.");
        return;
      }

      toast.success("Account created successfully!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold text-zinc-950">
              <ChartCandlestick />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Trading Journal
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Track your trades. Understand your edge.
            </p>
          </div>

          {/* Card */}
          <div className="login-card rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/20">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Create your account</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Start tracking your trading journey.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 border-t border-zinc-800 pt-6 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-700">
            Your trading data stays private.
          </p>
        </div>
      </div>
    </div>
  );
}
