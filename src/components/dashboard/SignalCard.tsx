"use client";

import type { Signal } from "@/types";

interface SignalCardProps {
  signal: Signal;
  selected: boolean;
  onClick: () => void;
}

const TYPE_META = {
  competitor: { label: "Competitor", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market: { label: "Market", color: "var(--market)", bg: "var(--market-bg)", border: "var(--market-border)" },
  patent: { label: "Patent", color: "var(--patent)", bg: "var(--patent-bg)", border: "var(--patent-border)" },
};

const VERDICT_META = {
  Build: { color: "var(--build)", bg: "var(--build-bg)" },
  Invest: { color: "var(--invest)", bg: "var(--invest-bg)" },
  Ignore: { color: "var(--ignore)", bg: "var(--ignore-bg)" },
};

function priorityDot(score: number | null | undefined) {
  if (!score) return null;
  const pct = score * 100;
  if (pct >= 80) return { color: "var(--competitor)", label: "HIGH" };
  if (pct >= 55) return { color: "var(--invest)", label: "MED" };
  return { color: "var(--text-muted)", label: "LOW" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function SignalCard({ signal, selected, onClick }: SignalCardProps) {
  const type = TYPE_META[signal.type as keyof typeof TYPE_META] ?? TYPE_META.market;
  const verdict = signal.decision?.verdict;
  const verdictMeta = verdict ? VERDICT_META[verdict as keyof typeof VERDICT_META] : null;
  const priority = priorityDot(signal.relevanceScore);
  const impactScore = signal.decision?.impactScore;

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150"
      style={{
        padding: "14px 16px",
        backgroundColor: selected ? "var(--card-active)" : "transparent",
        borderLeft: selected
          ? "2px solid var(--viega-yellow)"
          : "2px solid transparent",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
          style={{
            color: type.color,
            backgroundColor: type.bg,
            border: `1px solid ${type.border}`,
          }}
        >
          {type.label}
        </span>
        <div className="flex items-center gap-2">
          {verdictMeta && verdict ? (
            <span
              className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded"
              style={{ color: verdictMeta.color, backgroundColor: verdictMeta.bg }}
            >
              {verdict}
            </span>
          ) : signal.status !== "decided" ? (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {signal.status}
            </span>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <p
        className="text-[13px] font-medium leading-snug mb-2.5"
        style={{ color: selected ? "var(--text)" : "var(--text-secondary)" }}
      >
        {signal.title.length > 72 ? signal.title.slice(0, 72) + "…" : signal.title}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {timeAgo(signal.createdAt)}
        </span>
        <div className="flex items-center gap-2.5">
          {impactScore && (
            <div className="flex items-center gap-1">
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                impact
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {impactScore}/10
              </span>
            </div>
          )}
          {priority && (
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: priority.color }}
              />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: priority.color }}
              >
                {priority.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
