"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  getAuthToken,
  getCurrentUser,
  logout,
} from "../../lib/api";

type GuardState = "checking" | "allowed" | "denied" | "error";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isMounted = useRef(false);
  const [guardState, setGuardState] = useState<GuardState>("checking");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const verifyAccess = useCallback(async () => {
    if (!getAuthToken()) {
      router.replace("/login");
      return;
    }

    try {
      const user = await getCurrentUser();

      if (isMounted.current) {
        setGuardState(user.role === "admin" ? "allowed" : "denied");
      }
    } catch (caughtError) {
      if (!isMounted.current) {
        return;
      }

      if (caughtError instanceof ApiError && caughtError.status === 401) {
        router.replace("/login");
        return;
      }

      if (caughtError instanceof ApiError && caughtError.status === 403) {
        setGuardState("denied");
        return;
      }

      setGuardState("error");
    }
  }, [router]);

  useEffect(() => {
    isMounted.current = true;

    const handleUnauthorized = () => {
      router.replace("/login");
    };
    const handleForbidden = () => {
      setGuardState("denied");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("auth:forbidden", handleForbidden);
    const verificationTimer = window.setTimeout(() => {
      void verifyAccess();
    }, 0);

    return () => {
      isMounted.current = false;
      window.clearTimeout(verificationTimer);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("auth:forbidden", handleForbidden);
    };
  }, [router, verifyAccess]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      router.replace("/login");

      if (isMounted.current) {
        setIsLoggingOut(false);
      }
    }
  };

  const handleRetry = () => {
    setGuardState("checking");
    void verifyAccess();
  };

  if (guardState === "checking") {
    return <div className="p-10 text-center text-gray-600">Checking your session...</div>;
  }

  if (guardState === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-3 text-gray-600">
            This area is available to administrators only.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Home
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (guardState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900">Unable to verify access</h1>
          <p className="mt-3 text-gray-600">
            We could not confirm your session. Please try again.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
