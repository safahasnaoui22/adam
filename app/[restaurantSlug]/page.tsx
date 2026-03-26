// app/[restaurantSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import QRCodeScanner from "@/components/QRCodeScanner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantLandingPage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
    include: {
      loyaltyProgram: true,
    },
  });

  if (!restaurant) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  
  // Check if customer is already logged in
  if (session?.user?.customerProfile) {
    redirect(`/${restaurantSlug}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf9f4] to-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Restaurant Logo */}
        <div className="text-center mb-8">
          {restaurant.logo ? (
            <img 
              src={restaurant.logo} 
              alt={restaurant.name}
              className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#fe5502] mx-auto flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#282424] mt-4">
            {restaurant.name}
          </h1>
          <p className="text-[#7f8489] text-sm mt-1">
            Programme de fidélité
          </p>
        </div>

        {/* QR Code Scanner */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-[#282424] text-center mb-4">
            Scannez pour rejoindre
          </h2>
          <p className="text-sm text-[#7f8489] text-center mb-6">
            Scannez ce code QR avec votre téléphone pour créer votre compte fidélité
          </p>
          <QRCodeScanner restaurantId={restaurant.id} restaurantSlug={restaurantSlug} />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-[#ffd9b9] rounded-xl p-4">
          <p className="text-sm text-[#e0682e] text-center">
            💡 Astuce: Après votre inscription, ajoutez cette page à l'écran d'accueil 
            pour y accéder facilement à chaque visite
          </p>
        </div>
      </div>
    </div>
  );
}