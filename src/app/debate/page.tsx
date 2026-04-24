"use client";

import { useEffect, useState } from "react";
import type { Signal, PersonaArgument } from "@/types";
import { ChevronDown, MessageSquare } from "lucide-react";

const PERSONA_STYLES = {
  innovator: {
    color: "var(--innovator)",
    bg: "var(--innovator-bg)",
    border: "var(--innovator-border)",
    emoji: "🚀",
    name: "David",
    role: "Digital Innovator",
  },
  traditionalist: {
    color: "var(--traditionalist)",
    bg: "var(--traditionalist-bg)",
    border: "var(--traditionalist-border)",
    emoji: "🏛",
    name: "Josef",
    role: "Loyal Traditionalist",
  },
  analyst: {
    color: "var(--analyst)",
    bg: "var(--analyst-bg)",
    border: "var(--analyst-border)",
    emoji: "📊",
    name: "Steffen",
    role: "Demanding Doer",
  },
};

const STANCE_LABELS: Record<string, string> = {
  strongly_agree: "Strongly Agree",
  agree: "Agree",
  neutral: "Neutral",
  disagree: "Disagree",
  strongly_disagree: "Strongly Oppose",
};

const STANCE_RANK: Record<string, number> = {
  strongly_agree: 2,
  agree: 1,
  neutral: 0,
  disagree: -1,
  strongly_disagree: -2,
};

const VERDICT_STYLES = {
  Build:  { color: "var(--build)",  bg: "var(--build-bg)",  border: "var(--build-border)" },
  Invest: { color: "var(--invest)", bg: "var(--invest-bg)", border: "var(--invest-border)" },
  Ignore: { color: "var(--ignore)", bg: "var(--ignore-bg)", border: "var(--ignore-border)" },
};

function StanceBar({ stance }: { stance: string }) {
  const rank = STANCE_RANK[stance] ?? 0;
  const pct = ((rank + 2) / 4) * 100;
  const color = rank >= 1 ? "var(--build)" : rank <= -1 ? "var(--competitor)" : "var(--text-muted)";
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Oppose</span>
        <span style={{ fontSize: "11px", fontWeight: 600, color }}>{STANCE_LABELS[stance] ?? stance}</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Support</span>
      </div>
      <div style={{ height: "6px", borderRadius: "4px", backgroundColor: "var(--border)" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "4px", backgroundColor: color, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

function ConsensusBar({ personas }: { personas: PersonaArgument[] }) {
  if (!personas || personas.length === 0) return null;
  const avg = personas.reduce((sum, p) => sum + (STANCE_RANK[p.stance] ?? 0), 0) / personas.length;
  const pct = ((avg + 2) / 4) * 100;
  const color = avg >= 0.5 ? "var(--build)" : avg <= -0.5 ? "var(--competitor)" : "var(--invest)";
  const label = avg >= 1 ? "Strong Consensus to Act" : avg >= 0 ? "Lean Toward Action" : avg >= -1 ? "Mixed Views" : "Lean Against";

  return (
    <div
      style={{
        padding: "24px 28px",
        borderRadius: "14px",
        backgroundColor: "var(--card)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
          Consensus Meter
        </h3>
        <span style={{ fontSize: "14px", fontWeight: 700, color }}>{label}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Oppose</span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Support</span>
      </div>
      <div style={{ height: "10px", borderRadius: "6px", backgroundColor: "var(--border)" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "6px", backgroundColor: color, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

export default function DebatePage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        const decided = data.filter((s) => s.status === "decided" && s.decision);
        setSignals(decided);
        if (decided.length > 0) setSelectedId(decided[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selected = signals.find((s) => s.id === selectedId);
  const decision = selected?.decision;
  const personas = decision?.personas ?? [];
  const verdictStyle = decision ? VERDICT_STYLES[decision.verdict as keyof typeof VERDICT_STYLES] : null;
  const personaOrder: Array<keyof typeof PERSONA_STYLES> = ["innovator", "traditionalist", "analyst"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--bg)" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
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
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px", lineHeight: 1.1, fontFamily: "var(--font-sans)" }}>
            Agent Debate
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            AI persona deliberation — transparent reasoning from three strategic voices
          </p>
        </div>

        {signals.length > 0 && (
          <div style={{ position: "relative" }}>
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                appearance: "none",
                paddingRight: "36px",
                paddingLeft: "14px",
                paddingTop: "10px",
                paddingBottom: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                backgroundColor: "var(--surface)",
                border: "0.6px solid var(--border)",
                color: "var(--text)",
                outline: "none",
                minWidth: "280px",
                fontFamily: "var(--font-sans)",
              }}
            >
              {signals.map((s) => (
                <option key={s.id} value={s.id} style={{ backgroundColor: "var(--card)", color: "var(--text)" }}>
                  {s.title.length > 60 ? s.title.slice(0, 60) + "…" : s.title}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "14px" }} />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "240px",
              borderRadius: "14px",
              backgroundColor: "var(--card)",
              boxShadow: "var(--card-shadow)",
              gap: "12px",
            }}
          >
            <MessageSquare size={32} style={{ color: "var(--text-muted)" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)" }}>No analyzed signals yet</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Run the AI pipeline on a signal from the Dashboard first.</p>
          </div>
        ) : (
          <>
            {/* Signal context card */}
            {selected && (
              <div
                style={{
                  padding: "24px 28px",
                  borderRadius: "14px",
                  backgroundColor: "var(--card)",
                  boxShadow: "var(--card-shadow)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "24px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>
                    {selected.source}
                  </p>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", lineHeight: 1.3, fontFamily: "var(--font-sans)" }}>
                    {selected.title}
                  </h2>
                  {decision && (
                    <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)", marginTop: "10px" }}>
                      {decision.reasoning}
                    </p>
                  )}
                </div>
                {decision && verdictStyle && (
                  <div
                    style={{
                      flexShrink: 0,
                      padding: "16px 24px",
                      borderRadius: "12px",
                      textAlign: "center",
                      backgroundColor: verdictStyle.bg,
                      border: `1px solid ${verdictStyle.border}`,
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.02em", color: verdictStyle.color, fontFamily: "var(--font-sans)" }}>
                      {decision.verdict.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {Math.round(decision.confidence * 100)}% confidence
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Persona columns */}
            {personas.length > 0 ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  {personaOrder.map((personaKey) => {
                    const p = personas.find((x) => x.persona === personaKey);
                    const style = PERSONA_STYLES[personaKey];
                    if (!p) return null;
                    return (
                      <div
                        key={personaKey}
                        className="fade-up"
                        style={{
                          padding: "24px",
                          borderRadius: "14px",
                          backgroundColor: "var(--card)",
                          boxShadow: "var(--card-shadow)",
                          border: `1px solid ${style.border}`,
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        {/* Persona header */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              backgroundColor: style.bg,
                              flexShrink: 0,
                            }}
                          >
                            {style.emoji}
                          </div>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: 700, color: style.color, fontFamily: "var(--font-sans)" }}>
                              {style.name}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {style.role}
                            </div>
                          </div>
                        </div>

                        {/* Quote */}
                        <blockquote
                          style={{
                            fontSize: "13px",
                            fontStyle: "italic",
                            lineHeight: 1.6,
                            padding: "12px 14px",
                            borderRadius: "8px",
                            backgroundColor: style.bg,
                            borderLeft: `3px solid ${style.color}`,
                            color: "var(--text)",
                          }}
                        >
                          &ldquo;{p.quote}&rdquo;
                        </blockquote>

                        {/* Argument */}
                        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)", flex: 1 }}>
                          {p.argument}
                        </p>

                        <StanceBar stance={p.stance} />
                      </div>
                    );
                  })}
                </div>

                <ConsensusBar personas={personas} />

                {/* Product idea */}
                {decision?.productIdea && (
                  <div
                    style={{
                      padding: "24px 28px",
                      borderRadius: "14px",
                      backgroundColor: "var(--card)",
                      boxShadow: "var(--card-shadow)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "18px" }}>💡</span>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
                        Synthesized Product Idea
                      </h3>
                    </div>
                    <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-secondary)" }}>
                      {decision.productIdea}
                    </p>
                    <div style={{ display: "flex", gap: "24px", marginTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Impact Score</span>
                        <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                          {decision.impactScore}<span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
                        </span>
                      </div>
                      {decision.timeframe && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Timeframe</span>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{decision.timeframe}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "120px",
                  borderRadius: "14px",
                  backgroundColor: "var(--card)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>No persona debate available for this signal.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
