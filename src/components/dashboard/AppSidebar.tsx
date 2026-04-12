"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const NAV = [
  { href: "/app", label: "Dashboard", icon: "📋" },
  { href: "/app/gastos", label: "Mis gastos", icon: "📅" },
  { href: "/app/ahorro", label: "Bolsillos de ahorro", icon: "🐷" },
  { href: "/app/deudas", label: "Deudas", icon: "💳" },
];

export default function AppSidebar({
  userName,
  isActive,
}: {
  userName: string;
  isActive: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const firstName = userName.split(" ")[0] || userName.split("@")[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#ffb8e0]">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-xl font-bold text-[#ec7fa9]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Finance BFFs
          </span>
          <span>💕</span>
        </Link>
        <p className="text-xs text-[#1a1a2e]/40 mt-1">Hola, {firstName} 👋</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#ec7fa9] text-white shadow-sm"
                  : "text-[#1a1a2e]/70 hover:bg-[#ffedfa] hover:text-[#ec7fa9]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Subscription status */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-[#ffedfa] border border-[#ffb8e0]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400" : "bg-orange-400"}`} />
          <span className="text-xs font-medium text-[#1a1a2e]/70">
            {isActive ? "Suscripción activa" : "Sin suscripción"}
          </span>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#1a1a2e]/50 hover:bg-[#ffedfa] hover:text-[#ec7fa9] transition-colors"
        >
          <span className="text-lg">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#ffb8e0] sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#ffb8e0] px-4 h-14 flex items-center justify-between">
        <span
          className="text-lg font-bold text-[#ec7fa9]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Finance BFFs 💕
        </span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-[#ec7fa9]">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top padding */}
      <div className="md:hidden h-14 w-full" />
    </>
  );
}
