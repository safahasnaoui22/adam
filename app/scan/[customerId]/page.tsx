import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ScanClientForm from "@/components/ScanClientForm";

interface PageProps {
  params: Promise<{ customerId: string }>;
}

export default async function ScanCustomerPage({ params }: PageProps) {
  const { customerId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.restaurantId) {
    redirect("/auth/signin");
  }

  const customer = await prisma.customerProfile.findFirst({
    where: {
      customerId: customerId,
      restaurantId: session.user.restaurantId,
    },
    include: {
      restaurant: {
        select: { urlSlug: true, name: true },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
    where: { restaurantId: session.user.restaurantId },
    include: {
      rewards: {
        where: { isActive: true },
        orderBy: { pointsRequired: "asc" },
      },
    },
  });

  const rewards = (loyaltyProgram?.rewards || []).map((r) => ({
    id: r.id,
    name: r.name,
    pointsRequired: r.pointsRequired,
    description: r.description ?? undefined,
  }));

  const getShortId = (fullId: string) => fullId.slice(-4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto transform transition-all duration-500 hover:scale-[1.01]">
        {/* Glass card with 3D shadow */}
        <div className="relative bg-[#0d1f3c]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#1e3a5f]/60 p-6 overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#fe5502]/20 to-[#e0682e]/20 opacity-0 hover:opacity-100 transition-opacity duration-700" />
          
          <h1 className="text-3xl font-bold text-center text-white mb-6">Fiche client</h1>

          <div className="space-y-5 mb-8">
            {/* Name with icon */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1628]/50 border border-[#1e3a5f]/30 hover:bg-[#0a1628] transition duration-300">
              <div className="p-2 bg-[#fe5502]/10 rounded-lg">
                <svg className="w-5 h-5 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Nom</p>
                <p className="text-lg font-semibold text-white">{customer.name}</p>
              </div>
            </div>

            {/* Customer ID with copy effect (optional) */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1628]/50 border border-[#1e3a5f]/30 hover:bg-[#0a1628] transition duration-300">
              <div className="p-2 bg-[#fe5502]/10 rounded-lg">
                <svg className="w-5 h-5 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">ID client</p>
                <p className="text-lg font-mono font-bold text-[#fe5502]">#{getShortId(customer.customerId)}</p>
                <p className="text-xs text-gray-500 break-all">{customer.customerId}</p>
              </div>
            </div>

            {/* Points with animated pulse effect */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1628]/50 border border-[#1e3a5f]/30 hover:bg-[#0a1628] transition duration-300">
              <div className="p-2 bg-[#fe5502]/10 rounded-lg">
                <svg className="w-5 h-5 text-[#fe5502]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">Points actuels</p>
                <p className="text-3xl font-bold text-orange-500 animate-pulse">{customer.points} ⭐</p>
              </div>
            </div>
          </div>

          <ScanClientForm
            customerId={customer.id}
            currentPoints={customer.points}
            rewards={rewards}
          />
        </div>
      </div>
    </div>
  );
}