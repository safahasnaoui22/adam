"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Palette,
  Star,
  QrCode,
  Gift,
  Users,
  Activity,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function DashboardNav() {
  const pathname = usePathname();

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Personnaliser la carte", href: "/dashboard/personalize", icon: Palette },
    { name: "Programme de fidélité", href: "/dashboard/loyalty-program", icon: Star },
    { name: "QR Code", href: "/dashboard/qr-code", icon: QrCode },
    { name: "Demandes de bonus", href: "/dashboard/bonus-requests", icon: Gift },
    { name: "Cartes client", href: "/dashboard/clients", icon: Users },
    { name: "Activités", href: "/dashboard/activities", icon: Activity },
    { name: "Statistiques", href: "/dashboard/stats", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-[var(--border)]">
        <span className="text-xl font-bold text-[var(--primary)]">BONOO.</span>
        <p className="text-xs text-[var(--text-muted)] mt-1">Restaurant Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}