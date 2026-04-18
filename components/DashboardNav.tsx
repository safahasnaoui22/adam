"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardNav() {
  const pathname = usePathname();

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: "📊" },
    { name: "Personnaliser la carte", href: "/dashboard/personalize", icon: "🎨" },
    { name: "Programme de fidélité", href: "/dashboard/loyalty-program", icon: "⭐" },
    { name: "Clients", href: "/dashboard/clients", icon: "👥" },
    { name: "QR Code", href: "/dashboard/qr-code", icon: "📱" },
    { name: "Demandes de bonus", href: "/dashboard/bonus-requests", icon: "🎁" },
  ];

  return (
    <aside className="w-64 bg-[#0d1f3c] border-r border-[#1e3a5f] flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#1e3a5f]">
        <span className="text-xl font-bold text-[#fe5502]">Adam</span>
        <p className="text-xs text-gray-500 mt-1">Restaurant Dashboard</p>
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
                : "text-gray-400 hover:bg-[#1e3a5f] hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-[#1e3a5f]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-[#1e3a5f] hover:text-white transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}