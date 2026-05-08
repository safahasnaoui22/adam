// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
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

  // Only admins reach here
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav session={session} />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}