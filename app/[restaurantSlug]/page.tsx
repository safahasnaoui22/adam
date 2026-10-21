// app/[restaurantSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import QRCodeScanner from "@/components/QRCodeScanner";
import AutoLogin from "@/components/AutoLogin";
import AutoRedirect from "@/components/AutoRedirect";
import { Clock, Sparkles, Smartphone, ChevronRight, Star, Gift } from "lucide-react";

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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-amber-100">
            <Clock className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">
            Restaurant en attente
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Ce programme de fidélité n'est pas encore actif. Revenez bientôt !
          </p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.customerProfile) {
    redirect(`/client/dashboard?restaurantId=${restaurant.id}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <AutoRedirect restaurantSlug={restaurantSlug} />

      {/* Subtle top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-500" />

      <div className="max-w-md mx-auto px-5 pt-10 pb-8">
        {/* Restaurant Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-24 h-24 rounded-3xl mx-auto object-cover shadow-xl shadow-gray-200/60 ring-4 ring-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 mx-auto flex items-center justify-center shadow-xl shadow-orange-500/20 ring-4 ring-white">
                <span className="text-4xl font-bold text-white">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md ring-1 ring-gray-100">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mt-5 tracking-tight">
            {restaurant.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            Programme de fidélité
          </p>
        </div>

        {/* Auto Login */}
        <AutoLogin restaurantSlug={restaurantSlug} />

        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 shadow-xl shadow-gray-900/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                Bienvenue
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2 leading-snug">
              Commencez à gagner des récompenses
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Créez votre compte pour accumuler des points à chaque visite et
              profiter d'avantages exclusifs.
            </p>

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-300">Récompenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-300">Points</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-300">Mobile</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Scanner Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 ring-1 ring-gray-100 p-6">
          <QRCodeScanner
            restaurantId={restaurant.id}
            restaurantSlug={restaurantSlug}
          />
        </div>

        {/* Tip Card */}
        <div className="mt-6 bg-orange-50/70 rounded-2xl p-4 ring-1 ring-orange-100/80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-orange-800 font-medium leading-relaxed">
                Astuce
              </p>
              <p className="text-xs text-orange-700/80 mt-0.5 leading-relaxed">
                Après votre inscription, ajoutez cette page à l'écran d'accueil
                pour y accéder facilement à chaque visite.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Propulsé par le programme de fidélité
        </p>
      </div>
    </div>
  );
}