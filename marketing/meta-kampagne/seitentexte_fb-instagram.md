# Seitentexte für Facebook-Seite & Instagram-Profil

Stand: 12.08.2026

## Facebook-Seite

**Seitenname:** NebenkostenRadar

**Kategorie:** Vorschlag "Beratung" oder "Verbraucherorganisation" (Facebook bietet keine exakt passende Kategorie für "Online-Tool"; eine dieser beiden kommt der Funktion am nächsten und wirkt vertrauenswürdiger als z. B. "Software").

**Kurzbeschreibung (max. 255 Zeichen, erscheint unter dem Seitennamen):**
> Unabhängige Prüfung deiner Nebenkostenabrechnung in 3 Minuten. Kostenloser Check, ob deine Abrechnung stimmt — ohne Anmeldung.

**Langtext / Info-Bereich ("Über diese Seite" bzw. "Unternehmensbeschreibung"):**
> Jede zweite Nebenkostenabrechnung in Deutschland enthält Fehler — von falschen Umlageschlüsseln bis zu nicht umlagefähigen Positionen. NebenkostenRadar prüft deine Abrechnung automatisch gegen die gesetzlichen Vorgaben (BGB, BetrKV) und aktuelle Vergleichswerte (Deutscher Mieterbund) und zeigt dir in wenigen Minuten, ob und wo sich ein Widerspruch lohnt. Kein Vertrag, keine Anmeldung, keine Weitergabe deiner Daten an Dritte.
>
> Wichtig: NebenkostenRadar ist ein automatisiertes Prüf-Tool, keine Rechtsberatung und kein Mieterverein. Bei komplexen Fällen empfehlen wir zusätzlich den örtlichen Mieterverein oder eine Rechtsanwältin/einen Rechtsanwalt für Mietrecht.

**Website:** https://nebenkostenradar.com

**Call-to-Action-Button (Facebook-Seite, oben rechts):** "Jetzt kontaktieren" ist nicht passend — besser: "Mehr dazu" (Facebook-Bezeichnung: "Learn More") mit Ziel-Link zur Startseite.

## Instagram-Profil

**Name (Anzeigename, 30 Zeichen):** NebenkostenRadar

**Benutzername (@handle):** @nebenkostenradar (falls belegt: @nebenkostenradar.de)

**Kategorie:** Beratung / Verbraucherservice

**Bio (max. 150 Zeichen, inkl. Zeilenumbrüche):**
> Ist deine Nebenkostenabrechnung korrekt? 🔍
> Kostenloser Check in 3 Minuten
> Keine Anmeldung nötig
> 👇

**Link (Link-in-Bio-Feld):** https://nebenkostenradar.com

**Hinweis zur Emoji-Nutzung:** Die 🔍/👇 oben sind optional — falls eine zurückhaltendere, sachlichere Außendarstellung gewünscht ist (passend zum "unabhängige Prüfung"-Anspruch der Marke), ersatzlos streichen.

---

## Freigegebene Anzeigen (Stand 12.08.2026)

Drei Varianten in `bildmaterial/`, alle 1080×1080 (kompatibel mit FB-Feed und Insta-Feed):

- `anzeige_feed_provokant-drauf_1080x1080.png` — "Zahlst du drauf – ohne es zu merken?"
- `anzeige_feed_provokant-glaubnicht_1080x1080.png` — "Glaub nicht alles, was da steht."
- `anzeige_feed_vertrauen-mieter-fuer-mieter_1080x1080.png` — "Von Mieter für Mieter" / "Gebaut, damit du nicht drauf zahlst." Vertrauens-Gegenpol zu den beiden provokanten Varianten, grüner statt terrakottafarbener Akzent (Farbrolle laut `theme.js`: Grün = Vertrauenselemente).

**Vertrauens-Variante bestätigt (12.08.2026):** Stefan wohnt seit jeher zur Miete — der Claim "Von Mieter für Mieter" ist zutreffend, keine weitere Freigabe nötig.

## Instagram-Content-Posts (organisch, kein Ad-Budget)

Drei Posts in `../instagram-content/`, ebenfalls 1080×1080, ohne CTA-Button (organische Posts sind komplett klickbar über den Profil-Link, nicht über ein Bild-Element — daher hier `@nebenkostenradar`-Handle statt Button):

- `post_1_listicle-3-fehler_1080x1080.png` — 3 Beispiele nicht/schwer umlagefähiger Posten, alle aus bereits auf der Website verwendeten, belegten Fakten (Verwaltungskosten § 1 Abs. 2 BetrKV, Kabelanschluss seit 07/2024, Fristprüfung § 556 Abs. 3 BGB).
- `post_2_statistik-fakt_1080x1080.png` — 50 %-Statistik, Quelle Deutscher Mieterbund (identisch zur Startseiten-Angabe).
- `post_3_so-funktionierts_1080x1080.png` — 3-Schritte-Erklärung, entspricht dem echten Formular-Ablauf (Wohnung → Posten → Adressen).

## Wie der Anzeigen-Button tatsächlich funktioniert

Der "Jetzt kostenlos prüfen"-Button im Bild ist rein gestalterisch, kein anklickbares Element — Bild-Dateien sind keine Links. Bei Meta Ads ist immer die gesamte Anzeige klickbar (Bild + der von Meta selbst gerenderte CTA-Button darunter). Die eigentliche Verlinkung passiert im Anzeigen-Setup in Ads Manager:

1. Feld "Website-URL" (Zielseite) → `https://nebenkostenradar.com`
2. CTA-Button-Typ aus Metas fester Liste wählen (kein Freitext möglich) — empfohlen: "Mehr dazu" (Learn More), neutral und ohne falsche Erwartung (z. B. suggeriert "Jetzt registrieren" ein Konto, das es nicht gibt).

## Hinweis zur Schriftart in den Bild-Assets

Die Bild-Dateien in diesem Ordner (`bildmaterial/`) wurden mit der Ersatzschrift DejaVu Sans erzeugt, nicht mit den tatsächlichen Marken-Schriftarten der Website (Poppins/Work Sans aus `theme.js`). Grund: Google Fonts war aus der Sandbox-Umgebung nicht erreichbar. Optisch sehr nah dran, aber kein Pixel-genauer Markenabgleich. Für eine exakte Übereinstimmung müsste ein Design-Tool (z. B. Canva, Figma) mit den echten Fonts verwendet werden — inhaltlich (Farben, Texte, Icon-Form) sind die Dateien bereits korrekt nach `theme.js`.
