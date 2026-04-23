"use client";

import type { Analysis } from "@/types";

interface AnalysisViewProps {
  analysis: Analysis;
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span style={{ color: "var(--muted)" }} className="text-xs">
          {label}
        </span>
        <span className="text-xs font-semibold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full"
        style={{ backgroundColor: "var(--border)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  return (
    <div className="space-y-4">
      <div
        className="p-3 rounded-lg"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          {analysis.summary}
        </p>
      </div>

      <div className="space-y-2.5">
        <ScoreBar
          label="Relevance to Viega"
          value={analysis.relevance}
          color="var(--market)"
        />
        <ScoreBar
          label="Urgency"
          value={analysis.urgency}
          color="var(--competitor)"
        />
        <ScoreBar
          label="Market Impact"
          value={analysis.marketImpact}
          color="var(--invest)"
        />
      </div>

      {analysis.keyInsights.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--muted)" }}
          >
            Key Insights
          </p>
          <ul className="space-y-1.5">
            {analysis.keyInsights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span style={{ color: "var(--viega-yellow)" }} className="shrink-0 mt-0.5">
                  ›
                </span>
                <span style={{ color: "var(--text)" }}>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.affectedProducts.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--muted)" }}
          >
            Affected Product Areas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.affectedProducts.map((product) => (
              <span
                key={product}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: "rgba(255,230,0,0.1)",
                  border: "1px solid rgba(255,230,0,0.2)",
                  color: "var(--viega-yellow)",
                }}
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
