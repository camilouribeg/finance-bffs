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
    <div className="flex min-h-screen bg-[#fff8f9]">
      <AppSidebar userName={profile?.full_name ?? user.email ?? ""} isActive={isActive} />
      <main className="flex-1 overflow-auto">
        {!isActive && (
          <div className="bg-[#fff0f3] border-b border-[#ffd6e0] px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-[#ff2d78] font-medium">
              🔒 Activa tu suscripción para acceder a todas las funciones
            </p>
            <a
              href="/app/checkout"
              className="text-xs bg-[#ff2d78] text-white px-4 py-1.5 rounded-full font-semibold hover:bg-[#e0255f] transition-colors"
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
