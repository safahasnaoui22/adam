import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);

  // If user is logged in, redirect to their appropriate dashboard
 if (session?.user?.id && session.user.role) {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin");
        break;
      case "RESTAURANT_OWNER":
        redirect("/dashboard");
        break;
      case "CUSTOMER":
        // For customers, ensure they have a restaurant slug before redirecting
        if (session.user.restaurantSlug) {
          redirect(`/${session.user.restaurantSlug}/dashboard`);
        } else {
          // If no slug, redirect to the generic client dashboard (or stay on homepage)
          // To avoid the null restaurantId, we'll stay on homepage instead
          console.warn("Customer has no restaurantSlug, staying on homepage");
        }
        break;
      default:
        // Unknown role, stay on homepage
        console.warn("Unknown role:", session.user.role);
        break;
    }
  }


  // If not logged in, show the landing page
  return (
    <div className="min-h-screen bg-[#fdf9f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-[#fe5502]">Adam</div>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="text-[#282424] hover:text-[#fe5502] px-3 py-2 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[#fe5502] text-white hover:bg-[#e0682e] px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-4xl tracking-tight font-extrabold text-[#282424] sm:text-5xl md:text-6xl">
            <span className="block">Fidelity system for</span>
            <span className="block text-[#fe5502]">restaurants & cafes</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-[#7f8489] sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Build customer loyalty with digital stamp cards. No app installation required.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#fe5502] hover:bg-[#e0682e] md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-[#fe5502] rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-[#282424] tracking-tight">Digital platform Cards</h3>
                  <p className="mt-5 text-base text-[#7f8489]">
                    Replace paper cards with digital cart. Customers scan QR code to collect stars.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-[#e7926b] rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-[#282424] tracking-tight">Rewards & Coupons</h3>
                  <p className="mt-5 text-base text-[#7f8489]">
                    Create custom rewards and time-limited coupons to engage customers.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md hover:shadow-lg transition-shadow">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-[#e0682e] rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-[#282424] tracking-tight">Analytics</h3>
                  <p className="mt-5 text-base text-[#7f8489]">
                    Track customer visits, redemptions, and revenue impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: Add a subtle decorative element with #ffd9b9 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#7f8489]">
            Join thousands of satisfied restaurants using Adam
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-[#fe5502]"></div>
            <div className="w-2 h-2 rounded-full bg-[#e7926b]"></div>
            <div className="w-2 h-2 rounded-full bg-[#e0682e]"></div>
            <div className="w-2 h-2 rounded-full bg-[#ffd9b9]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}