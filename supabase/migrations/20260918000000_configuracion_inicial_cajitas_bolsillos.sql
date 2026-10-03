-- Epic Dashboard Refinamientos (roadmap 4.13/4.14)
-- Flag de configuracion inicial ("ya cree el bolsillo/sobre real en mi banco para esto"):
-- una sola vez, no se resetea mensualmente, y es independiente del check mensual de
-- confirmaciones_mensuales (4.1/4.2).

alter table cajitas add column configurada_en_banco boolean not null default false;
alter table cajitas add column medio_configuracion text check (medio_configuracion in ('banco', 'efectivo'));

alter table bolsillos add column configurada_en_banco boolean not null default false;
alter table bolsillos add column medio_configuracion text check (medio_configuracion in ('banco', 'efectivo'));
