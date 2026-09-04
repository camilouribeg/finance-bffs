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

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, full_name, trial_ends_at, onboarding_completed")
    .eq("id", user.id)
    .single();

  // No profile yet or onboarding not done → send to onboarding
  if (!profile || !profile.onboarding_completed) redirect("/onboarding");

  const isActive = profile?.subscription_status === "active";
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const now = new Date();
  const isInTrial = trialEndsAt !== null && trialEndsAt > now;
  const trialDaysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const hasAccess = isActive || isInTrial;

  // Trial expired and no subscription → send to checkout
  if (!hasAccess) redirect("/app/checkout?expired=true");

  let banner: { type: "trial-ending" | "trial-ok"; days: number } | null = null;
  if (!isActive && isInTrial) {
    banner = { type: trialDaysLeft <= 7 ? "trial-ending" : "trial-ok", days: trialDaysLeft };
  }

  return (
    <div className="flex min-h-screen bg-[#ffedfa]">
      <AppSidebar userName={profile?.full_name ?? user.email ?? ""} isActive={isActive} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {banner && (
          <div className={`px-6 py-3 flex items-center justify-between border-b ${
            banner.type === "trial-ending"
              ? "bg-orange-50 border-orange-200"
              : "bg-[#ffedfa] border-[#ffb8e0]"
          }`}>
            <p className={`text-sm font-medium ${
              banner.type === "trial-ending" ? "text-orange-600" : "text-[#ec7fa9]"
            }`}>
              {banner.type === "trial-ending"
                ? `⏳ Tu periodo de prueba termina en ${banner.days} día${banner.days !== 1 ? "s" : ""}. Activa tu plan para no perder el acceso`
                : `✨ Tienes ${banner.days} días gratis restantes`}
            </p>
            <a
              href="/app/checkout"
              className={`text-xs text-white px-4 py-1.5 rounded-full font-semibold transition-colors ${
                banner.type === "trial-ending"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-[#ec7fa9] hover:bg-[#d96d97]"
              }`}
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
