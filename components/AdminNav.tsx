// components/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Session } from "next-auth";

interface AdminNavProps {
  session: Session | null;
}

export default function AdminNav({ session }: AdminNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Restaurants", href: "/admin/restaurants", icon: "🏪" },
    { name: "Plans", href: "/admin/plans", icon: "💳" },
    { name: "Statistiques", href: "/admin/stats", icon: "📈" },
    { name: "Logs", href: "/admin/logs", icon: "📋" },
    { name: "Admins", href: "/admin/admins", icon: "👤" },
    { name: "Paramètres", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <nav className="bg-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Adam Platform</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-indigo-800 text-white"
                      : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-indigo-200">
              Admin: {session?.user?.name || session?.user?.email}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 py-2 bg-indigo-800 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}