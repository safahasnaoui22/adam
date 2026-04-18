import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import { authOptions } from "../lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role === "ADMIN") {
    console.log("⚠️ Admin tried to access dashboard, redirecting to /admin");
    redirect("/admin");
  }

  if (session.user.role === "CUSTOMER") {
    console.log("⚠️ Customer tried to access restaurant dashboard, redirecting to /client/dashboard");
    redirect("/client/dashboard");
  }

  if (session.user.role !== "RESTAURANT_OWNER") {
    console.log("⚠️ Unknown role, redirecting to signin");
    redirect("/auth/signin");
  }

  // Changed: flex layout with sidebar on left, dark blue background
  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      <DashboardNav />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}