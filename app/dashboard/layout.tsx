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

  // If not logged in, redirect to signin
  if (!session) {
    redirect("/auth/signin");
  }

  // IMPORTANT: If user is ADMIN, they should NOT be in the restaurant dashboard!
  if (session.user.role === "ADMIN") {
    console.log("⚠️ Admin tried to access dashboard, redirecting to /admin");
    redirect("/admin");
  }

  // If user is CUSTOMER, they should be in client dashboard
  if (session.user.role === "CUSTOMER") {
    console.log("⚠️ Customer tried to access restaurant dashboard, redirecting to /client/dashboard");
    redirect("/client/dashboard");
  }

  // At this point, only RESTAURANT_OWNER should proceed
  if (session.user.role !== "RESTAURANT_OWNER") {
    console.log("⚠️ Unknown role, redirecting to signin");
    redirect("/auth/signin");
  }

  // Only restaurant owners reach here
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}