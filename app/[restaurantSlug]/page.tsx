// app/[restaurantSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import QRCodeScanner from "@/components/QRCodeScanner";
import AutoLogin from "@/components/AutoLogin";
import AutoRedirect from "@/components/AutoRedirect";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantLandingPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
    include: { loyaltyProgram: true },
  });

  if (!restaurant) notFound();

  if (restaurant.accountStatus !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-[#ffd9b9] to-[#ffe8d6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-100">
            <svg
              className="w-12 h-12 text-[#fe5502]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#282424] mb-3">
            Restaurant en attente
          </h2>
          <p className="text-[#7f8489] leading-relaxed">
            Ce programme de fidélité n'est pas encore actif.
          </p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.customerProfile) {
    // Redirect to the existing client dashboard, passing the restaurantId as a query parameter
    redirect(`/client/dashboard?restaurantId=${restaurant.id}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <AutoRedirect restaurantSlug={restaurantSlug} />

      <div className="max-w-lg mx-auto px-4 py-6 sm:py-10">
        {/* Restaurant Logo & Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fe5502] to-[#ff8a4c] rounded-full blur-xl opacity-20 scale-110" />
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto object-cover shadow-xl shadow-orange-100 ring-4 ring-white"
              />
            ) : (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#fe5502] to-[#ff8a4c] mx-auto flex items-center justify-center shadow-xl shadow-orange-100 ring-4 ring-white">
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#282424] mt-5 tracking-tight">
            {restaurant.name}
          </h1>
          <p className="text-[#7f8489] text-sm sm:text-base mt-2 font-medium">
            Programme de fidélité
          </p>
        </div>

        {/* 👇 Client component that attempts auto‑login before showing the form */}
        <AutoLogin restaurantSlug={restaurantSlug} />

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-[#fffaf5] to-[#fff5ed] rounded-2xl border border-[#ffe8d6] shadow-sm p-6 mb-5 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#282424] mb-2">
            Bienvenue !
          </h2>
          <p className="text-sm sm:text-base text-[#7f8489] leading-relaxed max-w-sm mx-auto">
            Créez votre compte pour commencer à accumuler des points et
            profiter de récompenses exclusives.
          </p>
        </div>

        {/* QR Scanner Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-100/50 p-6">
          <QRCodeScanner
            restaurantId={restaurant.id}
            restaurantSlug={restaurantSlug}
          />
        </div>

        {/* Tip Card */}
        <div className="mt-5 bg-gradient-to-r from-[#ffd9b9] to-[#ffe8d6] rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
              <span className="text-lg">💡</span>
            </div>
            <p className="text-sm text-[#b84d1a] leading-relaxed font-medium text-left">
              Astuce: Après votre inscription, ajoutez cette page à l'écran
              d'accueil pour y accéder facilement à chaque visite
            </p>
          </div>
        </div>

        {/* Footer spacing for mobile */}
        <div className="h-6" />
      </div>
    </div>
  );
}