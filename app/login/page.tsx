"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl w-full max-w-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <h1 className="text-3xl font-bold text-orange-500 text-center mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2 text-sm"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2 text-sm"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-500 text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-orange-500 font-medium hover:text-orange-600 hover:underline transition-colors"
            >
              Create one
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
