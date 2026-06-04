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
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <span style={{ color: "var(--primary)" }}>BONOO.</span>
        <p style={{ fontSize: "0.7rem", marginTop: "4px", opacity: 0.7 }}>
          Restaurant Dashboard
        </p>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <Icon size={20} style={{ marginRight: "12px" }} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div style={{ marginTop: "auto" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="menu-item"
          style={{ width: "100%", textAlign: "left", background: "none" }}
        >
          <LogOut size={20} style={{ marginRight: "12px" }} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}