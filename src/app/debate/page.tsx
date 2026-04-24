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
  Build: { color: "var(--build)", bg: "var(--build-bg)", border: "var(--build-border)" },
  Invest: { color: "var(--invest)", bg: "var(--invest-bg)", border: "var(--invest-border)" },
  Ignore: { color: "var(--ignore)", bg: "var(--ignore-bg)", border: "var(--ignore-border)" },
};

function StanceBar({ stance }: { stance: string }) {
  const rank = STANCE_RANK[stance] ?? 0;
  const pct = ((rank + 2) / 4) * 100;
  const color =
    rank >= 1 ? "var(--build)" : rank <= -1 ? "var(--competitor)" : "var(--text-muted)";
  return (
    <div className="mt-3">
      <div className="flex justify-between mb-1">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Oppose
        </span>
        <span className="text-[10px] font-semibold" style={{ color }}>
          {STANCE_LABELS[stance] ?? stance}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          Support
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ backgroundColor: "var(--border)" }}>
        <div
          className="h-1 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ConsensusBar({ personas }: { personas: PersonaArgument[] }) {
  if (!personas || personas.length === 0) return null;
  const avg = personas.reduce((sum, p) => sum + (STANCE_RANK[p.stance] ?? 0), 0) / personas.length;
  const pct = ((avg + 2) / 4) * 100;
  const color = avg >= 0.5 ? "var(--build)" : avg <= -0.5 ? "var(--competitor)" : "var(--invest)";
  const label =
    avg >= 1 ? "Strong Consensus to Act" : avg >= 0 ? "Lean Toward Action" : avg >= -1 ? "Mixed Views" : "Lean Against";

  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <p
        className="text-[11px] font-semibold tracking-widest uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        Consensus Meter
      </p>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Oppose
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Support
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: "var(--border)" }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
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
  const verdictStyle = decision
    ? VERDICT_STYLES[decision.verdict as keyof typeof VERDICT_STYLES]
    : null;

  const personaOrder: Array<keyof typeof PERSONA_STYLES> = [
    "innovator",
    "traditionalist",
    "analyst",
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg)" }}>
      {/* Page header */}
      <div
        className="shrink-0 px-8 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              Agent Debate
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              AI persona deliberation — transparent reasoning from three strategic voices
            </p>
          </div>

          {/* Signal selector */}
          {signals.length > 0 && (
            <div className="relative">
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  outline: "none",
                  minWidth: 280,
                }}
              >
                {signals.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title.length > 60 ? s.title.slice(0, 60) + "…" : s.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-64 rounded-2xl"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <MessageSquare size={32} style={{ color: "var(--text-muted)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              No analyzed signals yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Run the AI pipeline on a signal from the Dashboard first.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Signal context */}
            {selected && (
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-[11px] font-semibold tracking-widest uppercase mb-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {selected.source}
                    </p>
                    <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                      {selected.title}
                    </h2>
                  </div>
                  {decision && verdictStyle && (
                    <div
                      className="shrink-0 px-4 py-2 rounded-lg text-center"
                      style={{
                        backgroundColor: verdictStyle.bg,
                        border: `1px solid ${verdictStyle.border}`,
                      }}
                    >
                      <div
                        className="text-lg font-black tracking-tighter"
                        style={{ color: verdictStyle.color }}
                      >
                        {decision.verdict.toUpperCase()}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {Math.round(decision.confidence * 100)}% confidence
                      </div>
                    </div>
                  )}
                </div>
                {decision && (
                  <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {decision.reasoning}
                  </p>
                )}
              </div>
            )}

            {/* Persona columns */}
            {personas.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {personaOrder.map((personaKey) => {
                    const p = personas.find((x) => x.persona === personaKey);
                    const style = PERSONA_STYLES[personaKey];
                    if (!p) return null;
                    return (
                      <div
                        key={personaKey}
                        className="p-4 rounded-xl flex flex-col gap-3 fade-up"
                        style={{
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        {/* Persona header */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: `${style.color}18` }}
                          >
                            {style.emoji}
                          </div>
                          <div>
                            <div
                              className="text-sm font-bold"
                              style={{ color: style.color }}
                            >
                              {style.name}
                            </div>
                            <div
                              className="text-[10px] font-medium"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {style.role}
                            </div>
                          </div>
                        </div>

                        {/* Quote */}
                        <blockquote
                          className="text-xs italic leading-relaxed px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: `${style.color}0D`,
                            borderLeft: `3px solid ${style.color}`,
                            color: "var(--text)",
                          }}
                        >
                          &ldquo;{p.quote}&rdquo;
                        </blockquote>

                        {/* Argument */}
                        <p
                          className="text-[12px] leading-relaxed flex-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {p.argument}
                        </p>

                        {/* Stance bar */}
                        <StanceBar stance={p.stance} />
                      </div>
                    );
                  })}
                </div>

                {/* Consensus meter */}
                <ConsensusBar personas={personas} />

                {/* Product idea */}
                {decision?.productIdea && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--viega-yellow-border)",
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold tracking-widest uppercase mb-2"
                      style={{ color: "var(--viega-yellow)" }}
                    >
                      💡 Synthesized Product Idea
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {decision.productIdea}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>
                        Impact{" "}
                        <b style={{ color: "var(--text)" }}>{decision.impactScore}/10</b>
                      </span>
                      {decision.timeframe && (
                        <span>
                          Timeframe{" "}
                          <b style={{ color: "var(--text)" }}>{decision.timeframe}</b>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex items-center justify-center h-32 rounded-xl"
                style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No persona debate available for this signal.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
