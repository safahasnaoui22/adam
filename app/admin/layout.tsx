// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../lib/auth";

// Icons (using simple emoji or you can use lucide-react/heroicons)
// If you want real icons, install lucide-react: npm i lucide-react
// For now, we use text symbols for simplicity

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    console.log("⚠️ Non-admin tried to access admin area");
    if (session.user.role === "RESTAURANT_OWNER") {
      redirect("/dashboard");
    } else if (session.user.role === "CUSTOMER") {
      redirect("/client/dashboard");
    } else {
      redirect("/auth/signin");
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - fixed on the left */}
      <aside className="w-72 bg-white shadow-lg flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-[#fe5502]">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenue, {session.user.name}</p>
          <p className="text-xs text-gray-400">{session.user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink href="/admin/dashboard" icon="📊">
            Tableau de bord
          </SidebarLink>
          <SidebarLink href="/admin/users" icon="👥">
            Utilisateurs
          </SidebarLink>
          <SidebarLink href="/admin/restaurants" icon="🍽️">
            Restaurants
          </SidebarLink>
          <SidebarLink href="/admin/loyalty-program" icon="⭐">
            Programme de fidélité
          </SidebarLink>
          <SidebarLink href="/admin/rewards" icon="🎁">
            Récompenses
          </SidebarLink>
          <SidebarLink href="/admin/settings" icon="⚙️">
            Paramètres
          </SidebarLink>
        </nav>

        <div className="p-4 border-t">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>🚪</span> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main content - pushes to the right because sidebar is fixed */}
      <main className="flex-1 ml-72 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// Helper component for sidebar links with active highlighting (client component)
// Since layout is server component, we need to make this a client component or use "use client"
// We'll create a small client component for the links

function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  "use client";
  const { usePathname } = require("next/navigation");
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-[#fe5502] text-white shadow-md"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}