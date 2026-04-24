"use client";

import { useState } from "react";
import type { Signal, ImpactBreakdown } from "@/types";
import { RotateCcw, ThumbsUp, ThumbsDown, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface SignalDetailProps {
  signal: Signal;
  isRunning: boolean;
  runningStep: string;
  onAnalyze: () => void;
  onFeedback: (action: string, importance: number, reanalyze: boolean) => Promise<void>;
}

const VERDICT_STYLES = {
  Build:  { color: "var(--build)",       bg: "var(--build-bg)",       border: "var(--build-border)" },
  Invest: { color: "var(--invest)",      bg: "var(--invest-bg)",      border: "var(--invest-border)" },
  Ignore: { color: "var(--ignore)",      bg: "var(--ignore-bg)",      border: "var(--ignore-border)" },
};

const PERSONA_STYLES = {
  innovator:      { color: "var(--innovator)",      bg: "var(--innovator-bg)",      emoji: "🚀" },
  traditionalist: { color: "var(--traditionalist)", bg: "var(--traditionalist-bg)", emoji: "🏛" },
  analyst:        { color: "var(--analyst)",         bg: "var(--analyst-bg)",        emoji: "📊" },
};

const STANCE_LABELS: Record<string, string> = {
  strongly_agree:    "Strongly Agree",
  agree:             "Agree",
  neutral:           "Neutral",
  disagree:          "Disagree",
  strongly_disagree: "Strongly Oppose",
};

const STANCE_COLORS: Record<string, string> = {
  strongly_agree:    "var(--build)",
  agree:             "var(--build)",
  neutral:           "var(--text-muted)",
  disagree:          "var(--invest)",
  strongly_disagree: "var(--competitor)",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const BREAKDOWN_DIMS = [
  { key: "revenueImpact",     label: "Revenue Impact",     weight: "35%", color: "var(--competitor)" },
  { key: "marketReach",       label: "Market Reach",       weight: "25%", color: "var(--market)" },
  { key: "competitiveThreat", label: "Competitive Threat", weight: "25%", color: "var(--invest)" },
  { key: "timeSensitivity",   label: "Time Sensitivity",   weight: "15%", color: "var(--patent)" },
] as const;

function ImpactBreakdownPanel({ breakdown, total }: { breakdown: ImpactBreakdown; total: number }) {
  return (
    <div
      className="p-4 rounded-xl space-y-3"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Impact Score Breakdown
        </p>
        <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
          {total}<span style={{ fontSize: "10px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
        </span>
      </div>
      <div className="space-y-3">
        {BREAKDOWN_DIMS.map(({ key, label, weight, color }) => {
          const dim = breakdown[key];
          const pct = (dim.score / 5) * 100;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</span>
                  <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", backgroundColor: `${color}14`, color, fontFamily: "var(--font-mono)" }}>
                    {weight}
                  </span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{dim.score}/5</span>
              </div>
              <div style={{ height: "3px", borderRadius: "2px", backgroundColor: "var(--border)", marginBottom: "6px", overflow: "hidden" }}>
                <div
                  className="bar-fill"
                  style={{ height: "100%", borderRadius: "2px", width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
              <p style={{ fontSize: "11px", lineHeight: 1.5, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                {dim.rationale}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 rounded-full flex-1" style={{ backgroundColor: "var(--border)" }}>
      <div
        className="h-1 rounded-full"
        style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

type Panel = "debate" | "analysis" | null;

export function SignalDetail({
  signal,
  isRunning,
  runningStep,
  onAnalyze,
  onFeedback,
}: SignalDetailProps) {
  const [open, setOpen] = useState<Panel>(null);
  const [importance, setImportance] = useState(3);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const decision = signal.decision;
  const analysis = signal.analysis;
  const personas = decision?.personas ?? [];
  const verdictStyle = decision
    ? VERDICT_STYLES[decision.verdict as keyof typeof VERDICT_STYLES]
    : null;

  const toggle = (panel: Panel) => setOpen((cur) => (cur === panel ? null : panel));

  const handleFeedback = async (action: string, reanalyze: boolean) => {
    setLastAction(action);
    await onFeedback(action, importance, reanalyze);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-3 max-w-2xl">

        {/* ── Snapshot card ──────────────────────────────────────────── */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          {/* Source + date */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {signal.source}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {timeAgo(signal.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
            {signal.title}
          </h2>

          {/* Verdict row */}
          {decision && verdictStyle ? (
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-black tracking-tighter px-2.5 py-1 rounded-lg"
                style={{ color: verdictStyle.color, backgroundColor: verdictStyle.bg, border: `1px solid ${verdictStyle.border}` }}
              >
                {decision.verdict.toUpperCase()}
              </span>
              <span className="text-xs font-semibold" style={{ color: verdictStyle.color }}>
                {Math.round(decision.confidence * 100)}% confidence
              </span>
              {decision.timeframe && (
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  · {decision.timeframe}
                </span>
              )}
            </div>
          ) : signal.status === "pending" && !isRunning ? (
            <button
              onClick={onAnalyze}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "var(--viega-yellow)", color: "#000" }}
            >
              ⚡ Analyze with AI
            </button>
          ) : null}

          {/* Running indicator */}
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="spinner shrink-0" />
              <span className="text-xs" style={{ color: "var(--viega-yellow)" }}>{runningStep}</span>
            </div>
          )}

          {/* Key metrics row */}
          {(decision || analysis) && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {decision && (
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>Impact</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                    {decision.impactScore}<span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
                  </div>
                </div>
              )}
              {analysis && (
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>Relevance</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--market)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                    {Math.round(analysis.relevance * 100)}<span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>%</span>
                  </div>
                </div>
              )}
              {analysis && (
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>Urgency</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--competitor)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                    {Math.round(analysis.urgency * 100)}<span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score bars */}
          {analysis && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] w-16 shrink-0" style={{ color: "var(--text-muted)" }}>Relevance</span>
                <MiniBar value={analysis.relevance} color="var(--market)" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] w-16 shrink-0" style={{ color: "var(--text-muted)" }}>Urgency</span>
                <MiniBar value={analysis.urgency} color="var(--competitor)" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] w-16 shrink-0" style={{ color: "var(--text-muted)" }}>Market</span>
                <MiniBar value={analysis.marketImpact} color="var(--invest)" />
              </div>
            </div>
          )}

          {/* 1-line summary */}
          {analysis && (
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {analysis.summary}
            </p>
          )}

          {/* Affected products */}
          {analysis && analysis.affectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {analysis.affectedProducts.map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--viega-yellow-dim)", color: "var(--viega-yellow)", border: "1px solid var(--viega-yellow-border)" }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Toggle buttons ──────────────────────────────────────────── */}
        {decision && (
          <div className="grid grid-cols-2 gap-2">
            {([
              { panel: "debate" as Panel,   label: "Persona-Debatte", icon: "🗣" },
              { panel: "analysis" as Panel, label: "Vollanalyse",     icon: "📋" },
            ] as const).map(({ panel, label, icon }) => (
              <button
                key={panel}
                onClick={() => toggle(panel)}
                className="flex items-center justify-between transition-all duration-150"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: open === panel ? "var(--viega-yellow)" : "var(--card)",
                  color: open === panel ? "#000" : "var(--text-secondary)",
                  border: `1px solid ${open === panel ? "var(--viega-yellow)" : "var(--border)"}`,
                  boxShadow: open === panel ? "var(--viega-yellow-glow)" : "none",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span>{icon} {label}</span>
                {open === panel ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            ))}
          </div>
        )}

        {/* ── Persona debate panel ────────────────────────────────────── */}
        {open === "debate" && personas.length > 0 && (
          <section className="space-y-2">
            {personas.map((p) => {
              const pStyle = PERSONA_STYLES[p.persona as keyof typeof PERSONA_STYLES]
                ?? { color: "var(--text-muted)", bg: "var(--card)", emoji: "🤖" };
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-lg fade-up"
                  style={{ backgroundColor: pStyle.bg, border: `1px solid ${pStyle.color}22` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{pStyle.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: pStyle.color }}>
                        {p.personaName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: STANCE_COLORS[p.stance] ?? "var(--text-muted)" }}>
                      {STANCE_LABELS[p.stance] ?? p.stance}
                    </span>
                  </div>
                  <blockquote
                    className="text-xs italic pl-2 mb-1.5"
                    style={{ color: "var(--text)", borderLeft: `2px solid ${pStyle.color}` }}
                  >
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {p.argument}
                  </p>
                </div>
              );
            })}
          </section>
        )}

        {/* ── Full analysis panel ─────────────────────────────────────── */}
        {open === "analysis" && decision && (
          <section className="space-y-3">
            {/* Decision reasoning */}
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: verdictStyle?.bg, border: `1px solid ${verdictStyle?.border}` }}
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: verdictStyle?.color }}>
                Reasoning
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {decision.reasoning}
              </p>
              {decision.productIdea && (
                <div
                  className="mt-3 p-3 rounded-lg"
                  style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--viega-yellow)" }}>
                    💡 Product Idea
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {decision.productIdea}
                  </p>
                </div>
              )}
            </div>

            {/* Impact breakdown */}
            {decision.impactBreakdown && (
              <ImpactBreakdownPanel
                breakdown={decision.impactBreakdown}
                total={decision.impactScore}
              />
            )}

            {/* Key insights */}
            {analysis && analysis.keyInsights.length > 0 && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Key Insights
                </p>
                {analysis.keyInsights.map((insight, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span style={{ color: "var(--viega-yellow)" }} className="shrink-0 font-bold">›</span>
                    <span style={{ color: "var(--text-secondary)" }}>{insight}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Human-in-the-loop */}
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Your Verdict
              </p>
              <div className="flex gap-2 mb-3">
                {[
                  { action: "approve", icon: ThumbsUp,    color: "var(--build)",      label: "Approve" },
                  { action: "reject",  icon: ThumbsDown,  color: "var(--competitor)", label: "Reject" },
                  { action: "boost",   icon: TrendingUp,  color: "var(--invest)",     label: "Boost" },
                ].map(({ action, icon: Icon, color, label }) => (
                  <button
                    key={action}
                    onClick={() => handleFeedback(action, false)}
                    disabled={isRunning}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: lastAction === action ? color : `${color}12`,
                      color: lastAction === action ? "#000" : color,
                      border: `1px solid ${color}40`,
                      opacity: isRunning ? 0.5 : 1,
                    }}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Importance</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      onClick={() => setImportance(d)}
                      className="w-3.5 h-3.5 rounded-full transition-all"
                      style={{
                        backgroundColor: d <= importance ? "var(--viega-yellow)" : "var(--border)",
                        transform: d <= importance ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--viega-yellow)" }}>
                  {importance}/5
                </span>
              </div>

              <button
                onClick={() => handleFeedback("boost", true)}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isRunning ? "var(--border)" : "var(--viega-yellow)",
                  color: isRunning ? "var(--text-muted)" : "#000",
                  cursor: isRunning ? "not-allowed" : "pointer",
                }}
              >
                <RotateCcw size={12} />
                {isRunning ? runningStep : "Re-analyze with My Input"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
