-- Epic Flujo de caja (roadmap 5.1): los ingresos semanales necesitan una fecha de
-- inicio para proyectar cada pago cada 7 dias.
alter table ingresos_fuentes add column fecha_inicio date;
