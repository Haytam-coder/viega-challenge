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
  Build:  { color: "var(--build)",  bg: "var(--build-bg)",  border: "var(--build-border)" },
  Invest: { color: "var(--invest)", bg: "var(--invest-bg)", border: "var(--invest-border)" },
  Ignore: { color: "var(--ignore)", bg: "var(--ignore-bg)", border: "var(--ignore-border)" },
};

const PERSONA_STYLES = {
  innovator:      { color: "var(--innovator)",      bg: "var(--innovator-bg)",      border: "var(--innovator-border)",      emoji: "🚀", name: "David",  role: "Digital Innovator" },
  traditionalist: { color: "var(--traditionalist)", bg: "var(--traditionalist-bg)", border: "var(--traditionalist-border)", emoji: "🏛", name: "Josef",  role: "Loyal Traditionalist" },
  analyst:        { color: "var(--analyst)",         bg: "var(--analyst-bg)",        border: "var(--analyst-border)",        emoji: "📊", name: "Steffen", role: "Demanding Doer" },
};

const STANCE_LABELS: Record<string, string> = {
  strongly_agree: "Strongly Agree", agree: "Agree", neutral: "Neutral",
  disagree: "Disagree", strongly_disagree: "Strongly Oppose",
};
const STANCE_COLORS: Record<string, string> = {
  strongly_agree: "var(--build)", agree: "var(--build)", neutral: "var(--text-muted)",
  disagree: "var(--invest)", strongly_disagree: "var(--competitor)",
};

const BREAKDOWN_DIMS = [
  { key: "revenueImpact",     label: "Revenue Impact",     weight: "35%", color: "var(--competitor)" },
  { key: "marketReach",       label: "Market Reach",       weight: "25%", color: "var(--market)" },
  { key: "competitiveThreat", label: "Competitive Threat", weight: "25%", color: "var(--invest)" },
  { key: "timeSensitivity",   label: "Time Sensitivity",   weight: "15%", color: "var(--patent)" },
] as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Panel = "debate" | "analysis" | null;

export function SignalDetail({ signal, isRunning, runningStep, onAnalyze, onFeedback }: SignalDetailProps) {
  const [open, setOpen] = useState<Panel>(null);
  const [importance, setImportance] = useState(3);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const decision = signal.decision;
  const analysis = signal.analysis;
  const personas = decision?.personas ?? [];
  const verdictStyle = decision ? VERDICT_STYLES[decision.verdict as keyof typeof VERDICT_STYLES] : null;

  const toggle = (panel: Panel) => setOpen((cur) => (cur === panel ? null : panel));
  const handleFeedback = async (action: string, reanalyze: boolean) => {
    setLastAction(action);
    await onFeedback(action, importance, reanalyze);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div style={{ padding: "32px 40px", maxWidth: "100%" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }}>
          {/* Source + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {signal.source}
            </span>
            <span style={{ color: "var(--border)", fontSize: "10px" }}>·</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {timeAgo(signal.createdAt)}
            </span>
            <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", color: signal.type === "competitor" ? "var(--competitor)" : signal.type === "patent" ? "var(--patent)" : "var(--market)", backgroundColor: signal.type === "competitor" ? "var(--competitor-bg)" : signal.type === "patent" ? "var(--patent-bg)" : "var(--market-bg)", fontFamily: "var(--font-mono)" }}>
              {signal.type}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.3, color: "var(--text)", fontFamily: "var(--font-sans)", marginBottom: "16px" }}>
            {signal.title}
          </h1>

          {/* Verdict row */}
          {decision && verdictStyle ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "15px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "6px 18px", borderRadius: "8px",
                color: verdictStyle.color, backgroundColor: verdictStyle.bg, border: `1px solid ${verdictStyle.border}`,
                fontFamily: "var(--font-sans)",
              }}>
                {decision.verdict}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: verdictStyle.color, fontFamily: "var(--font-mono)" }}>
                {Math.round(decision.confidence * 100)}% confidence
              </span>
              {decision.timeframe && (
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>· {decision.timeframe}</span>
              )}
            </div>
          ) : signal.status === "pending" && !isRunning ? (
            <button onClick={onAnalyze} style={{ padding: "10px 24px", borderRadius: "8px", backgroundColor: "var(--viega-yellow)", color: "#000", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer", border: "none" }}>
              ⚡ Analyze with AI
            </button>
          ) : null}

          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
              <div className="spinner" />
              <span style={{ fontSize: "13px", color: "var(--viega-yellow)" }}>{runningStep}</span>
            </div>
          )}
        </div>

        {/* ── KPI metrics ────────────────────────────────────────────────── */}
        {(decision || analysis) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
            {decision && (
              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>Impact Score</div>
                <div style={{ fontSize: "40px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                  {decision.impactScore}
                  <span style={{ fontSize: "16px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
                </div>
              </div>
            )}
            {analysis && (
              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>Relevance</div>
                <div style={{ fontSize: "40px", fontWeight: 700, color: "var(--market)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                  {Math.round(analysis.relevance * 100)}
                  <span style={{ fontSize: "16px", fontWeight: 400, color: "var(--text-muted)" }}>%</span>
                </div>
              </div>
            )}
            {analysis && (
              <div style={{ padding: "20px 24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>Urgency</div>
                <div style={{ fontSize: "40px", fontWeight: 700, color: "var(--competitor)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                  {Math.round(analysis.urgency * 100)}
                  <span style={{ fontSize: "16px", fontWeight: 400, color: "var(--text-muted)" }}>%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Summary + products ─────────────────────────────────────────── */}
        {analysis && (
          <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)", marginBottom: "28px" }}>
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginBottom: analysis.affectedProducts.length > 0 ? "16px" : "0" }}>
              {analysis.summary}
            </p>
            {analysis.affectedProducts.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {analysis.affectedProducts.map((p) => (
                  <span key={p} style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "4px", backgroundColor: "var(--viega-yellow-dim)", color: "var(--viega-yellow)", border: "1px solid var(--viega-yellow-border)", fontFamily: "var(--font-sans)" }}>
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Toggle buttons ─────────────────────────────────────────────── */}
        {decision && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            {([
              { panel: "debate" as Panel,   label: "Persona-Debatte", icon: "🗣" },
              { panel: "analysis" as Panel, label: "Vollanalyse",     icon: "📋" },
            ] as const).map(({ panel, label, icon }) => (
              <button
                key={panel}
                onClick={() => toggle(panel)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", borderRadius: "10px",
                  backgroundColor: open === panel ? "var(--viega-yellow)" : "var(--card)",
                  color: open === panel ? "#000" : "var(--text-secondary)",
                  border: `1px solid ${open === panel ? "var(--viega-yellow)" : "var(--border)"}`,
                  boxShadow: open === panel ? "var(--viega-yellow-glow)" : "none",
                  fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span>{icon}  {label}</span>
                {open === panel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            ))}
          </div>
        )}

        {/* ── Persona debate panel ───────────────────────────────────────── */}
        {open === "debate" && personas.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
            {personas.map((p) => {
              const pStyle = PERSONA_STYLES[p.persona as keyof typeof PERSONA_STYLES]
                ?? { color: "var(--text-muted)", bg: "var(--card)", border: "var(--border)", emoji: "🤖", name: p.personaName, role: "" };
              return (
                <div key={p.id} className="fade-up" style={{ padding: "20px", borderRadius: "12px", backgroundColor: pStyle.bg, border: `1px solid ${pStyle.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: `${pStyle.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                        {pStyle.emoji}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: pStyle.color, fontFamily: "var(--font-sans)" }}>{pStyle.name}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{pStyle.role}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: STANCE_COLORS[p.stance] ?? "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                      {STANCE_LABELS[p.stance] ?? p.stance}
                    </span>
                  </div>
                  <blockquote style={{ fontSize: "13px", fontStyle: "italic", lineHeight: 1.6, color: "var(--text)", paddingLeft: "12px", borderLeft: `3px solid ${pStyle.color}`, margin: 0 }}>
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>
                  <p style={{ fontSize: "12px", lineHeight: 1.7, color: "var(--text-muted)", margin: 0 }}>
                    {p.argument}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Full analysis panel ────────────────────────────────────────── */}
        {open === "analysis" && decision && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Reasoning */}
            <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: verdictStyle?.bg, border: `1px solid ${verdictStyle?.border}` }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: verdictStyle?.color, marginBottom: "12px", fontFamily: "var(--font-mono)" }}>
                AI Reasoning
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-secondary)" }}>
                {decision.reasoning}
              </p>
              {decision.productIdea && (
                <div style={{ marginTop: "16px", padding: "16px", borderRadius: "8px", backgroundColor: "var(--viega-yellow-dim)", border: "1px solid var(--viega-yellow-border)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "var(--viega-yellow)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
                    💡 Product Idea
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-secondary)" }}>
                    {decision.productIdea}
                  </p>
                </div>
              )}
            </div>

            {/* Impact breakdown */}
            {decision.impactBreakdown && (
              <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    Impact Score Breakdown
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                    {decision.impactScore}<span style={{ fontSize: "13px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {BREAKDOWN_DIMS.map(({ key, label, weight, color }) => {
                    const dim = decision.impactBreakdown![key];
                    const pct = (dim.score / 5) * 100;
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
                            <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", backgroundColor: `${color}14`, color, fontFamily: "var(--font-mono)" }}>{weight}</span>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{dim.score}/5</span>
                        </div>
                        <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "var(--border)", marginBottom: "8px", overflow: "hidden" }}>
                          <div className="bar-fill" style={{ height: "100%", borderRadius: "2px", width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}50` }} />
                        </div>
                        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--text-muted)" }}>{dim.rationale}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key insights */}
            {analysis && analysis.keyInsights.length > 0 && (
              <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>
                  Key Insights
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {analysis.keyInsights.map((insight, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--viega-yellow)", fontWeight: 700, fontSize: "16px", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>›</span>
                      <span style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)" }}>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Human-in-the-loop */}
            <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>
                Your Verdict
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                {[
                  { action: "approve", icon: ThumbsUp,   color: "var(--build)",      label: "Approve" },
                  { action: "reject",  icon: ThumbsDown, color: "var(--competitor)", label: "Reject" },
                  { action: "boost",   icon: TrendingUp, color: "var(--invest)",     label: "Boost" },
                ].map(({ action, icon: Icon, color, label }) => (
                  <button key={action} onClick={() => handleFeedback(action, false)} disabled={isRunning}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: isRunning ? "not-allowed" : "pointer", transition: "all 0.15s", backgroundColor: lastAction === action ? color : `${color}12`, color: lastAction === action ? "#000" : color, border: `1px solid ${color}40`, opacity: isRunning ? 0.5 : 1, fontFamily: "var(--font-sans)" }}>
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Importance</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button key={d} onClick={() => setImportance(d)}
                      style={{ width: "14px", height: "14px", borderRadius: "50%", cursor: "pointer", border: "none", transition: "all 0.15s", backgroundColor: d <= importance ? "var(--viega-yellow)" : "var(--border)", transform: d <= importance ? "scale(1.15)" : "scale(1)" }} />
                  ))}
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--viega-yellow)", fontFamily: "var(--font-mono)" }}>{importance}/5</span>
              </div>
              <button onClick={() => handleFeedback("boost", true)} disabled={isRunning}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: isRunning ? "not-allowed" : "pointer", backgroundColor: isRunning ? "var(--border)" : "var(--viega-yellow)", color: isRunning ? "var(--text-muted)" : "#000", border: "none", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}>
                <RotateCcw size={14} />
                {isRunning ? runningStep : "Re-analyze with My Input"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
