"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordClient() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf9f4] px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-extrabold text-[#282424]">Invalid reset link</h2>
          <p className="text-sm text-[#7f8489]">This link is missing its token. Please request a new one.</p>
          <Link href="/auth/forgot-password" className="font-medium text-[#fe5502] hover:text-[#e0682e]">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/auth/signin?reset=1");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "appearance-none block w-full px-3 py-2 border border-[#c6c9c8] placeholder-[#7f8489] text-[#282424] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] sm:text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#282424]">Choose a new password</h2>
          <p className="mt-2 text-center text-sm text-[#7f8489]">At least 8 characters.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#282424] mb-1">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-[#282424] mb-1">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#ffd9b9] p-4">
              <div className="text-sm text-[#e0682e]">
                {error}{" "}
                {error.includes("expired") && (
                  <Link href="/auth/forgot-password" className="underline font-medium">
                    Request a new link
                  </Link>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fe5502] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
