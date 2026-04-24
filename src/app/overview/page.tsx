"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Signal } from "@/types";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { ArrowRight, TrendingUp, CheckCircle, Zap, Clock } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "14px",
        boxShadow: "var(--card-shadow)",
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginBottom: "4px",
            fontFamily: "var(--font-sans)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "30px",
            fontWeight: 800,
            color: "var(--text)",
            lineHeight: 1,
            fontFamily: "var(--font-sans)",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function HBar({
  label,
  value,
  max,
  color,
  colorBg,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  colorBg: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <span
        style={{
          width: "90px",
          flexShrink: 0,
          fontSize: "13px",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: "10px",
          borderRadius: "6px",
          backgroundColor: "var(--border-light)",
          overflow: "hidden",
        }}
      >
        <div
          className="bar-fill"
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "6px",
            backgroundColor: color,
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "60px", justifyContent: "flex-end" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: color,
            backgroundColor: colorBg,
            padding: "2px 7px",
            borderRadius: "20px",
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

const VERDICT_STYLES = {
  Build:  { color: "var(--teal)",  bg: "var(--teal-bg)" },
  Invest: { color: "var(--invest)", bg: "var(--invest-bg)" },
  Ignore: { color: "var(--ignore)", bg: "var(--ignore-bg)" },
};

const TYPE_META = {
  competitor: { label: "Competitor", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "Market",     color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "Patent",     color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

export default function OverviewPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((data: Signal[]) => setSignals(data))
      .finally(() => setLoading(false));
  }, []);

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

  const topByImpact = [...decided]
    .sort((a, b) => (b.decision?.impactScore ?? 0) - (a.decision?.impactScore ?? 0))
    .slice(0, 5);

  const productCounts: Record<string, number> = {};
  for (const s of signals) {
    for (const p of s.analysis?.affectedProducts ?? []) {
      productCounts[p] = (productCounts[p] ?? 0) + 1;
    }
  }
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxProductCount = topProducts[0]?.[1] ?? 1;

  const typeData = [
    { label: "Competitor", value: signals.filter((s) => s.type === "competitor").length, color: "var(--competitor)" },
    { label: "Market",     value: signals.filter((s) => s.type === "market").length,     color: "var(--market)" },
    { label: "Patent",     value: signals.filter((s) => s.type === "patent").length,     color: "var(--patent)" },
  ];
  const verdictData = [
    { label: "Build",  value: buildCount,  color: "var(--teal)" },
    { label: "Invest", value: investCount, color: "var(--invest)" },
    { label: "Ignore", value: ignoreCount, color: "var(--ignore)" },
  ];

  const maxType = Math.max(...typeData.map((d) => d.value), 1);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div
        style={{
          padding: "28px 36px 20px",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "var(--card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.3px",
                lineHeight: 1.1,
                fontFamily: "var(--font-sans)",
              }}
            >
              Overview
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Pipeline health · decision distribution · top signals
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: "var(--accent-bg)",
                border: "1px solid var(--accent)",
                opacity: 0.8,
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  animation: "pulseGreen 2s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>
                Live data
              </span>
            </div>
            <Link
              href="/overview/radar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "20px",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.12s",
              }}
            >
              Signal Radar →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── KPI row ───────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          <StatCard
            label="Total Signals"
            value={loading ? "—" : signals.length}
            sub={`${analyzed.length} being analyzed`}
            icon={TrendingUp}
            iconBg="var(--accent-bg)"
            iconColor="var(--accent)"
          />
          <StatCard
            label="Build Decisions"
            value={loading ? "—" : buildCount}
            sub={`${decided.length} total decided`}
            icon={CheckCircle}
            iconBg="var(--teal-bg)"
            iconColor="var(--teal)"
          />
          <StatCard
            label="Ø Confidence"
            value={loading ? "—" : `${avgConfidence}%`}
            sub="across all verdicts"
            icon={Zap}
            iconBg="var(--invest-bg)"
            iconColor="var(--invest)"
          />
          <StatCard
            label="Pending Review"
            value={loading ? "—" : pending.length}
            sub={`${signals.length - pending.length} processed`}
            icon={Clock}
            iconBg="var(--ignore-bg)"
            iconColor="var(--ignore)"
          />
        </div>

        {/* ── Middle row ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Signal types breakdown */}
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "14px",
              boxShadow: "var(--card-shadow)",
              padding: "28px 32px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                Signal Types
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Breakdown by category
              </p>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {typeData.map((d) => (
                  <HBar
                    key={d.label}
                    label={d.label}
                    value={d.value}
                    max={maxType}
                    color={d.color}
                    colorBg={d.color.replace("var(--competitor)", "var(--competitor-bg)").replace("var(--market)", "var(--market-bg)").replace("var(--patent)", "var(--patent-bg)")}
                  />
                ))}
              </div>
            )}

            {/* Pipeline progress */}
            {!loading && signals.length > 0 && (
              <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Pipeline Progress
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--teal)", fontFamily: "var(--font-mono)" }}>
                    {Math.round((decided.length / signals.length) * 100)}% decided
                  </span>
                </div>
                <div
                  style={{
                    height: "10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--border-light)",
                    overflow: "hidden",
                    display: "flex",
                    gap: "2px",
                  }}
                >
                  <div style={{ width: `${(decided.length / signals.length) * 100}%`, backgroundColor: "var(--teal)", borderRadius: "6px 0 0 6px" }} />
                  <div style={{ width: `${(analyzed.length / signals.length) * 100}%`, backgroundColor: "var(--invest)" }} />
                  <div style={{ flex: 1, backgroundColor: "var(--border)" }} />
                </div>
                <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                  {[
                    { label: "Decided", count: decided.length, color: "var(--teal)" },
                    { label: "Analyzed", count: analyzed.length, color: "var(--invest)" },
                    { label: "Pending", count: pending.length, color: "var(--border)" },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {label} <b style={{ color: "var(--text)" }}>{count}</b>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verdict breakdown */}
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "14px",
              boxShadow: "var(--card-shadow)",
              padding: "28px 32px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                Decision Breakdown
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                {decided.length} signals fully decided
              </p>
            </div>
            {loading ? (
              <div className="skeleton h-36 rounded-xl" />
            ) : (
              <DonutChart data={verdictData} total={buildCount + investCount + ignoreCount || 1} />
            )}
          </div>
        </div>

        {/* ── Bottom row ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "20px" }}>

          {/* Top signals table */}
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "14px",
              boxShadow: "var(--card-shadow)",
              padding: "28px 32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                  Top Signals by Impact
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Highest-scoring decided signals
                </p>
              </div>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : topByImpact.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No decided signals yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* Header row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 70px 1fr 48px 64px",
                    gap: "12px",
                    padding: "0 12px 10px",
                    borderBottom: "1px solid var(--border-light)",
                    alignItems: "center",
                  }}
                >
                  {["#", "Type", "Signal", "Score", "Verdict"].map((h) => (
                    <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>
                {topByImpact.map((s, i) => {
                  const vStyle = VERDICT_STYLES[s.decision!.verdict as keyof typeof VERDICT_STYLES];
                  const tMeta = TYPE_META[s.type as keyof typeof TYPE_META] ?? TYPE_META.market;
                  return (
                    <Link
                      key={s.id}
                      href="/"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "28px 70px 1fr 48px 64px",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "10px",
                        alignItems: "center",
                        textDecoration: "none",
                        transition: "background 0.12s",
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          color: tMeta.color,
                          backgroundColor: tMeta.bg,
                          border: `1px solid ${tMeta.border}`,
                          fontFamily: "var(--font-mono)",
                          display: "inline-block",
                        }}
                      >
                        {tMeta.label.slice(0, 4)}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.title}
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "var(--text)",
                          fontFamily: "var(--font-mono)",
                          textAlign: "center",
                        }}
                      >
                        {s.decision!.impactScore}
                        <span style={{ fontSize: "10px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          color: vStyle.color,
                          backgroundColor: vStyle.bg,
                          textAlign: "center",
                          display: "block",
                        }}
                      >
                        {s.decision!.verdict}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Affected products */}
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "14px",
              boxShadow: "var(--card-shadow)",
              padding: "28px 32px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                Affected Products
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Most mentioned product areas
              </p>
            </div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
              </div>
            ) : topProducts.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No data yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {topProducts.map(([product, count], idx) => {
                  const pct = Math.round((count / maxProductCount) * 100);
                  const hue = idx % 3 === 0 ? "var(--accent)" : idx % 3 === 1 ? "var(--teal)" : "var(--invest)";
                  const hueBg = idx % 3 === 0 ? "var(--accent-bg)" : idx % 3 === 1 ? "var(--teal-bg)" : "var(--invest-bg)";
                  return (
                    <div key={product}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                          {product.length > 28 ? product.slice(0, 28) + "…" : product}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                          {count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "8px",
                          borderRadius: "4px",
                          backgroundColor: "var(--border-light)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="bar-fill"
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: "4px",
                            backgroundColor: hue,
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
