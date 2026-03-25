"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cafeName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Server response:", res.status, data);

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: Something went wrong`);
      }

      router.push("/auth/signin?registered=true");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#282424]">
            Create your restaurant account
          </h2>
          <p className="mt-2 text-center text-sm text-[#7f8489]">
            Join adam and start building customer loyalty
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="cafeName" className="block text-sm font-medium text-[#282424] mb-1">
                Restaurant/Cafe Name *
              </label>
              <input
                id="cafeName"
                name="cafeName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[#c6c9c8] placeholder-[#7f8489] text-[#282424] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] focus:z-10 sm:text-sm"
                placeholder="e.g., Café Central"
                value={formData.cafeName}
                onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#282424] mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[#c6c9c8] placeholder-[#7f8489] text-[#282424] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] focus:z-10 sm:text-sm"
                placeholder="contact@cafecentral.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#282424] mb-1">
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[#c6c9c8] placeholder-[#7f8489] text-[#282424] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] focus:z-10 sm:text-sm"
                placeholder="+216 XX XXX XXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#282424] mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-[#c6c9c8] placeholder-[#7f8489] text-[#282424] rounded-md focus:outline-none focus:ring-[#fe5502] focus:border-[#fe5502] focus:z-10 sm:text-sm"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#ffd9b9] p-4">
              <div className="text-sm text-[#e0682e]">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fe5502] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/signin" className="font-medium text-[#fe5502] hover:text-[#e0682e] transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}