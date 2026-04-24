"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Signal } from "@/types";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { Activity, CheckCircle, Clock, Zap, ArrowRight } from "lucide-react";

const VERDICT_STYLES = {
  Build:  { color: "var(--build)",       bg: "var(--build-bg)",       border: "var(--build-border)" },
  Invest: { color: "var(--invest)",      bg: "var(--invest-bg)",      border: "var(--invest-border)" },
  Ignore: { color: "var(--ignore)",      bg: "var(--ignore-bg)",      border: "var(--ignore-border)" },
};

const TYPE_META = {
  competitor: { label: "Competitor", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "Market",     color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "Patent",     color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

function PipelineBar({ pending, analyzed, decided, total }: { pending: number; analyzed: number; decided: number; total: number }) {
  if (total === 0) return <div className="skeleton h-3 rounded-full w-full" />;
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        <div style={{ width: `${(decided / total) * 100}%`, backgroundColor: "var(--build)", borderRadius: "4px 0 0 4px" }} />
        <div style={{ width: `${(analyzed / total) * 100}%`, backgroundColor: "var(--invest)" }} />
        <div style={{ width: `${(pending / total) * 100}%`, backgroundColor: "var(--border)", borderRadius: "0 4px 4px 0" }} />
      </div>
      <div className="flex gap-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "var(--build)" }} />
          <span style={{ color: "var(--text-muted)" }}>Decided <b style={{ color: "var(--text)" }}>{decided}</b></span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "var(--invest)" }} />
          <span style={{ color: "var(--text-muted)" }}>Analyzed <b style={{ color: "var(--text)" }}>{analyzed}</b></span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: "var(--border)" }} />
          <span style={{ color: "var(--text-muted)" }}>Pending <b style={{ color: "var(--text)" }}>{pending}</b></span>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((data: Signal[]) => setSignals(data))
      .finally(() => setLoading(false));
  }, []);

  // ── Computed stats ────────────────────────────────────────────────────────

  const decided   = signals.filter((s) => s.status === "decided");
  const analyzed  = signals.filter((s) => s.status === "analyzed");
  const pending   = signals.filter((s) => s.status === "pending");

  const buildCount  = decided.filter((s) => s.decision?.verdict === "Build").length;
  const investCount = decided.filter((s) => s.decision?.verdict === "Invest").length;
  const ignoreCount = decided.filter((s) => s.decision?.verdict === "Ignore").length;

  const avgConfidence =
    decided.length > 0
      ? Math.round((decided.reduce((s, x) => s + (x.decision?.confidence ?? 0), 0) / decided.length) * 100)
      : 0;

  const avgRelevance =
    signals.filter((s) => s.relevanceScore).length > 0
      ? Math.round(
          (signals.reduce((s, x) => s + (x.relevanceScore ?? 0), 0) /
            signals.filter((s) => s.relevanceScore).length) * 100
        )
      : 0;

  // Top 5 by impact
  const topByImpact = [...decided]
    .sort((a, b) => (b.decision?.impactScore ?? 0) - (a.decision?.impactScore ?? 0))
    .slice(0, 5);

  // Most affected products
  const productCounts: Record<string, number> = {};
  for (const s of signals) {
    for (const p of s.analysis?.affectedProducts ?? []) {
      productCounts[p] = (productCounts[p] ?? 0) + 1;
    }
  }
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Chart data
  const typeData = [
    { label: "Competitor", value: signals.filter((s) => s.type === "competitor").length, color: "var(--competitor)" },
    { label: "Market",     value: signals.filter((s) => s.type === "market").length,     color: "var(--market)" },
    { label: "Patent",     value: signals.filter((s) => s.type === "patent").length,     color: "var(--patent)" },
  ];
  const verdictData = [
    { label: "Build",  value: buildCount,  color: "var(--build)" },
    { label: "Invest", value: investCount, color: "var(--invest)" },
    { label: "Ignore", value: ignoreCount, color: "var(--ignore)" },
  ];

  const kpis = [
    { icon: Activity,    label: "Total Signals",  value: loading ? "—" : signals.length, color: "var(--text)" },
    { icon: CheckCircle, label: "Build Decisions", value: loading ? "—" : buildCount,     color: "var(--build)" },
    { icon: Zap,         label: "Ø Confidence",   value: loading ? "—" : `${avgConfidence}%`, color: "var(--viega-yellow)" },
    { icon: Clock,       label: "Ø Relevance",    value: loading ? "—" : `${avgRelevance}%`,  color: "var(--market)" },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="shrink-0 px-8 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>Overview</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Strategic snapshot — pipeline health, decision distribution, top signals
        </p>
      </div>

      <div className="p-8 space-y-6">

        {/* ── KPI row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {kpis.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <Icon size={16} style={{ color }} />
              <div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</div>
                <div className="text-xl font-bold" style={{ color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pipeline status ─────────────────────────────────────────────── */}
        <div
          className="p-5 rounded-xl"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            Pipeline Status
          </p>
          <PipelineBar
            pending={pending.length}
            analyzed={analyzed.length}
            decided={decided.length}
            total={signals.length}
          />
        </div>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-5 rounded-xl"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
              Signal Distribution
            </p>
            {loading ? (
              <div className="skeleton h-36 rounded-xl" />
            ) : (
              <DonutChart data={typeData} total={signals.length || 1} />
            )}
          </div>

          <div
            className="p-5 rounded-xl"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
              Decision Breakdown
            </p>
            {loading ? (
              <div className="skeleton h-36 rounded-xl" />
            ) : (
              <DonutChart data={verdictData} total={decided.length || 1} />
            )}
          </div>
        </div>

        {/* ── Top signals by impact ────────────────────────────────────────── */}
        <div
          className="p-5 rounded-xl"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Top Signals by Impact
            </p>
            <Link href="/" className="flex items-center gap-1 text-[11px]" style={{ color: "var(--viega-yellow)" }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
            </div>
          ) : topByImpact.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No decided signals yet.</p>
          ) : (
            <div className="space-y-2">
              {topByImpact.map((s, i) => {
                const vStyle = VERDICT_STYLES[s.decision!.verdict as keyof typeof VERDICT_STYLES];
                const tMeta = TYPE_META[s.type as keyof typeof TYPE_META] ?? TYPE_META.market;
                return (
                  <Link
                    key={s.id}
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:opacity-80"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-light)" }}
                  >
                    {/* Rank */}
                    <span className="text-xs font-bold w-4 shrink-0" style={{ color: "var(--text-muted)" }}>
                      {i + 1}
                    </span>
                    {/* Type badge */}
                    <span
                      className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded shrink-0"
                      style={{ color: tMeta.color, backgroundColor: tMeta.bg, border: `1px solid ${tMeta.border}` }}
                    >
                      {tMeta.label}
                    </span>
                    {/* Title */}
                    <span className="text-xs flex-1 truncate" style={{ color: "var(--text-secondary)" }}>
                      {s.title}
                    </span>
                    {/* Impact */}
                    <span className="text-xs font-bold shrink-0" style={{ color: "var(--text)" }}>
                      {s.decision!.impactScore}<span className="text-[10px] font-normal" style={{ color: "var(--text-muted)" }}>/10</span>
                    </span>
                    {/* Verdict */}
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ color: vStyle.color, backgroundColor: vStyle.bg }}
                    >
                      {s.decision!.verdict}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Most affected Viega products ─────────────────────────────────── */}
        {topProducts.length > 0 && (
          <div
            className="p-5 rounded-xl"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
              Most Affected Product Areas
            </p>
            <div className="space-y-2">
              {topProducts.map(([product, count]) => {
                const pct = Math.round((count / signals.length) * 100);
                return (
                  <div key={product} className="flex items-center gap-3">
                    <span className="text-xs w-44 shrink-0 truncate" style={{ color: "var(--text-secondary)" }}>
                      {product}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: "var(--viega-yellow)" }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold w-6 text-right shrink-0" style={{ color: "var(--text-muted)" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
