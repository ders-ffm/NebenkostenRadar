// ─────────────────────────────────────────────────────────────────────────
// supabaseClient.js — Browser-seitiger Supabase-Client, NUR für Supabase Auth
// (Magic-Link-Login). Nutzt bewusst den ANON-Key (öffentlich, sicher fürs
// Frontend) — NIEMALS den SERVICE_ROLE_KEY hier verwenden, der gehört
// ausschließlich in serverseitigen Code (api/*.js).
//
// Benötigte Vite-Umgebungsvariablen (in Vercel eintragen, siehe
// ANLEITUNG-UPLOAD.md):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn("Supabase-Client nicht konfiguriert — VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY fehlen. Login funktioniert nicht.");
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
