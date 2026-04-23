"use client";

import type { Decision } from "@/types";

interface DecisionPanelProps {
  decision: Decision;
}

const VERDICT_STYLES = {
  Build: {
    color: "var(--build)",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    label: "BUILD",
  },
  Invest: {
    color: "var(--invest)",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    label: "INVEST",
  },
  Ignore: {
    color: "var(--ignore)",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.3)",
    label: "IGNORE",
  },
};

export function DecisionPanel({ decision }: DecisionPanelProps) {
  const style = VERDICT_STYLES[decision.verdict];
  const confidencePct = Math.round(decision.confidence * 100);

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: style.color }}
            >
              {style.label}
            </span>
          </div>
          <div className="text-right">
            <div
              className="text-xl font-bold"
              style={{ color: style.color }}
            >
              {confidencePct}%
            </div>
            <div style={{ color: "var(--muted)" }} className="text-xs">
              confidence
            </div>
          </div>
        </div>

        <div
          className="h-1.5 rounded-full mb-3"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-1.5 rounded-full transition-all duration-1000"
            style={{
              width: `${confidencePct}%`,
              backgroundColor: style.color,
            }}
          />
        </div>

        <div className="flex gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <div>
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {decision.impactScore}/10
            </span>{" "}
            impact
          </div>
          {decision.timeframe && (
            <div>
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {decision.timeframe}
              </span>{" "}
              timeframe
            </div>
          )}
        </div>
      </div>

      <div>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: "var(--muted)" }}
        >
          Reasoning
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          {decision.reasoning}
        </p>
      </div>

      {decision.productIdea && (
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1.5"
            style={{ color: "var(--viega-yellow)" }}
          >
            💡 Product Idea
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {decision.productIdea}
          </p>
        </div>
      )}
    </div>
  );
}
