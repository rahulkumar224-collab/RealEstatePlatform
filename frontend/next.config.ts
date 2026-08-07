import type { NextConfig } from "next";

const DEVELOPMENT_API_BASE_URL = "http://127.0.0.1:8000/api";

const normalizeApiBaseUrl = (rawValue: string | undefined) => {
  const configuredValue = rawValue?.trim();

  if (!configuredValue) {
    if (process.env.NODE_ENV === "development") {
      return DEVELOPMENT_API_BASE_URL;
    }

    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required for production builds. Provide a full URL ending in /api.",
    );
  }

  const normalizedValue = configuredValue.replace(/\/+$/, "");
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedValue);
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be an absolute URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must use http: or https:.");
  }

  const normalizedPathname = parsedUrl.pathname.replace(/\/+$/, "");

  if (/\/api\/api$/i.test(normalizedPathname)) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must not end in duplicated /api/api.");
  }

  if (!/\/api$/i.test(normalizedPathname)) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must include the full API path ending in /api.");
  }

  return normalizedValue;
};

process.env.NEXT_PUBLIC_API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

const nextConfig: NextConfig = {
};

export default nextConfig;
