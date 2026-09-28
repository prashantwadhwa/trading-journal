import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChartCandlestick } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { authClient } from "../lib/auth-client";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message || "Invalid email or password");
        return;
      }


      toast.success("Logged in successfully!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
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

          <div className="login-card rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl shadow-black/20">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Welcome back</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Sign in to your trading journal.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 border-t border-zinc-800 pt-6 text-center">
              <p className="text-sm text-zinc-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Create one
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

export default Login;
