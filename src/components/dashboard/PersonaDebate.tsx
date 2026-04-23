"use client";

import type { PersonaArgument, Stance } from "@/types";

interface PersonaDebateProps {
  personas: PersonaArgument[];
}

const PERSONA_CONFIG = {
  innovator: { emoji: "🚀", color: "#3B82F6", bgColor: "rgba(59,130,246,0.08)" },
  traditionalist: { emoji: "🏛", color: "#8B5CF6", bgColor: "rgba(139,92,246,0.08)" },
  analyst: { emoji: "📊", color: "#F59E0B", bgColor: "rgba(245,158,11,0.08)" },
} as const;

const STANCE_LABELS: Record<Stance, { label: string; color: string }> = {
  strongly_agree: { label: "STRONGLY BUILD", color: "var(--build)" },
  agree: { label: "AGREE", color: "var(--build)" },
  neutral: { label: "NEUTRAL", color: "var(--muted)" },
  disagree: { label: "DISAGREE", color: "var(--invest)" },
  strongly_disagree: { label: "STRONGLY OPPOSE", color: "var(--competitor)" },
};

function PersonaCard({ persona }: { persona: PersonaArgument }) {
  const config = PERSONA_CONFIG[persona.persona as keyof typeof PERSONA_CONFIG] ?? {
    emoji: "🤖",
    color: "var(--muted)",
    bgColor: "var(--surface)",
  };
  const stanceInfo = STANCE_LABELS[persona.stance as Stance] ?? {
    label: persona.stance.toUpperCase(),
    color: "var(--muted)",
  };

  return (
    <div
      className="p-3 rounded-lg animate-slide-in"
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}33`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{config.emoji}</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: config.color }}>
              {persona.personaName}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-bold tracking-wide"
          style={{ color: stanceInfo.color }}
        >
          {stanceInfo.label}
        </span>
      </div>

      <blockquote
        className="text-xs italic mb-2 pl-2"
        style={{
          color: "var(--text)",
          borderLeft: `2px solid ${config.color}`,
        }}
      >
        &ldquo;{persona.quote}&rdquo;
      </blockquote>

      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
        {persona.argument}
      </p>
    </div>
  );
}

export function PersonaDebate({ personas }: PersonaDebateProps) {
  if (personas.length === 0) return null;

  return (
    <div>
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: "var(--muted)" }}
      >
        Persona Debate
      </p>
      <div className="space-y-2.5">
        {personas.map((p) => (
          <PersonaCard key={p.id} persona={p} />
        ))}
      </div>
    </div>
  );
}
