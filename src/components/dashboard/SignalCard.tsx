"use client";

import type { Signal } from "@/types";

interface SignalCardProps {
  signal: Signal;
  selected: boolean;
  onClick: () => void;
}

const TYPE_META = {
  competitor: { label: "COMP", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "MKT",  color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "PAT",  color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

const VERDICT_META = {
  Build:  { color: "var(--build)",      bg: "var(--build-bg)" },
  Invest: { color: "var(--invest)",     bg: "var(--invest-bg)" },
  Ignore: { color: "var(--ignore)",     bg: "var(--ignore-bg)" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function SignalCard({ signal, selected, onClick }: SignalCardProps) {
  const type = TYPE_META[signal.type as keyof typeof TYPE_META] ?? TYPE_META.market;
  const verdict = signal.decision?.verdict;
  const verdictMeta = verdict ? VERDICT_META[verdict as keyof typeof VERDICT_META] : null;
  const impactScore = signal.decision?.impactScore;

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150 group"
      style={{
        padding: "13px 16px",
        backgroundColor: selected ? "var(--card-active)" : "transparent",
        borderLeft: selected ? "3px solid var(--viega-yellow)" : "3px solid transparent",
        borderBottom: "1px solid var(--border-light)",
        boxShadow: selected ? "inset 0 0 40px rgba(255,230,0,0.03)" : "none",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "2px 6px",
            borderRadius: "3px",
            color: type.color,
            backgroundColor: type.bg,
            border: `1px solid ${type.border}`,
            fontFamily: "var(--font-mono)",
          }}
        >
          {type.label}
        </span>
        <div className="flex items-center gap-2">
          {verdictMeta && verdict ? (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "2px 6px",
                borderRadius: "3px",
                color: verdictMeta.color,
                backgroundColor: verdictMeta.bg,
                fontFamily: "var(--font-mono)",
              }}
            >
              {verdict}
            </span>
          ) : signal.status !== "decided" ? (
            <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
              {signal.status}
            </span>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: "13px",
          fontWeight: selected ? 500 : 400,
          lineHeight: "1.4",
          marginBottom: "10px",
          color: selected ? "var(--text)" : "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {signal.title.length > 70 ? signal.title.slice(0, 70) + "…" : signal.title}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {timeAgo(signal.createdAt)} ago
        </span>
        {impactScore && (
          <div className="flex items-center gap-1">
            <span style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>impact</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: selected ? "var(--viega-yellow)" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {impactScore}<span style={{ fontSize: "9px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
