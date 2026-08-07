"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  AUTH_CHANGED_EVENT,
  getAuthToken,
  getCurrentUser,
  logout,
  User,
} from "../lib/api";

type SessionState = "checking" | "signed-out" | "authenticated" | "error";

export default function Navbar() {
  const router = useRouter();
  const isMounted = useRef(false);
  const verificationId = useRef(0);
  const logoutLock = useRef(false);
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const verifySession = useCallback(async () => {
    const currentVerification = ++verificationId.current;

    if (!getAuthToken()) {
      if (isMounted.current) {
        setUser(null);
        setSessionState("signed-out");
      }
      return;
    }

    if (isMounted.current) setSessionState("checking");

    try {
      const currentUser = await getCurrentUser();

      if (isMounted.current && currentVerification === verificationId.current) {
        setUser(currentUser);
        setSessionState("authenticated");
      }
    } catch (caughtError) {
      if (!isMounted.current || currentVerification !== verificationId.current) return;

      setUser(null);
      setSessionState(
        caughtError instanceof ApiError && caughtError.status === 401
          ? "signed-out"
          : "error",
      );
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const handleAuthChanged = () => void verifySession();
    const handleUnauthorized = () => {
      verificationId.current += 1;
      setUser(null);
      setSessionState("signed-out");
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    const verificationTimer = window.setTimeout(() => void verifySession(), 0);

    return () => {
      isMounted.current = false;
      window.clearTimeout(verificationTimer);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [verifySession]);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    if (logoutLock.current) return;

    logoutLock.current = true;
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      if (isMounted.current) {
        setUser(null);
        setSessionState("signed-out");
        setIsLoggingOut(false);
        setIsMenuOpen(false);
      }

      logoutLock.current = false;
      router.replace("/");
    }
  };

  const accountActions = (mobile = false) => {
    const linkClass = mobile
      ? "block rounded-lg px-3 py-2 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700"
      : "rounded-lg px-4 py-2 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700";

    if (sessionState === "checking") {
      return <span className="px-3 py-2 text-sm text-gray-500">Checking session...</span>;
    }

    if (sessionState === "signed-out") {
      return (
        <>
          <Link href="/login" onClick={closeMenu} className={`${linkClass} border border-blue-600 text-blue-700`}>
            Login
          </Link>
          <Link href="/register" onClick={closeMenu} className={`${linkClass} bg-blue-600 text-white hover:bg-blue-700 hover:text-white`}>
            Register
          </Link>
        </>
      );
    }

    if (sessionState === "authenticated" && user) {
      return (
        <>
          {user.role === "admin" ? (
            <>
              <Link href="/dashboard" onClick={closeMenu} className={linkClass}>Dashboard</Link>
              <Link href="/add-property" onClick={closeMenu} className={linkClass}>Post Property</Link>
            </>
          ) : (
            <span className="px-3 py-2 text-sm font-medium text-gray-600">{user.name}</span>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className={`${linkClass} border border-blue-600 text-blue-700 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </>
      );
    }

    return (
      <>
        <span className="px-3 py-2 text-sm text-gray-500">Session unavailable</span>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className={`${linkClass} border border-blue-600 text-blue-700 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" onClick={closeMenu} className="text-2xl font-bold text-blue-700 sm:text-3xl">
          RealEstatePlatform
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <div className="flex gap-8 font-medium text-gray-700">
            <Link href="/?type=buy#properties" onClick={(event) => { event.preventDefault(); window.location.assign("/?type=buy#properties"); }} className="hover:text-blue-600">Buy</Link>
            <Link href="/?type=rent#properties" onClick={(event) => { event.preventDefault(); window.location.assign("/?type=rent#properties"); }} className="hover:text-blue-600">Rent</Link>
          </div>
          <div className="flex items-center gap-3">{accountActions()}</div>
        </div>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 lg:hidden"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/?type=buy#properties" onClick={(event) => { event.preventDefault(); closeMenu(); window.location.assign("/?type=buy#properties"); }} className="rounded-lg px-3 py-2 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700">Buy</Link>
            <Link href="/?type=rent#properties" onClick={(event) => { event.preventDefault(); closeMenu(); window.location.assign("/?type=rent#properties"); }} className="rounded-lg px-3 py-2 font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700">Rent</Link>
            {accountActions(true)}
          </div>
        </div>
      )}
    </nav>
  );
}
