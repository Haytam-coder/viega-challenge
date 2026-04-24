"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Signal } from "@/types";
import { CheckCircle, Zap, ArrowRight, Inbox, ExternalLink } from "lucide-react";

const TYPE_META = {
  competitor: { label: "COMP", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "MKT",  color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "PAT",  color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

const VERDICT_CONFIG = [
  { key: "Build",  label: "Build",  bg: "#00B69B", kbd: "B" },
  { key: "Invest", label: "Invest", bg: "#f59e0b", kbd: "I" },
  { key: "Ignore", label: "Ignore", bg: "#6b7280", kbd: "X" },
] as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function priorityScore(signal: Signal): number {
  const impact = signal.decision?.impactScore ?? signal.analysis?.marketImpact ?? 0;
  const urgency = signal.analysis?.urgency ?? 5;
  const ageHours = (Date.now() - new Date(signal.createdAt).getTime()) / 3600000;
  const ageFactor = 1 + Math.min(ageHours / 48, 1.5);
  return Math.round(impact * urgency * ageFactor * 10) / 10;
}

function aiHint(signal: Signal): { verdict: string; color: string; bg: string } {
  const impact = signal.analysis?.marketImpact ?? 0;
  const urgency = signal.analysis?.urgency ?? 0;
  const score = (impact + urgency) / 2;
  if (score >= 7) return { verdict: "Build",  color: "#00B69B", bg: "rgba(0,182,155,0.1)" };
  if (score >= 4) return { verdict: "Invest", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
  return              { verdict: "Ignore", color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
}

function sliderColor(val: number): string {
  if (val >= 8) return "#00B69B";
  if (val >= 5) return "#f59e0b";
  return "#EF3826";
}

type Phase = "decide" | "rate" | "done";

interface QueueItemProps {
  signal: Signal;
  onAnalyzeDone: (id: string) => void;
  onDecideDone:  (id: string) => void;
}

// ── AnalyzeItem ───────────────────────────────────────────────────────────────

function AnalyzeItem({ signal, onAnalyzeDone }: Omit<QueueItemProps, "onDecideDone">) {
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const tMeta = TYPE_META[signal.type as keyof typeof TYPE_META] ?? TYPE_META.market;

  const run = async () => {
    setRunning(true);
    try {
      await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: signal.id }) });
      await fetch("/api/decide",  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: signal.id }) });
      setDone(true);
      setTimeout(() => onAnalyzeDone(signal.id), 600);
    } catch {
      setRunning(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        borderRadius: "10px",
        backgroundColor: "var(--card)",
        border: "0.3px solid var(--border)",
        opacity: done ? 0.4 : 1,
        transition: "opacity 0.4s",
      }}
    >
      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", color: tMeta.color, backgroundColor: tMeta.bg, border: `1px solid ${tMeta.border}`, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
        {tMeta.label}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
          {signal.title}
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
          {signal.source} · {timeAgo(signal.createdAt)}
        </p>
      </div>

      <Link href={`/?id=${signal.id}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0, padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
        <ExternalLink size={11} /> Details
      </Link>

      {done ? (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--build)", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
          <CheckCircle size={15} /> Done
        </div>
      ) : (
        <button
          onClick={run}
          disabled={running}
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, backgroundColor: running ? "var(--border)" : "var(--accent)", color: running ? "var(--text-muted)" : "#fff", border: "none", cursor: running ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)" }}
        >
          {running ? (
            <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: "#fff" }} /> Analyzing…</>
          ) : (
            <><Zap size={13} /> Analyze &amp; Decide</>
          )}
        </button>
      )}
    </div>
  );
}

// ── DecideItem ────────────────────────────────────────────────────────────────

function DecideItem({ signal, onDecideDone }: Omit<QueueItemProps, "onAnalyzeDone">) {
  const [phase, setPhase]               = useState<Phase>("decide");
  const [deciding, setDeciding]         = useState<string | null>(null);
  const [context, setContext]           = useState("");
  const [aiResult, setAiResult]         = useState<{ verdict: string; confidence: number } | null>(null);
  const [satisfaction, setSatisfaction] = useState(7);
  const [comment, setComment]           = useState("");
  const [submitting, setSubmitting]     = useState(false);

  const tMeta    = TYPE_META[signal.type as keyof typeof TYPE_META] ?? TYPE_META.market;
  const impact   = signal.analysis?.marketImpact ?? 0;
  const urgency  = signal.analysis?.urgency ?? 0;
  const hasCtx   = context.trim().length > 0;
  const hint     = aiHint(signal);
  const thumbColor = sliderColor(satisfaction);

  const decide = async (verdict: string) => {
    setDeciding(verdict);
    try {
      if (hasCtx) {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId: signal.id, action: "boost", comment: context.trim() }),
        });
        const res  = await fetch("/api/decide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId: signal.id, userFeedbackContext: `PM context: "${context.trim()}". PM leans toward: ${verdict}.` }),
        });
        const data = await res.json();
        setAiResult({ verdict: data.verdict, confidence: data.confidence });
      } else {
        await fetch("/api/decide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId: signal.id, forceVerdict: verdict }),
        });
      }
      setPhase("rate");
    } catch {
      setDeciding(null);
    }
  };

  const submitRating = async () => {
    setSubmitting(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signalId: signal.id,
        action:    satisfaction >= 7 ? "approve" : "deprioritize",
        importance: Math.max(1, Math.min(5, Math.round(satisfaction / 2))),
        comment:   comment.trim() || undefined,
      }),
    });
    setPhase("done");
    setTimeout(() => onDecideDone(signal.id), 700);
  };

  const skipRating = () => {
    setPhase("done");
    setTimeout(() => onDecideDone(signal.id), 400);
  };

  return (
    <div
      style={{
        padding: "18px 20px",
        borderRadius: "10px",
        backgroundColor: "var(--card)",
        border: "0.3px solid var(--border)",
        opacity: phase === "done" ? 0.4 : 1,
        transition: "opacity 0.4s",
      }}
    >
      {/* ── Header row ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", color: tMeta.color, backgroundColor: tMeta.bg, border: `1px solid ${tMeta.border}`, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
          {tMeta.label}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
            {signal.title}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
            {signal.source} · {timeAgo(signal.createdAt)}
          </p>
        </div>

        {/* AI hint badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>AI suggests</span>
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", color: hint.color, backgroundColor: hint.bg, border: `1px solid ${hint.color}30` }}>
            {hint.verdict.toUpperCase()}
          </span>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
          {[{ label: "Impact", value: impact }, { label: "Urgency", value: urgency }].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                {value}<span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>

        <Link href={`/?id=${signal.id}`} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0, padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <ExternalLink size={11} /> Details
        </Link>
      </div>

      {/* ── Summary ──────────────────────────────────────────────── */}
      {signal.analysis?.summary && phase !== "rate" && (
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: "14px", borderLeft: "3px solid var(--border)", paddingLeft: "12px" }}>
          {signal.analysis.summary.length > 180 ? signal.analysis.summary.slice(0, 180) + "…" : signal.analysis.summary}
        </p>
      )}

      {/* ── PHASE: decide ────────────────────────────────────────── */}
      {phase === "decide" && (
        <>
          {/* Context textarea */}
          <div style={{ marginBottom: "14px" }}>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={deciding !== null}
              placeholder="Add context for AI re-analysis… (optional — leave empty for instant decision)"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: hasCtx ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                backgroundColor: hasCtx ? "var(--accent-bg)" : "var(--surface)",
                fontSize: "13px",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                resize: "none",
                outline: "none",
                transition: "border-color 0.15s, background-color 0.15s",
                boxSizing: "border-box",
                lineHeight: 1.5,
              }}
            />
            {hasCtx && (
              <p style={{ fontSize: "11px", color: "var(--accent)", marginTop: "4px", fontWeight: 500 }}>
                AI will re-analyze with your context · verdict below is a suggestion, not final
              </p>
            )}
          </div>

          {/* Verdict buttons */}
          <div>
            {hasCtx && (
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Suggest direction → AI will decide with your context
              </p>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              {VERDICT_CONFIG.map(({ key, label, bg, kbd }) => {
                const isFilled = deciding === key;
                return (
                  <button
                    key={key}
                    onClick={() => decide(key)}
                    disabled={deciding !== null}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isFilled ? "#ffffff" : bg,
                      backgroundColor: isFilled ? bg : "transparent",
                      border: `1.5px solid ${bg}`,
                      cursor: deciding ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-sans)",
                      transition: "all 0.12s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      opacity: deciding && !isFilled ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => { if (!deciding) { e.currentTarget.style.backgroundColor = bg; e.currentTarget.style.color = "#ffffff"; } }}
                    onMouseLeave={(e) => { if (!isFilled) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = bg; } }}
                  >
                    {deciding === key ? (
                      <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                    ) : (
                      <kbd style={{ fontSize: "10px", fontWeight: 400, opacity: 0.6, fontFamily: "var(--font-mono)", border: "1px solid currentColor", borderRadius: "3px", padding: "0 4px" }}>{kbd}</kbd>
                    )}
                    {hasCtx ? `→ ${label}` : label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── PHASE: rate ──────────────────────────────────────────── */}
      {phase === "rate" && (
        <div className="fade-up">
          {/* Decision confirmation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <CheckCircle size={15} style={{ color: "var(--build)", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--build)" }}>
              {aiResult ? "AI re-analyzed with your context" : "Decision recorded"}
            </span>
            {aiResult && (
              <>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>→</span>
                <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px", color: aiResult.verdict === "Build" ? "#00B69B" : aiResult.verdict === "Invest" ? "#f59e0b" : "#6b7280", backgroundColor: aiResult.verdict === "Build" ? "rgba(0,182,155,0.1)" : aiResult.verdict === "Invest" ? "rgba(245,158,11,0.1)" : "rgba(107,114,128,0.1)" }}>
                  {aiResult.verdict}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {Math.round(aiResult.confidence * 100)}% confidence
                </span>
              </>
            )}
          </div>

          {/* Slider */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                How satisfied are you with this decision?
              </span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: thumbColor, fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                {satisfaction}<span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-muted)" }}>/10</span>
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={satisfaction}
              onChange={(e) => setSatisfaction(Number(e.target.value))}
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                outline: "none",
                cursor: "pointer",
                accentColor: thumbColor,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Very dissatisfied</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Perfect</span>
            </div>
          </div>

          {/* Comment (auto-shown when dissatisfied) */}
          {(satisfaction < 7 || comment) && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={satisfaction < 7 ? "What would you improve? (optional)" : "Add a note… (optional)"}
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                fontSize: "13px",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.5,
                marginBottom: "12px",
              }}
            />
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={submitRating}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                backgroundColor: submitting ? "var(--border)" : "var(--accent)",
                color: submitting ? "var(--text-muted)" : "#fff",
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {submitting ? "Saving…" : "Submit feedback"}
            </button>
            <button
              onClick={skipRating}
              disabled={submitting}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Skip →
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE: done ──────────────────────────────────────────── */}
      {phase === "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--build)", fontSize: "13px", fontWeight: 600 }}>
          <CheckCircle size={15} /> Done
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QueuePage() {
  const [signals, setSignals]     = useState<Signal[]>([]);
  const [loading, setLoading]     = useState(true);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const fetchSignals = useCallback(async () => {
    const res  = await fetch("/api/signals");
    const data: Signal[] = await res.json();
    setSignals(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  const remove = (id: string) => setRemovedIds((prev) => new Set([...prev, id]));

  const active        = signals.filter((s) => !removedIds.has(s.id));
  const needsDecision = active.filter((s) => s.status === "analyzed").sort((a, b) => priorityScore(b) - priorityScore(a));
  const needsAnalysis = active.filter((s) => s.status === "pending").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const totalPending  = needsDecision.length + needsAnalysis.length;
  const decided       = signals.filter((s) => s.status === "decided").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--bg)" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ padding: "20px 28px 16px", borderBottom: "0.6px solid var(--border)", backgroundColor: "var(--card)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px", lineHeight: 1.1, fontFamily: "var(--font-sans)" }}>
              Action Queue
            </h1>
            {!loading && totalPending > 0 && (
              <span style={{ fontSize: "13px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", backgroundColor: totalPending > 5 ? "rgba(239,56,38,0.12)" : "var(--invest-bg)", color: totalPending > 5 ? "#EF3826" : "var(--invest)", border: `1px solid ${totalPending > 5 ? "rgba(239,56,38,0.3)" : "var(--invest-border)"}` }}>
                {totalPending} open
              </span>
            )}
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            Signals ranked by impact × urgency — work through the queue top to bottom
          </p>
        </div>

        {!loading && signals.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
              {decided}<span style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-muted)" }}>/{signals.length}</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>decided</div>
            <div style={{ width: "120px", height: "4px", borderRadius: "2px", backgroundColor: "var(--border)", marginTop: "6px", marginLeft: "auto" }}>
              <div style={{ height: "100%", width: `${signals.length > 0 ? (decided / signals.length) * 100 : 0}%`, borderRadius: "2px", backgroundColor: "var(--build)", transition: "width 0.5s" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "28px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "10px" }} />)}
          </div>
        ) : totalPending === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "16px", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "var(--build-bg)", border: "2px solid var(--build-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={32} style={{ color: "var(--build)" }} />
            </div>
            <div>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sans)" }}>All caught up!</p>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
                {decided} signal{decided !== 1 ? "s" : ""} decided · no pending items
              </p>
            </div>
          </div>
        ) : (
          <>
            {needsDecision.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--invest)", flexShrink: 0 }} />
                  <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>Ready to Decide</h2>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>— {needsDecision.length} signal{needsDecision.length !== 1 ? "s" : ""} analyzed, waiting for your call</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-light)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {needsDecision.map((s) => <DecideItem key={s.id} signal={s} onDecideDone={remove} />)}
                </div>
              </section>
            )}

            {needsAnalysis.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent)", flexShrink: 0 }} />
                  <h2 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>Needs Analysis</h2>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>— {needsAnalysis.length} signal{needsAnalysis.length !== 1 ? "s" : ""} waiting to be processed</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-light)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {needsAnalysis.map((s) => <AnalyzeItem key={s.id} signal={s} onAnalyzeDone={remove} />)}
                </div>
              </section>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "var(--accent-bg)", border: "1px solid rgba(72,128,255,0.2)" }}>
              <ArrowRight size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Work top to bottom — signals are ranked by impact × urgency. Decided signals automatically leave the queue.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
