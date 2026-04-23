import type { SignalType } from "@/types";

export interface ResearchTopic {
  query: string;
  type: SignalType;
  priority: 1 | 2 | 3;
  label: string; // shown in UI progress
}

// Priority 1 — Direct competitors (most business-critical)
// Priority 2 — Patents & technology signals
// Priority 3 — Market & regulatory trends

export const RESEARCH_TOPICS: ResearchTopic[] = [
  // ── Competitors ────────────────────────────────────────────────────────────
  {
    query: "Geberit neue Produkte Pressverbindung Installationstechnik 2025",
    type: "competitor",
    priority: 1,
    label: "Geberit — Neuheiten",
  },
  {
    query: "Geberit acquisition partnership strategy 2025",
    type: "competitor",
    priority: 1,
    label: "Geberit — Strategie",
  },
  {
    query: "Conex Bänninger press fitting new product launch 2025",
    type: "competitor",
    priority: 1,
    label: "Conex Bänninger",
  },
  {
    query: "TECE Installationstechnik Neuheiten Pressfit 2025",
    type: "competitor",
    priority: 1,
    label: "TECE",
  },
  {
    query: "Schell Armaturen neue Produkte Trinkwasser 2025",
    type: "competitor",
    priority: 1,
    label: "Schell Armaturen",
  },
  {
    query: "Aalberts Industries Aliaxis plumbing acquisition 2025",
    type: "competitor",
    priority: 1,
    label: "Aalberts / Aliaxis",
  },
  {
    query: "NIBCO press fitting smart plumbing USA Europe 2025",
    type: "competitor",
    priority: 1,
    label: "NIBCO",
  },

  // ── Patents ─────────────────────────────────────────────────────────────────
  {
    query: "smart press fitting IoT Bluetooth verification patent EPO DPMA 2025",
    type: "patent",
    priority: 2,
    label: "IoT Press Fitting Patent",
  },
  {
    query: "Trinkwasser Hygiene Armatur Werkstoff Patent 2025 bleifreies Lot",
    type: "patent",
    priority: 2,
    label: "Trinkwasser-Material Patent",
  },
  {
    query: "underfloor heating smart control patent EU 2025",
    type: "patent",
    priority: 2,
    label: "Smart Heating Patent",
  },
  {
    query: "press fitting corrosion resistant alloy patent 2025",
    type: "patent",
    priority: 2,
    label: "Korrosionsschutz Patent",
  },

  // ── Market & Regulation ─────────────────────────────────────────────────────
  {
    query: "EU Trinkwasserrichtlinie 2026 Installationstechnik Anforderungen",
    type: "market",
    priority: 3,
    label: "EU Trinkwasserrichtlinie 2026",
  },
  {
    query: "modular data center cooling pipe system market 2025",
    type: "market",
    priority: 3,
    label: "Rechenzentrum Kühlung",
  },
  {
    query: "smart home Gebäudetechnik Heizung Kühlung Markttrend 2025",
    type: "market",
    priority: 3,
    label: "Smart Building Markt",
  },
  {
    query: "Wärmepumpe Flächenheizung Installation Europa Markt 2025",
    type: "market",
    priority: 3,
    label: "Wärmepumpe Markt",
  },
  {
    query: "DACH Sanitärinstallation Fachkräftemangel Digitalisierung 2025",
    type: "market",
    priority: 3,
    label: "DACH Installateur Trends",
  },
];

export const TOPICS_BY_PRIORITY = {
  competitors: RESEARCH_TOPICS.filter((t) => t.priority === 1),
  patents: RESEARCH_TOPICS.filter((t) => t.priority === 2),
  market: RESEARCH_TOPICS.filter((t) => t.priority === 3),
};
