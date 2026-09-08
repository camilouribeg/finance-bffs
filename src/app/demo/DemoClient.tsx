"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DemoClient() {
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          setError(error.message);
          return;
        }
      }
      // Nav dura: que el servidor tome la sesión nueva antes de entrar al onboarding.
      window.location.href = "/onboarding";
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#ffedfa] flex items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <p
          className="text-2xl font-bold text-[#ec7fa9] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Amy
        </p>
        {error ? (
          <>
            <p className="text-sm text-[#1a1a2e]/70">
              No se pudo abrir la demo en este momento.
            </p>
            <p className="text-xs text-[#1a1a2e]/40 mt-2">{error}</p>
          </>
        ) : (
          <p className="text-sm text-[#1a1a2e]/60">Preparando tu demo…</p>
        )}
      </div>
    </div>
  );
}
