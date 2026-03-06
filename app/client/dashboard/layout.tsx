// app/client/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Only CUSTOMER can access client dashboard
  if (session.user.role !== "CUSTOMER") {
    console.log("⚠️ Non-customer tried to access client area");
    
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else if (session.user.role === "RESTAURANT_OWNER") {
      redirect("/dashboard");
    } else {
      redirect("/auth/signin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}