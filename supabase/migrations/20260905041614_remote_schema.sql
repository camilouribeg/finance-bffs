SET local check_function_bodies = off;

CREATE TABLE "public"."bolsillos" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"       uuid                     NOT NULL,
  "nombre"        text                     NOT NULL,
  "meta"          numeric                  NOT NULL,
  "actual"        numeric                  DEFAULT 0,
  "emoji"         text                     DEFAULT '🐷'::text,
  "created_at"    timestamp with time zone DEFAULT now(),
  "tipo"          text                     DEFAULT 'fondos'::text,
  "importancia"   integer                  DEFAULT 3,
  "fecha_meta"    date,
  "cuota_mensual" numeric                  DEFAULT 0,
  "celebrado"     boolean                  DEFAULT false,
  CONSTRAINT "bolsillos_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."bolsillos"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."cajitas" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "nombre"      text                     NOT NULL,
  "monto_total" numeric                  NOT NULL DEFAULT 0,
  "fecha_pago"  date                     NOT NULL,
  "emoji"       text                     DEFAULT '📦'::text,
  "actual"      numeric                  NOT NULL DEFAULT 0,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "cajitas_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."cajitas"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."dashboard_mensual" (
  "id"                     uuid    NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                uuid    NOT NULL,
  "month"                  integer NOT NULL,
  "year"                   integer NOT NULL,
  "ingreso_fijo"           numeric DEFAULT 0,
  "ingreso_variable"       numeric DEFAULT 0,
  "otros_ingresos"         numeric DEFAULT 0,
  "gastos_fijos"           numeric DEFAULT 0,
  "gastos_variables"       numeric DEFAULT 0,
  "deudas_cuotas"          numeric DEFAULT 0,
  "ahorro"                 numeric DEFAULT 0,
  "ingresos_otros"         jsonb   DEFAULT '[]'::jsonb,
  "gastos_fijos_items"     jsonb   DEFAULT '[]'::jsonb,
  "gastos_variables_items" jsonb   DEFAULT '[]'::jsonb,
  CONSTRAINT "dashboard_mensual_pkey" PRIMARY KEY (id),
  CONSTRAINT "dashboard_mensual_user_id_month_year_key" UNIQUE (user_id, month, year)
);

ALTER TABLE "public"."dashboard_mensual"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."deudas" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "nombre"          text                     NOT NULL,
  "tipo"            text                     NOT NULL,
  "cuota_mensual"   numeric                  NOT NULL,
  "total_pendiente" numeric                  NOT NULL,
  "created_at"      timestamp with time zone DEFAULT now(),
  "tasa"            numeric,
  CONSTRAINT "deudas_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."deudas"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."gastos" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "fecha"       date                     NOT NULL,
  "categoria"   text                     NOT NULL,
  "descripcion" text                     NOT NULL,
  "valor"       numeric                  NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "gastos_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."gastos"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"                   uuid                     NOT NULL,
  "full_name"            text,
  "email"                text,
  "subscription_status"  text                     DEFAULT 'inactive'::text,
  "stripe_customer_id"   text,
  "created_at"           timestamp with time zone DEFAULT now(),
  "last_name"            text,
  "phone"                text,
  "onboarding_completed" boolean                  DEFAULT false,
  "debt_method"          text,
  "trial_ends_at"        timestamp with time zone,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
  begin
    insert into public.profiles (id, full_name, email)
    values (new.id, new.raw_user_meta_data->>'full_name', new.email);
    return new;
  end;
  $function$;

ALTER TABLE "public"."bolsillos"
  ADD CONSTRAINT "bolsillos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."cajitas"
  ADD CONSTRAINT "cajitas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."dashboard_mensual"
  ADD CONSTRAINT "dashboard_mensual_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."deudas"
  ADD CONSTRAINT "deudas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."gastos"
  ADD CONSTRAINT "gastos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users see own bolsillos" ON "public"."bolsillos"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "cajitas_all" ON "public"."cajitas"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users see own dashboard" ON "public"."dashboard_mensual"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users see own deudas" ON "public"."deudas"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users see own gastos" ON "public"."gastos"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "users_select_own_profile" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "users_update_own_profile" ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."bolsillos" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."cajitas" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."dashboard_mensual" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deudas" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."gastos" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

