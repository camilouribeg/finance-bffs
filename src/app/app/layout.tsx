import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/dashboard/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, full_name")
    .eq("id", user.id)
    .single();

  const isActive = profile?.subscription_status === "active";

  return (
    <div className="flex min-h-screen bg-[#ffedfa]">
      <AppSidebar userName={profile?.full_name ?? user.email ?? ""} isActive={isActive} />
      <main className="flex-1 overflow-auto">
        {!isActive && (
          <div className="bg-[#ffedfa] border-b border-[#ffb8e0] px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-[#ec7fa9] font-medium">
              🔒 Activa tu suscripción para acceder a todas las funciones
            </p>
            <a
              href="/app/checkout"
              className="text-xs bg-[#ec7fa9] text-white px-4 py-1.5 rounded-full font-semibold hover:bg-[#d96d97] transition-colors"
            >
              Activar ahora →
            </a>
          </div>
        )}
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
