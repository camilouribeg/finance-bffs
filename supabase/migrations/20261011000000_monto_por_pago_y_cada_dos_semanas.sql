-- Epic Flujo de caja (roadmap 5.2, 5.1): cada fecha de pago tiene su propio monto, y
-- "cada dos semanas" deja de confundirse con "quincenal" (dos fechas fijas del mes).

alter table ingresos_fuentes rename column monto to monto_1;
alter table ingresos_fuentes add column monto_2 numeric check (monto_2 >= 0);

-- Elimina el check de frecuencia existente sin asumir su nombre exacto (lo genero
-- Postgres automaticamente al crear la tabla).
do $$
declare
  nombre_constraint text;
begin
  select con.conname into nombre_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'ingresos_fuentes'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%frecuencia%';
  if nombre_constraint is not null then
    execute format('alter table ingresos_fuentes drop constraint %I', nombre_constraint);
  end if;
end $$;

alter table ingresos_fuentes add constraint ingresos_fuentes_frecuencia_check
  check (frecuencia in ('semanal', 'quincenal', 'cada_dos_semanas', 'mensual', 'variable'));
