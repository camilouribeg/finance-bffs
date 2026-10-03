-- Epic Dashboard + Mis deudas (roadmap 4.1-4.9)
-- Mecanismo de confirmacion mensual por item (cajita/bolsillo/deuda) y
-- saldo_inicial en deudas para medir progreso (4.8/4.9).

create table confirmaciones_mensuales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('cajita', 'bolsillo', 'deuda')),
  item_id uuid not null,
  mes smallint not null check (mes between 1 and 12),
  anio smallint not null,
  tipo_pago text check (tipo_pago in ('cuota', 'abono_capital')),
  monto numeric,
  saldo_resultante numeric,
  confirmado_at timestamptz not null default now(),
  unique (user_id, tipo, item_id, mes, anio)
);

alter table confirmaciones_mensuales enable row level security;

create policy "select propias" on confirmaciones_mensuales
  for select using (auth.uid() = user_id);

create policy "insert propias" on confirmaciones_mensuales
  for insert with check (auth.uid() = user_id);

create policy "update propias" on confirmaciones_mensuales
  for update using (auth.uid() = user_id);

create policy "delete propias" on confirmaciones_mensuales
  for delete using (auth.uid() = user_id);

alter table deudas add column saldo_inicial numeric;
update deudas set saldo_inicial = total_pendiente where saldo_inicial is null;
