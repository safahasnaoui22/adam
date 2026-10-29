// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import { prisma } from "@/app/lib/prisma";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to signin
  if (!session) {
    redirect("/auth/signin");
  }

  // Only ADMIN can access admin routes
  if (session.user.role !== "ADMIN") {
    console.log("⚠️ Non-admin tried to access admin area");

    // Redirect based on their actual role
    if (session.user.role === "RESTAURANT_OWNER") {
      redirect("/dashboard");
    } else if (session.user.role === "CUSTOMER") {
      redirect("/client/dashboard");
    } else {
      redirect("/auth/signin");
    }
  }

  // Badge in the sidebar: restaurants waiting for approval
  const pendingCount = await prisma.restaurant.count({
    where: { accountStatus: "PENDING" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav session={session} pendingCount={pendingCount} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
