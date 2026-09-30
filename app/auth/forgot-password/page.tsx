"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#282424]">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-[#7f8489]">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="rounded-md bg-[#ffd9b9] p-4">
              <p className="text-sm text-[#e0682e]">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
                Check your inbox (and your spam folder). The link is valid for 1 hour.
              </p>
            </div>
            <div className="text-sm text-center">
              <Link href="/auth/signin" className="font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors">
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#282424] mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-[#c6c9c8] placeholder-[#7f8489] text-[#282424] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] sm:text-sm"
                placeholder="contact@cafecentral.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-[#ffd9b9] p-4">
                <div className="text-sm text-[#e0682e]">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fe5502] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <div className="text-sm text-center">
              <Link href="/auth/signin" className="font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
