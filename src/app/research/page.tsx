"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Search,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Zap,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import type { SignalDraft, SignalType } from "@/types";
import { RESEARCH_TOPICS, TOPICS_BY_PRIORITY } from "@/lib/research/topics";

const TYPE_META = {
  competitor: { label: "Competitor", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "Market",     color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "Patent",     color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

interface CardState { saving: boolean; saved: boolean; error: string | null; }
interface AutoTopicState { label: string; status: "pending" | "running" | "done" | "error"; saved: number; skipped: number; error: string | null; }

function hostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function CandidateCard({ candidate, state, onSave }: { candidate: SignalDraft; state: CardState; onSave: () => void; }) {
  const typeMeta = TYPE_META[candidate.type];
  return (
    <div
      className="fade-up"
      style={{
        padding: "24px 28px",
        borderRadius: "14px",
        backgroundColor: "var(--card)",
        boxShadow: "var(--card-shadow)",
        border: "0.3px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "3px 9px",
              borderRadius: "4px",
              color: typeMeta.color,
              backgroundColor: typeMeta.bg,
              border: `1px solid ${typeMeta.border}`,
              fontFamily: "var(--font-mono)",
            }}
          >
            {typeMeta.label}
          </span>
          <a
            href={candidate.source}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "var(--text-muted)",
              textDecoration: "none",
              opacity: 0.7,
            }}
          >
            <ExternalLink size={11} />
            {hostname(candidate.source)}
          </a>
        </div>

        {state.saved ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--build)" }}>
              <CheckCircle size={14} /> Saved
            </div>
            <Link
              href="/"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--accent-bg)",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                textDecoration: "none",
              }}
            >
              View Dashboard →
            </Link>
          </div>
        ) : (
          <button
            onClick={onSave}
            disabled={state.saving}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: state.saving ? "var(--border)" : "var(--accent)",
              color: state.saving ? "var(--text-muted)" : "#fff",
              border: "none",
              cursor: state.saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            {state.saving ? (
              <><div className="spinner" style={{ width: 11, height: 11, borderWidth: 1.5, borderTopColor: "#fff" }} /> Analyzing…</>
            ) : (
              <><Zap size={13} /> Save &amp; Analyze</>
            )}
          </button>
        )}
      </div>

      <h3 style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.4, color: "var(--text)", marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
        {candidate.title}
      </h3>
      <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: "12px" }}>
        {candidate.description}
      </p>
      <p
        style={{
          fontSize: "12px",
          lineHeight: 1.6,
          padding: "10px 14px",
          borderRadius: "8px",
          backgroundColor: "var(--surface)",
          color: "var(--text-muted)",
          border: "0.6px solid var(--border-light)",
          marginBottom: candidate.tags.length > 0 ? "12px" : 0,
        }}
      >
        {candidate.rawContent.length > 220 ? candidate.rawContent.slice(0, 220) + "…" : candidate.rawContent}
      </p>

      {candidate.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {candidate.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "11px",
                padding: "2px 10px",
                borderRadius: "20px",
                backgroundColor: "var(--border-light)",
                color: "var(--text-muted)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {state.error && (
        <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--competitor)" }}>{state.error}</p>
      )}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ padding: "24px 28px", borderRadius: "14px", backgroundColor: "var(--card)", boxShadow: "var(--card-shadow)", display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <div className="skeleton" style={{ height: "22px", width: "80px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "22px", width: "120px", borderRadius: "4px" }} />
          </div>
          <div className="skeleton" style={{ height: "20px", width: "80%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ height: "14px", width: "100%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ height: "14px", width: "75%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ height: "60px", width: "100%", borderRadius: "8px" }} />
        </div>
      ))}
    </div>
  );
}

function TopicProgressRow({ state }: { state: AutoTopicState }) {
  const statusColor =
    state.status === "done" ? "var(--build)"
    : state.status === "error" ? "var(--competitor)"
    : state.status === "running" ? "var(--accent)"
    : "var(--text-muted)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "0.4px solid var(--border-light)" }}>
      <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: statusColor, flexShrink: 0 }} />
      <span style={{ fontSize: "13px", flex: 1, color: "var(--text-secondary)" }}>{state.label}</span>
      <span style={{ fontSize: "12px", color: statusColor }}>
        {state.status === "running" && "Searching…"}
        {state.status === "done" && `${state.saved} saved · ${state.skipped} found`}
        {state.status === "error" && (state.error ?? "Error")}
        {state.status === "pending" && "—"}
      </span>
    </div>
  );
}

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SignalType>("competitor");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<SignalDraft[]>([]);
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  const [autoRunning, setAutoRunning] = useState(false);
  const [topicStates, setTopicStates] = useState<AutoTopicState[]>([]);
  const [autoSummary, setAutoSummary] = useState<{ saved: number; skipped: number; failed: number; } | null>(null);
  const [showAutoPanel, setShowAutoPanel] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<"all" | "1" | "2" | "3">("all");

  const handleSearch = async () => {
    if (query.trim().length < 3 || searching) return;
    setSearching(true);
    setSearchError(null);
    setCandidates([]);
    setCardStates([]);
    try {
      const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: query.trim(), type }) });
      const data = await res.json();
      if (!res.ok) { setSearchError(data.error ?? "Search failed. Try again."); return; }
      const found: SignalDraft[] = data.candidates ?? [];
      setCandidates(found);
      setCardStates(found.map(() => ({ saving: false, saved: false, error: null })));
      if (found.length === 0) setSearchError("No signals found. Try a different query or signal type.");
    } catch { setSearchError("Network error. Check your connection and try again."); }
    finally { setSearching(false); }
  };

  const setCardState = (idx: number, patch: Partial<CardState>) =>
    setCardStates((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const saveAndAnalyze = async (candidate: SignalDraft, idx: number): Promise<boolean> => {
    setCardState(idx, { saving: true, error: null });
    try {
      const createRes = await fetch("/api/signals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(candidate) });
      if (!createRes.ok) throw new Error("Failed to create signal");
      const signal = await createRes.json();
      const analyzeRes = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: signal.id }) });
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      await fetch("/api/decide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: signal.id }) });
      setCardState(idx, { saving: false, saved: true });
      return true;
    } catch (err) {
      setCardState(idx, { saving: false, error: err instanceof Error ? err.message : "Unknown error" });
      return false;
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    for (let i = 0; i < candidates.length; i++) {
      if (cardStates[i]?.saved) continue;
      await saveAndAnalyze(candidates[i], i);
    }
    setSavingAll(false);
  };

  const handleAutoResearch = async () => {
    if (autoRunning) return;
    setAutoRunning(true);
    setAutoSummary(null);
    const topics = selectedPriority === "all" ? RESEARCH_TOPICS : RESEARCH_TOPICS.filter((t) => String(t.priority) === selectedPriority);
    setTopicStates(topics.map((t) => ({ label: t.label, status: "running", saved: 0, skipped: 0, error: null })));

    const searchResults = await Promise.allSettled(
      topics.map(async (topic, i) => {
        const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: topic.query, type: topic.type }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        const candidates: SignalDraft[] = data.candidates ?? [];
        setTopicStates((prev) => prev.map((s, j) => j === i ? { ...s, status: "done", saved: 0, skipped: candidates.length, error: null } : s));
        return { candidates, topicIdx: i };
      })
    );

    type TaggedCandidate = { candidate: SignalDraft; topicIdx: number };
    const allCandidates: TaggedCandidate[] = [];
    let totalFailed = 0;
    for (const [i, result] of searchResults.entries()) {
      if (result.status === "fulfilled") {
        for (const c of result.value.candidates) allCandidates.push({ candidate: c, topicIdx: i });
      } else {
        totalFailed++;
        setTopicStates((prev) => prev.map((s, j) => j === i ? { ...s, status: "error", error: result.reason?.message ?? "Error" } : s));
      }
    }

    let totalSaved = 0;
    let totalSkipped = 0;
    const savedPerTopic: Record<number, number> = {};
    const skippedPerTopic: Record<number, number> = {};

    const runPipeline = async ({ candidate, topicIdx }: TaggedCandidate) => {
      const createRes = await fetch("/api/signals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(candidate) });
      if (!createRes.ok) { skippedPerTopic[topicIdx] = (skippedPerTopic[topicIdx] ?? 0) + 1; return; }
      const signal = await createRes.json();
      const analyzeRes = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: signal.id }) });
      if (!analyzeRes.ok) { skippedPerTopic[topicIdx] = (skippedPerTopic[topicIdx] ?? 0) + 1; return; }
      await fetch("/api/decide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signalId: signal.id }) });
      savedPerTopic[topicIdx] = (savedPerTopic[topicIdx] ?? 0) + 1;
    };

    const BATCH = 3;
    for (let i = 0; i < allCandidates.length; i += BATCH) {
      await Promise.allSettled(allCandidates.slice(i, i + BATCH).map(runPipeline));
    }
    for (const idx of Object.keys(savedPerTopic)) totalSaved += savedPerTopic[Number(idx)];
    for (const idx of Object.keys(skippedPerTopic)) totalSkipped += skippedPerTopic[Number(idx)];
    setTopicStates((prev) => prev.map((s, j) => ({ ...s, saved: savedPerTopic[j] ?? 0, skipped: skippedPerTopic[j] ?? (s.status === "done" ? s.skipped : 0) })));
    setAutoSummary({ saved: totalSaved, skipped: totalSkipped, failed: totalFailed });
    setAutoRunning(false);
  };

  const unsavedCount = cardStates.filter((s) => !s.saved).length;
  const counts = { all: RESEARCH_TOPICS.length, "1": TOPICS_BY_PRIORITY.competitors.length, "2": TOPICS_BY_PRIORITY.patents.length, "3": TOPICS_BY_PRIORITY.market.length };

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
            Web Research
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            Live search via Gemini + Google — manual or automatic across {RESEARCH_TOPICS.length} tracked topics
          </p>
        </div>
        <button
          onClick={() => setShowAutoPanel((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: showAutoPanel ? "var(--accent)" : "var(--accent-bg)",
            color: showAutoPanel ? "#fff" : "var(--accent)",
            border: "1px solid var(--accent)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "all 0.15s",
          }}
        >
          <Zap size={14} />
          Auto-Research
          <ChevronDown size={13} style={{ transform: showAutoPanel ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* ── Auto-research panel ──────────────────────────────── */}
      {showAutoPanel && (
        <div
          style={{
            flexShrink: 0,
            padding: "20px 28px",
            borderBottom: "0.6px solid var(--border)",
            backgroundColor: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>Automatic Research</p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Searches {counts.all} predefined topics — competitors first, then patents, then market
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as "all" | "1" | "2" | "3")}
                  disabled={autoRunning}
                  style={{
                    appearance: "none",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    backgroundColor: "var(--card)",
                    border: "0.6px solid var(--border)",
                    color: "var(--text)",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <option value="all">All ({counts.all} topics)</option>
                  <option value="1">Competitors only ({counts["1"]})</option>
                  <option value="2">Patents only ({counts["2"]})</option>
                  <option value="3">Market only ({counts["3"]})</option>
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
              </div>
              <button
                onClick={handleAutoResearch}
                disabled={autoRunning}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  backgroundColor: autoRunning ? "var(--border)" : "var(--accent)",
                  color: autoRunning ? "var(--text-muted)" : "#fff",
                  border: "none",
                  cursor: autoRunning ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {autoRunning ? (
                  <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: "#fff" }} /> Running…</>
                ) : (
                  <><RefreshCw size={13} /> Start Now</>
                )}
              </button>
            </div>
          </div>

          {topicStates.length > 0 && (
            <div style={{ borderRadius: "10px", padding: "16px 20px", backgroundColor: "var(--card)", border: "0.6px solid var(--border)", maxHeight: "240px", overflowY: "auto" }}>
              {topicStates.map((s, i) => <TopicProgressRow key={i} state={s} />)}
              {autoSummary && (
                <div style={{ display: "flex", alignItems: "center", gap: "20px", paddingTop: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--build)" }}>✓ {autoSummary.saved} signals saved</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{autoSummary.skipped} skipped</span>
                  {autoSummary.failed > 0 && <span style={{ fontSize: "12px", color: "var(--competitor)" }}>{autoSummary.failed} failed</span>}
                  <Link href="/" style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
                    Open Dashboard →
                  </Link>
                </div>
              )}
            </div>
          )}

          {topicStates.length === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { label: "Competitors", items: TOPICS_BY_PRIORITY.competitors, color: "var(--competitor)" },
                { label: "Patents",     items: TOPICS_BY_PRIORITY.patents,     color: "var(--patent)" },
                { label: "Market",      items: TOPICS_BY_PRIORITY.market,      color: "var(--market)" },
              ].map(({ label, items, color }) => (
                <div key={label} style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "var(--card)", border: "0.6px solid var(--border)" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color, marginBottom: "8px", fontFamily: "var(--font-mono)" }}>{label}</p>
                  {items.map((t) => (
                    <p key={t.query} style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.8 }}>· {t.label}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Manual search bar ────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 28px",
          borderBottom: "0.6px solid var(--border-light)",
          backgroundColor: "var(--card)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SignalType)}
              style={{
                appearance: "none",
                padding: "10px 32px 10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: "var(--surface)",
                border: "0.6px solid var(--border)",
                color: "var(--text)",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              <option value="competitor">Competitor</option>
              <option value="market">Market</option>
              <option value="patent">Patent</option>
            </select>
            <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search, e.g. »Geberit Pressfit IoT 2025«…"
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "8px",
                fontSize: "13px",
                backgroundColor: "var(--surface)",
                border: "0.6px solid var(--border)",
                color: "var(--text)",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={searching || query.trim().length < 3}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              backgroundColor: searching || query.trim().length < 3 ? "var(--border)" : "var(--accent)",
              color: searching || query.trim().length < 3 ? "var(--text-muted)" : "#fff",
              border: "none",
              cursor: searching || query.trim().length < 3 ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            {searching ? (
              <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: "#fff" }} /> Searching…</>
            ) : (
              <><Search size={14} /> Search</>
            )}
          </button>
        </div>

        {candidates.length > 0 && !searching && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {candidates.length} signal{candidates.length !== 1 ? "s" : ""} found
            </span>
            {unsavedCount > 0 && (
              <button
                onClick={handleSaveAll}
                disabled={savingAll}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "6px 16px",
                  borderRadius: "8px",
                  backgroundColor: savingAll ? "var(--border)" : "var(--accent-bg)",
                  color: savingAll ? "var(--text-muted)" : "var(--accent)",
                  border: "1px solid var(--accent)",
                  cursor: savingAll ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {savingAll ? (
                  <><div className="spinner" style={{ width: 11, height: 11, borderWidth: 1.5 }} /> Analyzing all…</>
                ) : (
                  <><Zap size={13} /> Save All & Analyze ({unsavedCount})</>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {searching ? (
          <SkeletonCards />
        ) : searchError ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              height: "180px",
              borderRadius: "14px",
              backgroundColor: "var(--card)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <AlertCircle size={24} style={{ color: "var(--competitor)" }} />
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>{searchError}</p>
          </div>
        ) : candidates.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "860px" }}>
            {candidates.map((c, i) => (
              <CandidateCard
                key={i}
                candidate={c}
                state={cardStates[i] ?? { saving: false, saved: false, error: null }}
                onSave={() => saveAndAnalyze(c, i)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              height: "240px",
              borderRadius: "14px",
              backgroundColor: "var(--card)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <Globe size={32} style={{ color: "var(--text-muted)" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)" }}>Start a manual search or run Auto-Research</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", maxWidth: "320px", lineHeight: 1.6 }}>
              Gemini searches Google live and extracts relevant signals for Viega's pipeline — with real-time sources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
