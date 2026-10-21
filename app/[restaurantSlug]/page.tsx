// app/[restaurantSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import QRCodeScanner from "@/components/QRCodeScanner";
import AutoLogin from "@/components/AutoLogin";
import AutoRedirect from "@/components/AutoRedirect";
import { Clock, Sparkles, Smartphone, Star, Gift } from "lucide-react";

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
      <main className="lp-root min-h-dvh flex items-center justify-center p-5">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 ring-1 ring-amber-100">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 tracking-tight">
            Restaurant en attente
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Ce programme de fidélité n'est pas encore actif. Revenez bientôt !
          </p>
        </div>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.customerProfile) {
    redirect(`/client/dashboard?restaurantId=${restaurant.id}`);
  }

  return (
    <main className="lp-root min-h-dvh">
      <AutoRedirect restaurantSlug={restaurantSlug} />

      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-rose-500" />

      <div className="mx-auto w-full max-w-md px-4 sm:px-5 pt-8 sm:pt-10 pb-10">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-10">
          <div className="relative inline-flex">
            {restaurant.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-md ring-4 ring-white"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-md ring-4 ring-white">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 bg-white rounded-full flex items-center justify-center shadow-sm ring-1 ring-gray-100">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 fill-orange-500" />
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-4 tracking-tight break-words">
            {restaurant.name}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
            Programme de fidélité
          </p>
        </header>

        <AutoLogin restaurantSlug={restaurantSlug} />

        {/* Welcome card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-5 sm:mb-6 shadow-lg">
          <div className="absolute top-0 right-0 h-24 w-24 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 h-20 w-20 bg-rose-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-orange-400 uppercase tracking-wider">
                Bienvenue
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white mb-1.5 leading-snug">
              Commencez à gagner des récompenses
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Créez votre compte pour accumuler des points à chaque visite et profiter d'avantages exclusifs.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3.5 border-t border-white/10">
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-300">
                <Gift className="h-3.5 w-3.5 text-orange-400" /> Récompenses
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-300">
                <Star className="h-3.5 w-3.5 text-orange-400" /> Points
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-300">
                <Smartphone className="h-3.5 w-3.5 text-orange-400" /> Mobile
              </span>
            </div>
          </div>
        </section>

        {/* QR scanner */}
        <section className="bg-white rounded-2xl sm:rounded-3xl shadow-md ring-1 ring-gray-100 p-4 sm:p-6">
          <QRCodeScanner
            restaurantId={restaurant.id}
            restaurantSlug={restaurantSlug}
          />
        </section>

        {/* Tip */}
        <aside className="mt-5 sm:mt-6 bg-orange-50 rounded-2xl p-3.5 sm:p-4 ring-1 ring-orange-100">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="h-4 w-4 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-orange-800 font-semibold leading-snug">
                Astuce
              </p>
              <p className="text-[11px] sm:text-xs text-orange-700/80 mt-0.5 leading-relaxed">
                Après votre inscription, ajoutez cette page à l'écran d'accueil pour y accéder facilement à chaque visite.
              </p>
            </div>
          </div>
        </aside>

        <p className="text-center text-[11px] text-gray-400 mt-8">
          Propulsé par le programme de fidélité
        </p>
      </div>
    </main>
  );
}