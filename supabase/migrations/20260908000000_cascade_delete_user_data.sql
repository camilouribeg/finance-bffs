-- Al borrar un usuario de auth.users, borrar también sus datos financieros.
-- Antes solo profiles y cajitas tenían ON DELETE CASCADE; el resto bloqueaba el
-- borrado del usuario con un error de foreign key.

ALTER TABLE "public"."dashboard_mensual"
  DROP CONSTRAINT "dashboard_mensual_user_id_fkey",
  ADD CONSTRAINT "dashboard_mensual_user_id_fkey"
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."deudas"
  DROP CONSTRAINT "deudas_user_id_fkey",
  ADD CONSTRAINT "deudas_user_id_fkey"
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."gastos"
  DROP CONSTRAINT "gastos_user_id_fkey",
  ADD CONSTRAINT "gastos_user_id_fkey"
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."bolsillos"
  DROP CONSTRAINT "bolsillos_user_id_fkey",
  ADD CONSTRAINT "bolsillos_user_id_fkey"
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
