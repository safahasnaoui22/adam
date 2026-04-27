// app/dashboard/clients/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import CustomerDetail from "@/components/CustomerDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) redirect("/auth/signin");

  const { id } = await params;

  const customer = await prisma.customerProfile.findFirst({
    where: {
      id,
      restaurantId: session.user.restaurantId,
    },
    include: {
      visits: {
        orderBy: { date: "desc" },
      },
      earnedRewards: {
        include: { reward: true },
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
    where: { restaurantId: session.user.restaurantId },
    include: { rewards: { orderBy: { pointsRequired: "asc" } } },
  });

  const rewards = loyaltyProgram?.rewards || [];
  const nextReward = rewards.find(r => r.pointsRequired > customer.points);
  const progress = nextReward ? (customer.points / nextReward.pointsRequired) * 100 : 100;

  return (
    <CustomerDetail
      customer={customer}
      visits={customer.visits}
      earnedRewards={customer.earnedRewards}
      rewards={rewards}
      nextReward={nextReward || null}
      progress={progress}
    />
  );
}