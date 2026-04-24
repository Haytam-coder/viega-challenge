"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Signal } from "@/types";
import { Search, GitCompare, X } from "lucide-react";

// ── Axes definition ──────────────────────────────────────────────────────────

const AXES = [
  { key: "relevance",          label: "Relevance",      color: "#4880FF" },
  { key: "urgency",            label: "Urgency",        color: "#4880FF" },
  { key: "marketImpact",       label: "Mkt. Impact",    color: "#4880FF" },
  { key: "marketReach",        label: "Mkt. Reach",     color: "#6226EF" },
  { key: "revenueImpact",      label: "Revenue",        color: "#6226EF" },
  { key: "competitiveThreat",  label: "Comp. Threat",   color: "#6226EF" },
];
const N = AXES.length;

function getValues(signal: Signal): (number | null)[] {
  const a = signal.analysis;
  const b = signal.decision?.impactBreakdown;
  return [
    a?.relevance    ?? null,
    a?.urgency      ?? null,
    a?.marketImpact ?? null,
    b ? b.marketReach.score * 2       : null,  // 1-5 → 2-10
    b ? b.revenueImpact.score * 2     : null,
    b ? b.competitiveThreat.score * 2 : null,
  ];
}

// ── SVG radar math ───────────────────────────────────────────────────────────

const CX = 210, CY = 210, R = 150;

function angle(i: number) {
  return -Math.PI / 2 + (2 * Math.PI * i) / N;
}
function axisPoint(i: number, radius: number) {
  const a = angle(i);
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
}
function toPolygon(values: (number | null)[]): string {
  return values
    .map((v, i) => {
      const { x, y } = axisPoint(i, ((v ?? 0) / 10) * R);
      return `${x},${y}`;
    })
    .join(" ");
}
function gridPolygon(level: number): string {
  return Array.from({ length: N }, (_, i) => {
    const { x, y } = axisPoint(i, R * level);
    return `${x},${y}`;
  }).join(" ");
}

// ── Radar SVG component ──────────────────────────────────────────────────────

function RadarChart({
  primary,
  compare,
}: {
  primary: (number | null)[];
  compare?: (number | null)[];
}) {
  const LABEL_R = R + 26;

  return (
    <svg
      width="420"
      height="420"
      viewBox="0 0 420 420"
      style={{ overflow: "visible", display: "block", margin: "0 auto" }}
    >
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={gridPolygon(level)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={level === 1 ? 1.5 : 0.8}
          strokeDasharray={level < 1 ? "4 3" : undefined}
        />
      ))}

      {/* Scale ticks at 5 and 10 on first axis */}
      {[5, 10].map((v) => {
        const { x, y } = axisPoint(0, (v / 10) * R);
        return (
          <text key={v} x={x + 5} y={y + 3} fontSize="9" fill="var(--text-muted)" fontFamily="monospace">
            {v}
          </text>
        );
      })}

      {/* Axis lines */}
      {Array.from({ length: N }, (_, i) => {
        const end = axisPoint(i, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="var(--border)"
            strokeWidth="1"
          />
        );
      })}

      {/* Compare polygon */}
      {compare && (
        <>
          <polygon
            points={toPolygon(compare)}
            fill="rgba(0,182,155,0.12)"
            stroke="#00B69B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {compare.map((v, i) => {
            if (v === null) return null;
            const { x, y } = axisPoint(i, (v / 10) * R);
            return (
              <circle key={i} cx={x} cy={y} r="3.5" fill="#00B69B" stroke="#fff" strokeWidth="1.5" />
            );
          })}
        </>
      )}

      {/* Primary polygon */}
      <polygon
        points={toPolygon(primary)}
        fill="rgba(72,128,255,0.14)"
        stroke="#4880FF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {primary.map((v, i) => {
        if (v === null) return null;
        const { x, y } = axisPoint(i, (v / 10) * R);
        return (
          <circle key={i} cx={x} cy={y} r="4.5" fill="#4880FF" stroke="#fff" strokeWidth="2" />
        );
      })}

      {/* Axis labels */}
      {AXES.map(({ label }, i) => {
        const { x, y } = axisPoint(i, LABEL_R);
        const anchor = x < CX - 10 ? "end" : x > CX + 10 ? "start" : "middle";
        const isBreakdown = i >= 3;
        return (
          <text
            key={label}
            x={x}
            y={y + 4}
            textAnchor={anchor}
            fontSize="12"
            fontWeight="700"
            fill={isBreakdown ? "#6226EF" : "#4880FF"}
            fontFamily="sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Dimension table ──────────────────────────────────────────────────────────

function DimTable({
  primary,
  primaryTitle,
  compare,
  compareTitle,
}: {
  primary: (number | null)[];
  primaryTitle: string;
  compare?: (number | null)[];
  compareTitle?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px" + (compare ? " 80px" : ""),
          gap: "8px",
          padding: "0 8px 8px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Dimension
        </span>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#4880FF", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
          {primaryTitle.length > 12 ? primaryTitle.slice(0, 12) + "…" : primaryTitle}
        </span>
        {compare && (
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#00B69B", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
            {compareTitle ? (compareTitle.length > 12 ? compareTitle.slice(0, 12) + "…" : compareTitle) : "Compare"}
          </span>
        )}
      </div>

      {AXES.map(({ label, key }, i) => {
        const pv = primary[i];
        const cv = compare?.[i] ?? null;
        const isBreakdown = i >= 3;
        return (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px" + (compare ? " 80px" : ""),
              gap: "8px",
              alignItems: "center",
              padding: "6px 8px",
              borderRadius: "6px",
              backgroundColor: isBreakdown ? "rgba(98,38,239,0.03)" : "transparent",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
              {label}
              {isBreakdown && (
                <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "4px" }}>AI</span>
              )}
            </span>
            {/* Primary score */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              {pv !== null ? (
                <>
                  <div style={{ flex: 1, height: "5px", borderRadius: "3px", backgroundColor: "var(--border-light)", overflow: "hidden", maxWidth: "40px" }}>
                    <div style={{ height: "100%", width: `${(pv / 10) * 100}%`, borderRadius: "3px", backgroundColor: "#4880FF" }} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", minWidth: "24px", textAlign: "right" }}>
                    {pv}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
              )}
            </div>
            {/* Compare score */}
            {compare && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                {cv !== null ? (
                  <>
                    <div style={{ flex: 1, height: "5px", borderRadius: "3px", backgroundColor: "var(--border-light)", overflow: "hidden", maxWidth: "40px" }}>
                      <div style={{ height: "100%", width: `${(cv / 10) * 100}%`, borderRadius: "3px", backgroundColor: "#00B69B" }} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", minWidth: "24px", textAlign: "right" }}>
                      {cv}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Signal list item ─────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  competitor: { label: "COMP", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "MKT",  color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "PAT",  color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

// ── Main page ────────────────────────────────────────────────────────────────

function RadarInner() {
  const searchParams = useSearchParams();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        const withAnalysis = data.filter((s) => s.analysis != null);
        setSignals(withAnalysis);
        const paramId = searchParams.get("id");
        const match = paramId ? withAnalysis.find((s) => s.id === paramId) : null;
        setPrimaryId(match ? match.id : withAnalysis[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const filtered = signals.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.type.includes(search.toLowerCase())
  );

  const primary  = signals.find((s) => s.id === primaryId);
  const compare  = compareMode ? signals.find((s) => s.id === compareId) : undefined;

  const primaryValues = primary ? getValues(primary) : Array(N).fill(0);
  const compareValues = compare ? getValues(compare) : undefined;

  const handleSelectSignal = (id: string) => {
    if (compareMode && primaryId) {
      setCompareId(id === primaryId ? null : id);
    } else {
      setPrimaryId(id);
      setCompareId(null);
    }
  };

  const toggleCompare = () => {
    setCompareMode((m) => !m);
    if (compareMode) setCompareId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--bg)" }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: "0.6px solid var(--border)",
          backgroundColor: "var(--card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Link href="/overview" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
              Overview
            </Link>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>/</span>
            <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>Signal Radar</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px", lineHeight: 1.1, fontFamily: "var(--font-sans)" }}>
            Signal Radar
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            Multi-dimensional signal comparison — relevance · urgency · impact breakdown
          </p>
        </div>

        {/* Compare toggle */}
        <button
          onClick={toggleCompare}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            border: `1.5px solid ${compareMode ? "#00B69B" : "var(--border)"}`,
            backgroundColor: compareMode ? "rgba(0,182,155,0.1)" : "var(--card)",
            color: compareMode ? "#00B69B" : "var(--text-secondary)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "all 0.15s",
          }}
        >
          <GitCompare size={15} />
          {compareMode ? "Compare ON" : "Compare"}
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* Left: signal list */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            borderRight: "0.6px solid var(--border)",
            backgroundColor: "var(--card)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "0.6px solid var(--border)" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter signals…"
                style={{
                  width: "100%",
                  paddingLeft: "32px",
                  paddingRight: "12px",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                  borderRadius: "8px",
                  border: "0.6px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  fontSize: "13px",
                  color: "var(--text)",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {compareMode && (
              <p style={{ fontSize: "11px", color: "#00B69B", marginTop: "8px", fontWeight: 600 }}>
                Compare mode: click a second signal to overlay
              </p>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "8px" }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "32px 16px" }}>
                No analyzed signals found.
              </p>
            ) : (
              filtered.map((s) => {
                const isPrimary = s.id === primaryId;
                const isCompare = s.id === compareId;
                const tMeta = TYPE_META[s.type] ?? TYPE_META.market;
                const hasBreakdown = !!s.decision?.impactBreakdown;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSignal(s.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: isPrimary
                        ? "1.5px solid #4880FF"
                        : isCompare
                        ? "1.5px solid #00B69B"
                        : "1.5px solid transparent",
                      backgroundColor: isPrimary
                        ? "rgba(72,128,255,0.07)"
                        : isCompare
                        ? "rgba(0,182,155,0.07)"
                        : "transparent",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      marginBottom: "2px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", borderRadius: "3px", color: tMeta.color, backgroundColor: tMeta.bg, border: `1px solid ${tMeta.border}`, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                        {tMeta.label}
                      </span>
                      {hasBreakdown && (
                        <span style={{ fontSize: "9px", fontWeight: 600, color: "#6226EF", backgroundColor: "rgba(98,38,239,0.08)", padding: "2px 6px", borderRadius: "3px" }}>
                          6D
                        </span>
                      )}
                      {isPrimary && (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#4880FF", marginLeft: "auto" }}>PRIMARY</span>
                      )}
                      {isCompare && (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#00B69B", marginLeft: "auto" }}>COMPARE</span>
                      )}
                    </div>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text)", lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {s.title}
                    </p>
                    <div style={{ display: "flex", gap: "12px", marginTop: "5px" }}>
                      {[
                        { label: "R", value: s.analysis?.relevance },
                        { label: "U", value: s.analysis?.urgency },
                        { label: "I", value: s.analysis?.marketImpact },
                      ].map(({ label, value }) => (
                        <span key={label} style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {label}:<b style={{ color: "var(--text)" }}>{value ?? "—"}</b>
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: radar + table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
          {!primary ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                {loading ? "Loading…" : "No analyzed signals yet. Run the AI pipeline first."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>

              {/* Radar card */}
              <div
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "14px",
                  boxShadow: "var(--card-shadow)",
                  padding: "28px 24px",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
                    {primary.title.length > 60 ? primary.title.slice(0, 60) + "…" : primary.title}
                  </h2>
                  {compare && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>vs.</span>
                      <span style={{ fontSize: "12px", color: "#00B69B", fontWeight: 600 }}>
                        {compare.title.length > 50 ? compare.title.slice(0, 50) + "…" : compare.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#4880FF" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Analysis dims</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#6226EF" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>AI breakdown dims</span>
                  </div>
                </div>

                <RadarChart primary={primaryValues} compare={compareValues} />

                {/* Scores summary */}
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "4px", flexWrap: "wrap" }}>
                  {[
                    { label: "Impact", value: primary.decision?.impactScore ?? primary.analysis?.marketImpact, color: "#4880FF" },
                    { label: "Urgency", value: primary.analysis?.urgency, color: "#4880FF" },
                    { label: "Relevance", value: primary.analysis?.relevance, color: "#4880FF" },
                    ...(primary.decision ? [{ label: "Confidence", value: Math.round((primary.decision.confidence ?? 0) * 100) + "%", color: "#6226EF" }] : []),
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                        {value ?? "—"}
                        {typeof value === "number" && <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>}
                      </div>
                      <div style={{ fontSize: "10px", color, fontWeight: 600, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dimension table card */}
              <div
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "14px",
                  boxShadow: "var(--card-shadow)",
                  padding: "28px 24px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
                    Dimension Breakdown
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    All 6 axes · scores normalized to /10
                  </p>
                </div>

                <DimTable
                  primary={primaryValues}
                  primaryTitle={primary.title}
                  compare={compareValues}
                  compareTitle={compare?.title}
                />

                {/* Missing breakdown notice */}
                {!primary.decision?.impactBreakdown && (
                  <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "rgba(98,38,239,0.05)", border: "1px solid rgba(98,38,239,0.15)" }}>
                    <p style={{ fontSize: "12px", color: "#6226EF", lineHeight: 1.5 }}>
                      AI breakdown dims (Mkt. Reach, Revenue, Comp. Threat) require a full AI analysis. Run Analyze & Decide from the dashboard.
                    </p>
                  </div>
                )}

                {/* Reasoning snippet */}
                {primary.decision?.reasoning && (
                  <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--border-light)" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                      AI Reasoning
                    </p>
                    <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                      {primary.decision.reasoning}
                    </p>
                    {primary.decision.verdict && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", padding: "5px 12px", borderRadius: "20px", backgroundColor: primary.decision.verdict === "Build" ? "rgba(0,182,155,0.1)" : primary.decision.verdict === "Invest" ? "rgba(98,38,239,0.1)" : "rgba(107,114,128,0.1)", color: primary.decision.verdict === "Build" ? "#00B69B" : primary.decision.verdict === "Invest" ? "#6226EF" : "#6b7280" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700 }}>{primary.decision.verdict}</span>
                        <span style={{ fontSize: "11px", opacity: 0.7 }}>{Math.round((primary.decision.confidence ?? 0) * 100)}% confidence</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RadarPage() {
  return (
    <Suspense>
      <RadarInner />
    </Suspense>
  );
}
