# AI Market Intelligence — Futury × Viega Hackathon

> **Live:** [viega-challenge.vercel.app](https://viega-challenge.vercel.app)

A full-stack AI-powered market intelligence platform built in 48 hours at the Futury × Viega Hackathon. The tool continuously surfaces competitive signals, synthesizes them into strategic insights, and simulates multi-perspective AI debate — so product and strategy teams can move from raw market noise to actionable decisions in minutes.

---

## Features

### Signal Radar
Real-time feed of market signals (competitor moves, pricing shifts, regulatory changes, press). Each signal is scored by relevance and urgency, tagged by category, and linked to the raw source.

### Dashboard
At-a-glance strategic overview: signal volume trends, category breakdown, urgency heatmap, and top recommended actions — all in a single data-dense view.

### Action Queue
Prioritized list of strategic actions generated from the current signal landscape. Each action includes rationale, estimated impact, and a one-click path to the Research module for deeper investigation.

### Agent Debate
Five AI personas (Strategist, Devil's Advocate, Market Analyst, Risk Officer, Innovator) debate a user-submitted question in structured rounds. Produces a synthesized verdict with minority dissent surfaced — giving a 360° view before any decision.

### Research Module
On-demand deep research on any signal or topic. Returns a structured report with key findings, evidence links, and strategic implications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Google Gemini 2.5 Flash |
| Database / ORM | Prisma |
| Deployment | Vercel |

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env.local

# Push the database schema
npx prisma db push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required Environment Variables

```
GEMINI_API_KEY=        # Google AI Studio key
DATABASE_URL=          # Prisma-compatible connection string
```

---

## Architecture Overview

```
app/
├── api/               # Route handlers (signals, research, debate, actions)
├── dashboard/         # Dashboard page
├── signals/           # Signal Radar feed + detail view
├── debate/            # Agent Debate interface
├── research/          # Research module
└── actions/           # Action Queue

prisma/
└── schema.prisma      # Signal, Action, Research, DebateSession models

lib/
├── gemini.ts          # Gemini client + prompt templates
└── db.ts              # Prisma client singleton
```

---

## Hackathon Context

Built at **Futury × Viega Hackathon** (May 2026). The challenge: give Viega's strategy team a way to stay ahead of fast-moving B2B markets without drowning in unstructured information. We focused on signal quality over quantity and on making AI reasoning transparent through the multi-agent debate format.

---

## License

MIT
