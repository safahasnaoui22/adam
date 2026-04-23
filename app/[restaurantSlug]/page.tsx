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
      <div className="min-h-screen bg-gradient-to-b from-[#fdf9f4] to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#ffd9b9] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#282424] mb-2">Restaurant en attente</h2>
          <p className="text-[#7f8489]">Ce programme de fidélité n'est pas encore actif.</p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.customerProfile) {
    redirect(`/${restaurantSlug}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf9f4] to-white">
      <AutoRedirect restaurantSlug={restaurantSlug} />
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Restaurant Logo */}
        <div className="text-center mb-8">
          {restaurant.logo ? (
            <img src={restaurant.logo} alt={restaurant.name} className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#fe5502] mx-auto flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">{restaurant.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#282424] mt-4">{restaurant.name}</h1>
          <p className="text-[#7f8489] text-sm mt-1">Programme de fidélité</p>
        </div>

        {/* 👇 Client component that attempts auto‑login before showing the form */}
        <AutoLogin restaurantSlug={restaurantSlug} />

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold text-[#282424] mb-2">Bienvenue !</h2>
          <p className="text-sm text-[#7f8489]">
            Créez votre compte pour commencer à accumuler des points et profiter de récompenses exclusives.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <QRCodeScanner restaurantId={restaurant.id} restaurantSlug={restaurantSlug} />
        </div>

        <div className="mt-6 bg-[#ffd9b9] rounded-xl p-4">
          <p className="text-sm text-[#e0682e] text-center">
            💡 Astuce: Après votre inscription, ajoutez cette page à l'écran d'accueil pour y accéder facilement à chaque visite
          </p>
        </div>
      </div>
    </div>
  );
}