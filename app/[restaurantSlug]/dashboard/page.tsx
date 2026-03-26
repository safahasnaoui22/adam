// app/[restaurantSlug]/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import CustomerDashboard from "@/components/CustomerDashboard";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default async function CustomerDashboardPage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.customerProfile) {
    redirect(`/${restaurantSlug}`);
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
    include: {
      loyaltyProgram: {
        include: {
          rewards: true,
        },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      visits: {
        orderBy: { date: "desc" },
        take: 10,
      },
      earnedRewards: {
        where: { usedAt: null },
        include: { reward: true },
      },
    },
  });

  if (!customer) {
    redirect(`/${restaurantSlug}`);
  }

  // Calculate next rewards
  const rewards = restaurant.loyaltyProgram?.rewards || [];
  const sortedRewards = [...rewards].sort((a, b) => a.pointsRequired - b.pointsRequired);
  
  const nextReward = sortedRewards.find(r => r.pointsRequired > customer.points);
  const currentProgress = nextReward 
    ? (customer.points / nextReward.pointsRequired) * 100 
    : 100;

  return (
    <CustomerDashboard
      restaurant={restaurant}
      customer={customer}
      rewards={sortedRewards}
      nextReward={nextReward}
      currentProgress={currentProgress}
    />
  );
}