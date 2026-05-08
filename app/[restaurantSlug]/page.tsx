// app/[restaurantSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import QRCodeScanner from "@/components/QRCodeScanner";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantLandingPage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
  });

  if (!restaurant) notFound();

  const session = await getServerSession(authOptions);
  if (session?.user?.customerProfile) {
    // Already logged in → go to dashboard
    redirect(`/${restaurantSlug}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf9f4] to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Restaurant Logo & Name */}
        <div className="text-center mb-8">
          {restaurant.logo ? (
            <img src={restaurant.logo} alt="Logo" className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#fe5502] mx-auto flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">{restaurant.name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#282424] mt-4">{restaurant.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Programme de fidélité</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Bienvenue !</h2>
          <p className="text-sm text-gray-600">Créez votre compte pour accumuler des points et profiter de récompenses.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <QRCodeScanner restaurantId={restaurant.id} restaurantSlug={restaurantSlug} />
        </div>
      </div>
    </div>
  );
}