import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type CompleteOnboardingBody = {
  method?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CompleteOnboardingBody;

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 40);

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      trial_ends_at: trialEndsAt.toISOString(),
      ...(body.method ? { debt_method: body.method } : {}),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, trial_ends_at: trialEndsAt.toISOString() });
}
