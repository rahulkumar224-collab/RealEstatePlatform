"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { ApiError, register } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const submitLock = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitLock.current) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    if (trimmedName.length > 255) {
      setError("Full name must not exceed 255 characters.");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password confirmation must match the password.");
      return;
    }

    submitLock.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      await register(trimmedName, trimmedEmail, password, passwordConfirmation);
      router.replace("/");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="mb-8 text-center text-3xl font-bold">Create Account</h1>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full Name"
            autoComplete="name"
            maxLength={255}
            disabled={isSubmitting}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            disabled={isSubmitting}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            disabled={isSubmitting}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="Confirm Password"
            autoComplete="new-password"
            disabled={isSubmitting}
            className="w-full rounded-lg border p-3"
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <div className="mt-6 text-center">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-blue-600">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
