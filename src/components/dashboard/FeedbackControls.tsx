"use client";

import { useState } from "react";

interface FeedbackControlsProps {
  signalId: string;
  onFeedbackSubmit: (
    action: string,
    importance: number,
    reanalyze: boolean
  ) => Promise<void>;
  isRunning: boolean;
}

export function FeedbackControls({
  signalId,
  onFeedbackSubmit,
  isRunning,
}: FeedbackControlsProps) {
  const [importance, setImportance] = useState(3);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleAction = async (action: string, reanalyze: boolean) => {
    setLastAction(action);
    await onFeedbackSubmit(action, importance, reanalyze);
  };

  const dots = [1, 2, 3, 4, 5];

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: "var(--muted)" }}
      >
        Your Verdict
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleAction("approve", false)}
          disabled={isRunning}
          className="flex-1 py-1.5 text-xs font-semibold rounded transition-all"
          style={{
            backgroundColor:
              lastAction === "approve"
                ? "var(--build)"
                : "rgba(34,197,94,0.1)",
            color: lastAction === "approve" ? "#000" : "var(--build)",
            border: "1px solid var(--build)",
            opacity: isRunning ? 0.5 : 1,
          }}
        >
          ✓ Approve
        </button>
        <button
          onClick={() => handleAction("reject", false)}
          disabled={isRunning}
          className="flex-1 py-1.5 text-xs font-semibold rounded transition-all"
          style={{
            backgroundColor:
              lastAction === "reject"
                ? "var(--competitor)"
                : "rgba(239,68,68,0.1)",
            color: lastAction === "reject" ? "#fff" : "var(--competitor)",
            border: "1px solid var(--competitor)",
            opacity: isRunning ? 0.5 : 1,
          }}
        >
          ✗ Reject
        </button>
        <button
          onClick={() => handleAction("boost", false)}
          disabled={isRunning}
          className="flex-1 py-1.5 text-xs font-semibold rounded transition-all"
          style={{
            backgroundColor:
              lastAction === "boost"
                ? "var(--invest)"
                : "rgba(245,158,11,0.1)",
            color: lastAction === "boost" ? "#000" : "var(--invest)",
            border: "1px solid var(--invest)",
            opacity: isRunning ? 0.5 : 1,
          }}
        >
          ↑ Boost
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span style={{ color: "var(--muted)" }} className="text-xs shrink-0">
          Importance
        </span>
        <div className="flex gap-1">
          {dots.map((d) => (
            <button
              key={d}
              onClick={() => setImportance(d)}
              className="w-4 h-4 rounded-full transition-all"
              style={{
                backgroundColor:
                  d <= importance ? "var(--viega-yellow)" : "var(--border)",
              }}
            />
          ))}
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--viega-yellow)" }}>
          {importance}/5
        </span>
      </div>

      <button
        onClick={() => handleAction("boost", true)}
        disabled={isRunning}
        className="w-full py-2 text-xs font-semibold rounded transition-all"
        style={{
          backgroundColor: isRunning ? "var(--border)" : "var(--viega-yellow)",
          color: isRunning ? "var(--muted)" : "#000",
          opacity: isRunning ? 0.7 : 1,
          cursor: isRunning ? "not-allowed" : "pointer",
        }}
      >
        {isRunning ? "⟳ Analyzing…" : "↻ Re-analyze with My Input"}
      </button>

      {lastAction && !isRunning && (
        <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
          Feedback recorded: {lastAction}
        </p>
      )}
    </div>
  );
}
