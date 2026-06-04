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
    { name: "Tableau de bord", href: "/dashboard" },
    { name: "Personnaliser la carte", href: "/dashboard/personalize" },
    { name: "Programme de fidélité", href: "/dashboard/loyalty-program" },
    { name: "QR Code", href: "/dashboard/qr-code" },
    { name: "Demandes de bonus", href: "/dashboard/bonus-requests" },
    { name: "Cartes client", href: "/dashboard/clients" },
    { name: "Activités", href: "/dashboard/activities" },
    { name: "Statistiques", href: "/dashboard/stats" },
  ];

  // Professional icon mapping for each route
  const iconMap: Record<string, React.ReactNode> = {
    "/dashboard": <LayoutDashboard size={20} />,
    "/dashboard/personalize": <Palette size={20} />,
    "/dashboard/loyalty-program": <Star size={20} />,
    "/dashboard/qr-code": <QrCode size={20} />,
    "/dashboard/bonus-requests": <Gift size={20} />,
    "/dashboard/clients": <Users size={20} />,
    "/dashboard/activities": <Activity size={20} />,
    "/dashboard/stats": <BarChart3 size={20} />,
  };

  return (
    <aside className="w-64 bg-[#382f45] border-r border-[#4f3f60] flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#4f3f60]">
        <div className="text-xl font-bold text-white">
          BONOO<span className="text-[#fe5502]">.</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Restaurant Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-[#fe5502] text-white"
                : "text-gray-300 hover:bg-[#4f3f60] hover:text-white"
            }`}
          >
            <span className="text-current shrink-0">{iconMap[item.href]}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-[#4f3f60]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-[#4f3f60] hover:text-white transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}