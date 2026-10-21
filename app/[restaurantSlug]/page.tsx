
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

export default async function RestaurantLandingPage({
  params,
}: PageProps) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
    include: { loyaltyProgram: true },
  });

  if (!restaurant) notFound();

  if (restaurant.accountStatus !== "ACTIVE") {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#fffaf6] px-6 py-10">
        <section className="w-full max-w-sm rounded-[28px] border border-orange-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#fe5502]">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7v5l3 2"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-[#282424]">
            Restaurant en attente
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#77716d]">
            Ce programme de fidélité n&apos;est pas encore actif.
            Revenez bientôt !
          </p>
        </section>
      </main>
    );
  }

  const session = await getServerSession(authOptions);

  if (session?.user?.customerProfile) {
    redirect(`/client/dashboard?restaurantId=${restaurant.id}`);
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-clip bg-[#fffaf6] text-[#282424]">
      <AutoRedirect restaurantSlug={restaurantSlug} />

      {/* Soft decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#ffe9d9] via-[#fff3eb] to-transparent"
      />

      <div className="relative mx-auto w-full max-w-lg px-5 pb-8 pt-7 sm:px-8 sm:pt-10">
        {/* Restaurant identity */}
        <header className="text-center">
          <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-[28px] border border-white bg-white p-1.5 shadow-[0_8px_30px_rgba(100,55,25,0.09)]">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="h-full w-full rounded-[23px] object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-[23px] bg-[#fe5502] text-4xl font-bold text-white">
                {restaurant.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#fe5502]">
            Votre fidélité récompensée
          </p>

          <h1 className="mx-auto mt-2 max-w-full break-words text-2xl font-extrabold leading-tight tracking-tight text-[#282424] sm:text-3xl">
            {restaurant.name}
          </h1>

          <p className="mt-2 text-sm text-[#827a75]">
            Programme de fidélité
          </p>
        </header>

        {/* Keep existing automatic login behaviour */}
        <div className="mt-7">
          <AutoLogin restaurantSlug={restaurantSlug} />
        </div>

        {/* Welcome card */}
        <section className="mt-5 rounded-[26px] border border-[#f4e7de] bg-white p-5 shadow-[0_8px_30px_rgba(75,43,25,0.045)] sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#fe5502]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9l-5.25 2.8 1-5.85L3.5 9.7l5.9-.9L12 3.5z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[#282424]">
                Bienvenue !
              </h2>
              <p className="mt-1.5 text-[13px] leading-[1.8] text-[#77716d]">
                Créez votre compte pour cumuler des points et profiter de
                récompenses exclusives à chaque visite.
              </p>
            </div>
          </div>
        </section>

        {/* Registration / scanner component */}
        <section className="mt-4 rounded-[26px] border border-[#f0e6df] bg-white p-5 shadow-[0_12px_38px_rgba(75,43,25,0.065)] sm:p-6">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fe5502]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fe5502]">
                Votre espace client
              </p>
            </div>

            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#282424]">
              Rejoignez-nous
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#827a75]">
              Quelques instants suffisent pour commencer.
            </p>
          </div>

          <QRCodeScanner
            restaurantId={restaurant.id}
            restaurantSlug={restaurantSlug}
          />
        </section>

        {/* Home screen tip */}
        <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f5ddc9] bg-[#fff2e7] p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#fe5502]">
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <rect x="5" y="3" width="14" height="18" rx="2.5" />
              <path
                strokeLinecap="round"
                d="M9 6h6M10 18h4"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#9c4c21]">
              Un accès facile à chaque visite
            </p>
            <p className="mt-1 text-xs leading-[1.8] text-[#9b7560]">
              Après votre inscription, ajoutez cette page à l&apos;écran
              d&apos;accueil de votre téléphone pour retrouver votre espace
              fidélité rapidement.
            </p>
          </div>
        </aside>

        <footer className="pb-2 pt-6 text-center">
          <p className="text-[10px] tracking-wide text-[#a59a92]">
            Une expérience pensée pour vous
          </p>
        </footer>
      </div>
    </main>
  );
}
