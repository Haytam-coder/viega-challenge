export const MOCK_SIGNALS = [
  {
    type: "competitor",
    title: "AquaSystems Inc. launches 'Smart-Press' fitting with IoT verification — claims 30% faster installation",
    description:
      "Direct competitor files EU patents for IoT-enabled press fitting with Bluetooth compliance logging, targeting Viega's Megapress home markets.",
    source: "Press Release + USPTO / EPO Patent Database",
    tags: ["competitor", "press-fittings", "IoT", "patent", "installation-speed", "compliance"],
    rawContent: `AquaSystems Inc. filed patent US2024/0123456 for an electromagnetic press verification system embedded in their new Smart-Press fitting series. The system confirms proper press connection via Bluetooth to a paired mobile app, auto-logging each joint with timestamp, GPS coordinates, and installer ID. The PR claims 30% installation time reduction versus standard press fittings due to elimination of manual inspection steps.

Technology analysis reveals direct overlap with Viega's Megapress system but with an added IoT verification and compliance-logging layer. Three EU counterpart patent applications have been filed in Germany (DE102024123456), Austria (AT502024123456), and Netherlands (NL9024123456) — all core Viega markets.

Geberit has not publicly responded to the announcement. Installer forums (ZVSHK community, SHK-Journal) show strong positive interest, with multiple posts highlighting that the compliance documentation feature would significantly reduce liability exposure for installers. Current Viega Megapress has no digital verification layer. The patent filing date is March 14, 2024.`,
  },
  {
    type: "market",
    title: "340+ professional posts document surging cooling installation costs in modular data centers",
    description:
      "Growing forum discussion reveals a critical unmet need for flexible, reconfigurable press fitting solutions in the fast-growing modular data center segment.",
    source: "LinkedIn HVAC Engineering Groups, TGA Fachplaner Forums, Reddit r/HVAC",
    tags: ["market-signal", "data-centers", "cooling", "modular-construction", "pain-point", "installer"],
    rawContent: `Systematic analysis of 340+ posts across LinkedIn (HVAC Professional Network DE/AT, 12,000 members), TGA Fachplaner forum (Germany's largest technical planner community), and Reddit r/HVAC shows a 3x spike in modular data center cooling installation discussions over a 6-month window (Oct 2023 – Mar 2024).

Key recurring pain points identified:
1. Pre-fabricated cooling manifolds don't fit modular rack units — standard dimension mismatches force custom adapters that add 40-60% to cooling system installation cost.
2. Planners specify cooling systems before final rack layout is confirmed, causing expensive rework. Modular data centers change configuration 2-3x during build phase.
3. Standard press fittings (including Viega Megapress) lack the flexibility for rapid reconfiguration — installers describe needing to cut and repress connections multiple times as layouts evolve.
4. Increasing use of adiabatic cooling requires non-standard pipe routing that current fitting systems don't accommodate well.

Competitive mentions in posts: Geberit (12 mentions, mostly Mapress system), Viega (8 mentions, Megapress), TECE (4 mentions). Sentiment: urgent, unresolved. No dominant solution mentioned. The modular data center market in DACH is growing at ~35% YoY per Gartner estimates.`,
  },
  {
    type: "patent",
    title: "TU Delft publishes lead-free Bi-Sn-Ag solder achieving drinking water safety 1000x below EU limits",
    description:
      "Novel research-stage alloy from Netherlands university offers potential path to EU 2026 drinking water compliance with no cost premium — strategic partnership window is open.",
    source: "Journal of Materials Science (Vol. 59, 2024) + EPO Patent Register",
    tags: ["patent", "materials", "drinking-water", "green-technology", "EU-regulation", "research", "sustainability"],
    rawContent: `Researchers at TU Delft (Netherlands) published peer-reviewed research on a Bismuth-Tin-Silver (Bi-Sn-Ag) solder alloy achieving lead leaching of 0.001 ppm — 1,000x below the EU Drinking Water Directive limit of 1 ppm (Directive 2020/2184). The alloy maintains comparable mechanical properties to current lead-free alternatives (Sn-Cu, Sn-Ag) at equivalent material cost based on spot commodity prices.

Three EPO patent applications have been filed by the TU Delft research group: EP24123456 (alloy composition), EP24123457 (manufacturing process), EP24123458 (application in copper pipe fittings). None are yet licensed to industry. The patent window for exclusive licensing appears open.

Startup activity: Two German startups (GreenSolder GmbH, Helio Materials KG) and one Dutch startup (PureConnect BV) have cited the paper in their own filings, indicating commercial interest is emerging. Geberit has not publicly referenced this research. No NIBCO or TECE activity detected.

Regulatory tailwind: The EU Drinking Water Directive 2020/2184 requires full transposition by all member states by January 12, 2026. Germany's implementation (TrinkwV 2023 amendment) explicitly tightens lead limits in soldered copper fittings. Viega currently uses standard Sn-Cu solder in copper press adapters — potential compliance gap in 18-24 months.`,
  },
];
