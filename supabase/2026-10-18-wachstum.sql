-- ─────────────────────────────────────────────────────────────────────────
-- 2026-10-18-wachstum.sql — EINMAL im Supabase-SQL-Editor ausführen
-- (Supabase → Projekt → SQL Editor → New query → einfügen → Run).
--
-- Gehört zu: Partnerlinks, Bewertungsbitte, anonyme Zähler, Monatsauswertung
-- (siehe CHANGELOG.md, 18.10.2026). Das Skript kann gefahrlos mehrfach
-- laufen ("if not exists" / "create or replace").
--
-- REIHENFOLGE: Erst dieses Skript ausführen, dann den Pull Request mergen.
-- Der Code ist so gebaut, dass der Kauf auch ohne dieses Skript weiter
-- funktioniert (save-report.js speichert dann ohne die neuen Felder), aber
-- Zähler, Partnerzuordnung und Bewertungsbitte bleiben bis dahin leer.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Anonyme Tageszähler. Keine IP, kein Cookie, keine Nutzerkennung:
--    nur "an Tag X ist Ereignis Y n-mal passiert (ggf. über Partnercode Z)".
create table if not exists public.nkr_zaehler (
  tag      date    not null,
  ereignis text    not null,
  partner  text    not null default '',
  anzahl   integer not null default 0,
  primary key (tag, ereignis, partner)
);

-- Zeilenschutz an, ohne Policy: Mit dem öffentlichen anon-Schlüssel ist die
-- Tabelle weder lesbar noch beschreibbar. Zugriff nur über die
-- Server-Funktionen (api/zaehler.js, Monatsauswertung) mit service_role.
alter table public.nkr_zaehler enable row level security;

-- Atomares Hochzählen (zwei gleichzeitige Aufrufe zählen beide).
create or replace function public.nkr_zaehler_plus(p_ereignis text, p_partner text default '')
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.nkr_zaehler as z (tag, ereignis, partner, anzahl)
  values ((now() at time zone 'Europe/Berlin')::date, p_ereignis, coalesce(p_partner, ''), 1)
  on conflict (tag, ereignis, partner)
  do update set anzahl = z.anzahl + 1;
$$;

revoke all on function public.nkr_zaehler_plus(text, text) from public, anon, authenticated;
grant execute on function public.nkr_zaehler_plus(text, text) to service_role;

-- 2. Partnercode und Einwilligung in die Bewertungsbitte je Bestellung.
--    Bewusst nur in nkr_reports (nicht in nkr_purchases), damit der
--    Webhook (Vertragsbestätigung!) unverändert bleibt.
alter table public.nkr_reports add column if not exists partner text;
alter table public.nkr_reports add column if not exists bewertung_opt_in boolean not null default false;
alter table public.nkr_reports add column if not exists bewertung_gesendet boolean not null default false;
