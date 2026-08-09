# Anleitung: Upload & Aktivierung

Drei Phasen, in dieser Reihenfolge: **1) Externe Dienste vorbereiten → 2) Code hochladen → 3) Testen.**

Warum diese Reihenfolge: Der Code prüft Umgebungsvariablen und Datenbankspalten beim Ausführen, nicht beim Hochladen. Lädst du zuerst den Code hoch und richtest Supabase/Stripe/Vercel erst danach ein, läuft die Seite in der Zwischenzeit live mit fehlenden Voraussetzungen — z. B. Login kaputt, Kauf-Protokollierung leer. Phase 1 zuerst vermeidet diese Lücke komplett, weil der *aktuell noch laufende* alte Code die neuen Variablen/Spalten einfach ignoriert.

---

## Phase 1 — Externe Dienste vorbereiten

Reihenfolge der Unterpunkte 1.1–1.5 untereinander egal. Ändert noch nichts am Live-Betrieb.

### 1.1 Supabase — Tabellen anlegen
Neues, leeres Projekt → die Tabellen existieren noch nicht, deshalb `create table` statt `alter table`. SQL-Editor in Supabase, einmal ausführen:
```sql
create table if not exists nkr_reports (
  id bigint generated always as identity primary key,
  session_id text not null unique,
  stufe text,
  adressen jsonb,
  werte jsonb,
  wohnung jsonb,
  email_sent boolean not null default false,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);
alter table nkr_reports enable row level security;

create table if not exists nkr_purchases (
  id bigint generated always as identity primary key,
  session_id text not null unique,
  email text,
  vorname text,
  purchased_at timestamptz not null default now(),
  marketing_opt_in boolean not null default false,
  versand_faellig_am timestamptz,
  followup_sent boolean not null default false,
  abgemeldet boolean not null default false
);
alter table nkr_purchases enable row level security;
```
- [ ] Ausgeführt
- [ ] Alte Tabelle `marketing_optins` gelöscht, falls sie aus einem früheren Versuch existiert (ersetzt durch `nkr_purchases`)

**Zusätzlich, 08/2026 — Rate-Limit-Tabelle für die Foto-Erkennung:**
```sql
create table if not exists nkr_foto_ratelimit (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
alter table nkr_foto_ratelimit enable row level security;
create index if not exists nkr_foto_ratelimit_ip_zeit on nkr_foto_ratelimit (ip_hash, created_at);
```
- [ ] Ausgeführt — ohne diese Tabelle läuft `api/analyse-foto.js` weiter (fail-open), aber ohne jede Kosten-Bremse gegen Missbrauch

**Warum `enable row level security` ohne zusätzliche Policy:** Der öffentliche Anon-Key (`VITE_SUPABASE_ANON_KEY`) liegt im Browser-Code und ist damit für jeden einsehbar. Ohne RLS könnte theoretisch jeder mit diesem Key direkt per REST-API auf `nkr_reports`/`nkr_purchases` zugreifen — vorbei an `get-report.js`/`my-reports.js` und deren eingebauten Prüfungen (Stripe-Zahlungsstatus, verifizierte E-Mail). Mit RLS aktiviert und ohne Policy kann der Anon-Key gar nichts lesen/schreiben; nur der `SUPABASE_SERVICE_ROLE_KEY` (den ausschließlich unsere serverseitigen `api/*.js`-Funktionen verwenden, nie der Browser) umgeht RLS automatisch. Genau das gewünschte Verhalten — kein zusätzlicher Schritt nötig.

### 1.2 Supabase — Auth (Magic-Link-Login)
- [ ] Authentication → Providers → "Email" mit Magic-Link/OTP aktiv (meist schon an)
- [ ] Authentication → URL Configuration → **Site URL** von `http://localhost:3000` (Supabase-Standardwert) auf `https://nebenkostenradar.com` ändern, "Save changes" klicken
- [ ] Authentication → URL Configuration → Redirect-URL hinzufügen: `https://nebenkostenradar.com/pruefen/konto`
- [ ] Authentication → Emails → SMTP Settings → eigenes SMTP eintragen: Host `smtp.resend.com`, Port `465`, Benutzer `resend`, Passwort = dein Resend-API-Key. (Ohne das ist der eingebaute Supabase-Mailversand auf 2 Mails/Stunde limitiert — für echten Betrieb unbrauchbar.)
- [ ] Gleiche Stelle: Sender email `noreply@nebenkostenradar.com`, Sender name `NebenkostenRadar`
- [ ] Authentication → Emails → Templates → "Magic Link" → Betreff `Dein Anmeldelink für NebenkostenRadar`, HTML-Body wie folgt einfügen (Vorschlag, bitte selbst gegenlesen — `{{ .ConfirmationURL }}` ist die von Supabase automatisch eingesetzte Link-Variable):

```html
<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:2px solid #dde1e7;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:38px;height:38px;"><img src="https://nebenkostenradar.com/logo-email.png" width="38" height="38" alt="NebenkostenRadar" style="display:block;border-radius:8px;"></td>
      <td style="padding-left:10px;">
        <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#3d7a5c;">Radar</span></div>
        <div style="font-size:10px;color:#3d7a5c;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">nebenkostenradar.com</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <p style="font-size:14px;color:#1a1a1a;margin:0 0 14px;">Hallo,</p>
    <p style="font-size:13px;color:#555e68;line-height:1.7;margin:0 0 16px;">
      du erhältst diese Mail, weil du dich soeben mit dieser E-Mail-Adresse auf <strong>nebenkostenradar.com</strong> für dein Kundenkonto angemeldet hast. Mit dem Button unten bestätigst du die Anmeldung:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:6px 0 18px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#B5502C;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;">Jetzt anmelden &#8594;</a>
    </td></tr></table>
    <p style="font-size:12px;color:#8a9199;line-height:1.7;margin:0 0 16px;">
      Der Link ist eine Stunde gültig und führt dich direkt in dein Kundenkonto — dort findest du alle deine bisherigen Prüfberichte zum jederzeit erneuten Download. Nichts erhalten? Schau auch im Spam- oder Werbeordner nach.
    </p>
    <div style="background:#F3ECDC;border:1px solid #E3D9C6;border-radius:8px;padding:12px 16px;margin-bottom:12px;">
      <div style="font-size:11.5px;color:#6B6152;line-height:1.6;">Diese Anmeldung nicht angefordert? Dann ignoriere diese Mail einfach — es passiert nichts, dein Konto bleibt unverändert.</div>
    </div>
    <p style="font-size:11px;color:#8a9199;line-height:1.7;margin:0 0 18px;">
      Zur sicheren Anmeldung nutzen wir Supabase, einen etablierten Anbieter für Nutzerkonten. Die Verarbeitung deiner Daten erfolgt dabei vertraglich abgesichert (Auftragsverarbeitung nach Art. 28 DSGVO) und DSGVO-konform. Details dazu in unserer <a href="https://nebenkostenradar.com/datenschutz" style="color:#3d7a5c;">Datenschutzerklärung</a>.
    </p>
    <p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0;">
      Viele Grüße aus Frankfurt sendet dir das Team von<br>NebenkostenRadar
    </p>
  </td></tr>
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">
      NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main<br>
      support@nebenkostenradar.com
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>
```
- [ ] Eingefügt und gegengelesen

*Bekannte Grenze:* Der Link selbst zeigt auf `<projekt-id>.supabase.co`, nicht auf eure Domain. Custom Domain würde das beheben, kostet aber 10 $/Monat zusätzlich zu Supabase Pro (ab 25 $/Monat) — bewusst nicht umgesetzt (Vorgabe: Supabase soll nichts kosten).

### 1.3 Stripe
- [ ] Zweiten Payment Link (7,99 €, Stufe "Auswertung") anlegen
- [ ] Bei **beiden** Payment Links: "Gutscheincodes zulassen" aktivieren
- [ ] Bei **beiden** Payment Links: Erfolgsseite auf `https://nebenkostenradar.com/pruefen/download?session={CHECKOUT_SESSION_ID}` setzen
- [ ] Gutscheincode `DANKE10` anlegen, gültig für beide Payment Links
- [ ] Webhook-Endpunkt anlegen: Developers → Webhooks → "Add endpoint" → URL `https://nebenkostenradar.com/api/webhook`, Event `checkout.session.completed` → "Signing secret" (`whsec_...`) kopieren und notieren, brauchst du gleich bei 1.4. **Ohne diesen Schritt läuft die komplette Rabatt-Mail-Funktion lautlos ins Leere** (PDF-Versand selbst ist davon nicht betroffen).
- [ ] Notiert für Phase 2: Link-URL des neuen Payment Links (für `STRIPE_LINK_AUSWERTUNG` im Code)

### 1.4 Vercel — Environment Variables
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET` ← der `whsec_...`-Wert aus 1.3
- [ ] `RESEND_API_KEY`
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (vermutlich schon gesetzt)
- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` ← der öffentliche Anon-Key, NICHT der Service-Role-Key (Supabase → Project Settings → API)
- [ ] `ANTHROPIC_API_KEY` (08/2026, für `api/analyse-foto.js` — Foto-Upload/Vorausfüllung auf `Wohnung.jsx`). **Eigener Eintrag, unabhängig vom gleichnamigen GitHub-Actions-Secret aus 1.5** — beide werden an unterschiedlichen Stellen gebraucht, einer ersetzt den anderen nicht. Ohne diesen Eintrag zeigt der Foto-Upload eine Fehlermeldung, alle anderen Funktionen (inkl. manuelle Eingabe) bleiben unberührt.

### 1.5 GitHub — Repository Secrets (Settings → Secrets and variables → Actions)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY`

(Deckt alle vier Workflows ab. `richtwerte-monitor.yml` braucht davon technisch keinen — nur den automatisch vorhandenen `GITHUB_TOKEN` — schadet aber nicht, wenn die drei trotzdem gesetzt sind.)

---

## Phase 2 — Code hochladen

- [ ] **Vor dem Upload:** In `src/config/business.js` bei `STRIPE_LINK_AUSWERTUNG` den in 1.3 notierten Link eintragen.
- [ ] **Vor dem Upload:** In `package.json` zu `dependencies` ergänzen:
  ```json
  "@react-pdf/renderer": "^4.0.0",
  "@supabase/supabase-js": "^2.45.0"
  ```
- [ ] github.com → dein Repo → "Add file" → "Upload files"
- [ ] Diese Ordner/Dateien reinziehen: `src`, `api`, `scripts`, `.github`, `docs`, `vercel.json`, `index.html`, `package.json`, `CHANGELOG.md` (GitHub fragt vor jedem Überschreiben nach Bestätigung). **`public/` nicht nötig** — `logo-email.png` liegt schon direkt in deinem Repo.
- [ ] Commit-Nachricht, z. B. "Modularer Neuaufbau, Kundenkonto, automatischer Rabattversand"
- [ ] Commit & Push → Vercel deployt automatisch

---

## Phase 3 — Testen

- [ ] Komplette Prüfung durchklicken (Startseite → Formular → Ergebnis)
- [ ] Kauf im Test-Modus bei Stripe: E-Mail-Felder bewusst einmal falsch wiederholen (Fehlermeldung muss erscheinen), dann korrekt ausfüllen
- [ ] Download-Seite: PDF lädt, Mail mit identischem PDF kommt an (Spam-Ordner prüfen), zweiter Seitenaufruf verschickt KEINE zweite Mail
- [ ] **Webhook prüfen:** Nach dem Testkauf in Supabase kontrollieren, ob in `nkr_purchases` eine neue Zeile mit der richtigen `session_id` erschienen ist. Falls nicht: Schritte 1.3/1.4 (Webhook-Endpunkt, `STRIPE_WEBHOOK_SECRET`) prüfen.
- [ ] Login testen: `/login` → E-Mail eingeben → Mail mit Magic-Link kommt an → Klick führt zu `/pruefen/konto` mit der gerade gekauften Prüfung
- [ ] Cookie-Banner: über einen Ratgeber-Artikel oder eine `/pruefen/*`-URL DIREKT einsteigen (nicht über "/") — Banner muss auch dort erscheinen; GA4 darf laut Netzwerk-Tab erst nach Klick auf "Akzeptieren" laden
- [ ] Mobile Ansicht: Hamburger-Menü prüfen
- [ ] Impressum/AGB/Datenschutz/Login/Konto: eigene URLs direkt aufrufbar (nicht nur über Navigation)

---

## Referenz (zum Nachschlagen, für die Ausführung nicht nötig)

**Was sich inhaltlich geändert hat, kurz:**
- `Download.jsx` versprach früher eine E-Mail, die nie verschickt wurde — jetzt wird sie tatsächlich verschickt (echter PDF-Anhang), gegen Doppelversand abgesichert.
- `webhook.js` verschickt keine Mail mehr selbst (hätte sonst leere Mails erzeugt, parallel zur echten aus `send-email.js`) — protokolliert nur noch den Kauf.
- `vercel.json` deckte nur die alten Routen ab, neue Seiten wären bei Direktaufruf/Reload auf 404 gelaufen — ergänzt.
- Logo in allen drei E-Mails korrigiert (zeigte vorher nur einen grünen Kasten statt des echten Logos).
- Eingabefelder: schmalere Zahlenfelder, deutscher Tausenderpunkt, graue Beispielwerte, Plausibilitätsgrenzen (Jahr, Fläche, Vorauszahlung).
- Kundenkonto-Hinweise ergänzt (Login-Bestätigung, Download-Seite, Konto-Seite, beide automatischen Mails weisen auf jederzeitigen Zugriff hin).
- `CookieBanner` lief bisher nur auf der Startseite — Besucher über andere Einstiegs-URLs sahen die Einwilligungsabfrage nie. Jetzt global in `App.jsx`.
- Ausführliche Historie: siehe `CHANGELOG.md`.

**Nicht angetastet:**
- `src/artikel.js` — deine echten Ratgeber-Artikel, unverändert übernehmen.
- `api/verify-payment.js` — wird von nichts mehr aufgerufen (Prüfung läuft jetzt in `get-report.js` mit), kannst du behalten oder entfernen.
- `api/messages.js` — der alte KI-Analyse-Pfad wurde aus `vercel.json` entfernt, die Datei selbst liegt weiter im Repo, wird aber nicht mehr angesprochen.

**Rechtlicher Hinweis** (keine Rechtsberatung): Das Opt-in-Verfahren für die Rabatt-Mail wurde bewusst so gewählt (nicht § 7 Abs. 3 UWG ohne Einwilligung), weil die E-Mail-Adresse ursprünglich über Stripe erhoben worden wäre. Empfehlenswert, das Verfahren einmal von einem Anwalt/Datenschutzbeauftragten gegenprüfen zu lassen, bevor es live läuft.

**GitHub Actions Workflows** (laufen automatisch nach dem Push, zum Testen: Actions-Tab → Workflow → "Run workflow"):
- `richtwerte-monitor.yml` — monatlich, prüft DMB-Richtwerte
- `marketing-rabatt-versand.yml` — täglich, verschickt fällige Rabatt-Mails
- `supabase-keepalive.yml` — täglich, verhindert Auto-Pause des kostenlosen Supabase-Projekts
- `datenloeschung.yml` — wöchentlich, löscht Daten älter als 12 Monate

Wenn du magst, sag einfach Bescheid, sobald du beim Hochladen bist — dann gehen wir das gemeinsam Schritt für Schritt durch.
