"use client";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Auth routes that should only be accessible to unauthenticated users
  const authRoutes = ["/login", "/signup"];

  useEffect(() => {
    if (!loading) {
      // If user is authenticated and tries to access auth routes, redirect to home
      if (user && authRoutes.includes(pathname)) {
        router.push("/");
        return;
      }

      // If user is not authenticated and tries to access protected routes, redirect to login
      if (!user && requireAuth && !authRoutes.includes(pathname)) {
        router.push("/login");
        return;
      }
    }
  }, [user, loading, pathname, router, requireAuth]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-orange-500"
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
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated and trying to access auth routes, don't render children
  if (user && authRoutes.includes(pathname)) {
    return null;
  }

  // If user is not authenticated and trying to access protected routes, don't render children
  if (!user && requireAuth && !authRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
