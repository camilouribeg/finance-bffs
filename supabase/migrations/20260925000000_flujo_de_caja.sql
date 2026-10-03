-- Epic Flujo de caja y ciclos de ingreso (roadmap 5.1-5.3, 5.8)
-- Fuentes de ingreso con su frecuencia, obligaciones recurrentes con dia de pago,
-- saldo en cuenta escrito a mano, y reservas por periodo de ingreso.

create table ingresos_fuentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  monto numeric not null check (monto >= 0),
  frecuencia text not null check (frecuencia in ('semanal', 'quincenal', 'mensual', 'variable')),
  -- dia del mes (quincenal: dos dias; mensual: uno). Semanal/variable: null.
  dia_1 smallint check (dia_1 between 1 and 31),
  dia_2 smallint check (dia_2 between 1 and 31),
  created_at timestamptz not null default now()
);

create table obligaciones_recurrentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  monto numeric not null check (monto >= 0),
  dia_pago smallint not null check (dia_pago between 1 and 31),
  created_at timestamptz not null default now()
);

-- Saldo que la usuaria ve en su cuenta bancaria (5.8). Uno por usuaria.
create table saldo_cuenta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saldo numeric not null default 0,
  actualizado_at timestamptz not null default now()
);

-- Reserva para cubrir un hueco de liquidez antes de un ingreso (5.5, 5.9).
create table reservas_ciclo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fin date not null,
  monto numeric not null check (monto >= 0),
  apartada boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, periodo_inicio, periodo_fin)
);

alter table ingresos_fuentes enable row level security;
alter table obligaciones_recurrentes enable row level security;
alter table saldo_cuenta enable row level security;
alter table reservas_ciclo enable row level security;

create policy "propias ingresos_fuentes" on ingresos_fuentes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "propias obligaciones_recurrentes" on obligaciones_recurrentes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "propias saldo_cuenta" on saldo_cuenta
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "propias reservas_ciclo" on reservas_ciclo
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
