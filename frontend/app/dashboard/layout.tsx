"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthToken, getAuthToken, logout } from "../../lib/api";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
  { href: "/dashboard/property-visits", label: "Property Visits" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const redirectToLogin = () => {
      clearAuthToken();
      router.replace("/login");
    };

    if (!getAuthToken()) {
      redirectToLogin();
      return;
    }

    window.addEventListener("auth:unauthorized", redirectToLogin);

    const readyTimer = window.setTimeout(() => {
      setIsCheckingAuth(false);
    }, 0);

    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("auth:unauthorized", redirectToLogin);
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      clearAuthToken();
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  if (isCheckingAuth) {
    return <div className="p-10 text-center text-gray-600">Checking your session...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-700">
            RealEstatePlatform
          </Link>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Dashboard navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
