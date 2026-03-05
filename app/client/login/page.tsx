"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function ClientLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantId = searchParams.get("restaurantId");
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch(`/api/restaurant/${restaurantId}`);
      const data = await res.json();
      if (res.ok) {
        setRestaurant(data);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/client/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          restaurantId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Store client session (you might want to use a proper auth system)
      localStorage.setItem("clientId", data.client.id);
      localStorage.setItem("clientName", data.client.name);
      
      // Redirect to client dashboard
      router.push(`/client/dashboard?restaurantId=${restaurantId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading restaurant information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {restaurant.logo && (
            <div className="flex justify-center">
              <Image 
                src={restaurant.logo} 
                alt={restaurant.name}
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to {restaurant.name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our loyalty program to earn rewards!
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Join Loyalty Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}