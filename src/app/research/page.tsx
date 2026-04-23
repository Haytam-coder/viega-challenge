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

// ─── Types ──────────────────────────────────────────────────────────────────

const TYPE_META = {
  competitor: {
    label: "Competitor",
    color: "var(--competitor)",
    bg: "var(--competitor-bg)",
    border: "var(--competitor-border)",
  },
  market: {
    label: "Market",
    color: "var(--market)",
    bg: "var(--market-bg)",
    border: "var(--market-border)",
  },
  patent: {
    label: "Patent",
    color: "var(--patent)",
    bg: "var(--patent-bg)",
    border: "var(--patent-border)",
  },
};

interface CardState {
  saving: boolean;
  saved: boolean;
  error: string | null;
}

interface AutoTopicState {
  label: string;
  status: "pending" | "running" | "done" | "error";
  saved: number;
  skipped: number;
  error: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  state,
  onSave,
}: {
  candidate: SignalDraft;
  state: CardState;
  onSave: () => void;
}) {
  const typeMeta = TYPE_META[candidate.type];
  return (
    <div
      className="p-5 rounded-xl fade-up"
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
            style={{
              color: typeMeta.color,
              backgroundColor: typeMeta.bg,
              border: `1px solid ${typeMeta.border}`,
            }}
          >
            {typeMeta.label}
          </span>
          <a
            href={candidate.source}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            <ExternalLink size={10} />
            {hostname(candidate.source)}
          </a>
        </div>

        {state.saved ? (
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--build)" }}
            >
              <CheckCircle size={13} />
              Saved
            </div>
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: "var(--viega-yellow-dim)",
                color: "var(--viega-yellow)",
                border: "1px solid var(--viega-yellow-border)",
              }}
            >
              View Dashboard →
            </Link>
          </div>
        ) : (
          <button
            onClick={onSave}
            disabled={state.saving}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: state.saving ? "var(--border)" : "var(--viega-yellow)",
              color: state.saving ? "var(--text-muted)" : "#000",
              cursor: state.saving ? "not-allowed" : "pointer",
            }}
          >
            {state.saving ? (
              <>
                <div
                  className="spinner"
                  style={{ width: 10, height: 10, borderWidth: 1.5 }}
                />
                Analyzing…
              </>
            ) : (
              <>⚡ Save &amp; Analyze</>
            )}
          </button>
        )}
      </div>

      <h3
        className="text-sm font-semibold leading-snug mb-2"
        style={{ color: "var(--text)" }}
      >
        {candidate.title}
      </h3>

      <p
        className="text-xs leading-relaxed mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        {candidate.description}
      </p>

      <p
        className="text-[11px] leading-relaxed mb-3 px-3 py-2 rounded-lg"
        style={{
          backgroundColor: "var(--surface)",
          color: "var(--text-muted)",
          border: "1px solid var(--border-light)",
        }}
      >
        {candidate.rawContent.length > 220
          ? candidate.rawContent.slice(0, 220) + "…"
          : candidate.rawContent}
      </p>

      {candidate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {state.error && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--competitor)" }}>
          {state.error}
        </p>
      )}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 rounded-xl space-y-3"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex gap-2">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
          </div>
          <div className="skeleton h-5 w-4/5 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-16 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

function TopicProgressRow({ state }: { state: AutoTopicState }) {
  const statusColor =
    state.status === "done"
      ? "var(--build)"
      : state.status === "error"
      ? "var(--competitor)"
      : state.status === "running"
      ? "var(--viega-yellow)"
      : "var(--text-muted)";

  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
      <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
        {state.label}
      </span>
      <span className="text-[10px]" style={{ color: statusColor }}>
        {state.status === "running" && "Searching…"}
        {state.status === "done" &&
          `${state.saved} saved · ${state.skipped} skipped`}
        {state.status === "error" && (state.error ?? "Error")}
        {state.status === "pending" && "—"}
      </span>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function ResearchPage() {
  // Manual search
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SignalType>("competitor");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<SignalDraft[]>([]);
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  // Auto-research
  const [autoRunning, setAutoRunning] = useState(false);
  const [topicStates, setTopicStates] = useState<AutoTopicState[]>([]);
  const [autoSummary, setAutoSummary] = useState<{
    saved: number;
    skipped: number;
    failed: number;
  } | null>(null);
  const [showAutoPanel, setShowAutoPanel] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<"all" | "1" | "2" | "3">("all");

  // ── Manual search handlers ──────────────────────────────────────────────────

  const handleSearch = async () => {
    if (query.trim().length < 3 || searching) return;
    setSearching(true);
    setSearchError(null);
    setCandidates([]);
    setCardStates([]);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), type }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error ?? "Search failed. Try again.");
        return;
      }

      const found: SignalDraft[] = data.candidates ?? [];
      setCandidates(found);
      setCardStates(found.map(() => ({ saving: false, saved: false, error: null })));
      if (found.length === 0)
        setSearchError("No signals found. Try a different query or signal type.");
    } catch {
      setSearchError("Network error. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  };

  const setCardState = (idx: number, patch: Partial<CardState>) =>
    setCardStates((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const saveAndAnalyze = async (candidate: SignalDraft, idx: number): Promise<boolean> => {
    setCardState(idx, { saving: true, error: null });
    try {
      const createRes = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidate),
      });
      if (!createRes.ok) throw new Error("Failed to create signal");
      const signal = await createRes.json();

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });
      if (!analyzeRes.ok) throw new Error("Analysis failed");

      await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });

      setCardState(idx, { saving: false, saved: true });
      return true;
    } catch (err) {
      setCardState(idx, {
        saving: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
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

  // ── Auto-research handlers ──────────────────────────────────────────────────

  const handleAutoResearch = async () => {
    if (autoRunning) return;
    setAutoRunning(true);
    setAutoSummary(null);

    const topics =
      selectedPriority === "all"
        ? RESEARCH_TOPICS
        : RESEARCH_TOPICS.filter((t) => String(t.priority) === selectedPriority);

    // Initialise all topics as "running" immediately (parallel phase)
    setTopicStates(
      topics.map((t) => ({ label: t.label, status: "running", saved: 0, skipped: 0, error: null }))
    );

    // ── Phase 1: all searches in parallel ────────────────────────────────────
    const searchResults = await Promise.allSettled(
      topics.map(async (topic, i) => {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: topic.query, type: topic.type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        const candidates: SignalDraft[] = data.candidates ?? [];

        // Mark topic as "done" (search phase) with candidate count as preview
        setTopicStates((prev) =>
          prev.map((s, j) =>
            j === i ? { ...s, status: "done", saved: 0, skipped: candidates.length, error: null } : s
          )
        );
        return { candidates, topicIdx: i };
      })
    );

    // Flatten all candidates, track which topicIdx they belong to
    type TaggedCandidate = { candidate: SignalDraft; topicIdx: number };
    const allCandidates: TaggedCandidate[] = [];
    let totalFailed = 0;

    for (const [i, result] of searchResults.entries()) {
      if (result.status === "fulfilled") {
        for (const c of result.value.candidates) {
          allCandidates.push({ candidate: c, topicIdx: i });
        }
      } else {
        totalFailed++;
        setTopicStates((prev) =>
          prev.map((s, j) =>
            j === i
              ? { ...s, status: "error", error: result.reason?.message ?? "Error" }
              : s
          )
        );
      }
    }

    // ── Phase 2: save + analyze + decide in batches of 3 ────────────────────
    let totalSaved = 0;
    let totalSkipped = 0;
    const savedPerTopic: Record<number, number> = {};
    const skippedPerTopic: Record<number, number> = {};

    const runPipeline = async ({ candidate, topicIdx }: TaggedCandidate) => {
      const createRes = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidate),
      });
      if (!createRes.ok) {
        skippedPerTopic[topicIdx] = (skippedPerTopic[topicIdx] ?? 0) + 1;
        return;
      }
      const signal = await createRes.json();

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });
      if (!analyzeRes.ok) {
        skippedPerTopic[topicIdx] = (skippedPerTopic[topicIdx] ?? 0) + 1;
        return;
      }

      await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id }),
      });

      savedPerTopic[topicIdx] = (savedPerTopic[topicIdx] ?? 0) + 1;
    };

    // Batch executor with concurrency = 3
    const BATCH = 3;
    for (let i = 0; i < allCandidates.length; i += BATCH) {
      await Promise.allSettled(allCandidates.slice(i, i + BATCH).map(runPipeline));
    }

    // Aggregate counts
    for (const idx of Object.keys(savedPerTopic)) {
      totalSaved += savedPerTopic[Number(idx)];
    }
    for (const idx of Object.keys(skippedPerTopic)) {
      totalSkipped += skippedPerTopic[Number(idx)];
    }

    // Update final per-topic saved/skipped counts in UI
    setTopicStates((prev) =>
      prev.map((s, j) => ({
        ...s,
        saved: savedPerTopic[j] ?? 0,
        skipped: skippedPerTopic[j] ?? (s.status === "done" ? s.skipped : 0),
      }))
    );

    setAutoSummary({ saved: totalSaved, skipped: totalSkipped, failed: totalFailed });
    setAutoRunning(false);
  };

  const unsavedCount = cardStates.filter((s) => !s.saved).length;

  // ── Topic counts for labels ─────────────────────────────────────────────────
  const counts = {
    all: RESEARCH_TOPICS.length,
    "1": TOPICS_BY_PRIORITY.competitors.length,
    "2": TOPICS_BY_PRIORITY.patents.length,
    "3": TOPICS_BY_PRIORITY.market.length,
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="shrink-0 px-8 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={18} style={{ color: "var(--viega-yellow)" }} />
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                Web Research
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Live search via Gemini + Google — manual or automatic across{" "}
                {RESEARCH_TOPICS.length} tracked topics
              </p>
            </div>
          </div>

          {/* Auto-research toggle */}
          <button
            onClick={() => setShowAutoPanel((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: showAutoPanel
                ? "var(--viega-yellow)"
                : "var(--viega-yellow-dim)",
              color: showAutoPanel ? "#000" : "var(--viega-yellow)",
              border: "1px solid var(--viega-yellow-border)",
            }}
          >
            <Zap size={13} />
            Auto-Research
            <ChevronDown
              size={12}
              style={{
                transform: showAutoPanel ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      {/* Auto-research panel */}
      {showAutoPanel && (
        <div
          className="shrink-0 px-8 py-5 space-y-4"
          style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>
                Automatische Suche
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Durchsucht {counts.all} vordefinierte Themen — Konkurrenten zuerst, dann Patente, dann Markt
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Priority filter */}
              <select
                value={selectedPriority}
                onChange={(e) =>
                  setSelectedPriority(e.target.value as "all" | "1" | "2" | "3")
                }
                disabled={autoRunning}
                className="appearance-none px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  outline: "none",
                }}
              >
                <option value="all">Alle ({counts.all} Themen)</option>
                <option value="1">Nur Konkurrenten ({counts["1"]})</option>
                <option value="2">Nur Patente ({counts["2"]})</option>
                <option value="3">Nur Markt ({counts["3"]})</option>
              </select>

              <button
                onClick={handleAutoResearch}
                disabled={autoRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: autoRunning ? "var(--border)" : "var(--viega-yellow)",
                  color: autoRunning ? "var(--text-muted)" : "#000",
                  cursor: autoRunning ? "not-allowed" : "pointer",
                }}
              >
                {autoRunning ? (
                  <>
                    <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                    Läuft…
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    Jetzt starten
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress list */}
          {topicStates.length > 0 && (
            <div
              className="rounded-xl p-4 max-h-64 overflow-y-auto"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              {topicStates.map((s, i) => (
                <TopicProgressRow key={i} state={s} />
              ))}

              {/* Summary */}
              {autoSummary && (
                <div className="pt-3 mt-1 flex items-center gap-4 text-xs">
                  <span style={{ color: "var(--build)" }}>
                    ✓ {autoSummary.saved} neue Signale gespeichert
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {autoSummary.skipped} übersprungen
                  </span>
                  {autoSummary.failed > 0 && (
                    <span style={{ color: "var(--competitor)" }}>
                      {autoSummary.failed} fehlgeschlagen
                    </span>
                  )}
                  <Link
                    href="/"
                    className="ml-auto text-xs font-semibold"
                    style={{ color: "var(--viega-yellow)" }}
                  >
                    Dashboard öffnen →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Topic overview */}
          {topicStates.length === 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Konkurrenten",
                  items: TOPICS_BY_PRIORITY.competitors,
                  color: "var(--competitor)",
                },
                {
                  label: "Patente",
                  items: TOPICS_BY_PRIORITY.patents,
                  color: "var(--patent)",
                },
                {
                  label: "Markt & Regulierung",
                  items: TOPICS_BY_PRIORITY.market,
                  color: "var(--market)",
                },
              ].map(({ label, items, color }) => (
                <div
                  key={label}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <p
                    className="text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color }}
                  >
                    {label}
                  </p>
                  <div className="space-y-1">
                    {items.map((t) => (
                      <p key={t.query} className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        · {t.label}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual search bar */}
      <div
        className="shrink-0 px-8 py-4"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <div className="flex gap-3 mb-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SignalType)}
            className="appearance-none px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              outline: "none",
            }}
          >
            <option value="competitor">Competitor</option>
            <option value="market">Market</option>
            <option value="patent">Patent</option>
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Eigene Suche, z.B. »Geberit Pressfit IoT 2025«…"
            className="flex-1 px-4 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              outline: "none",
            }}
          />

          <button
            onClick={handleSearch}
            disabled={searching || query.trim().length < 3}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor:
                searching || query.trim().length < 3
                  ? "var(--border)"
                  : "var(--viega-yellow)",
              color:
                searching || query.trim().length < 3 ? "var(--text-muted)" : "#000",
              cursor:
                searching || query.trim().length < 3 ? "not-allowed" : "pointer",
            }}
          >
            {searching ? (
              <>
                <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                Searching…
              </>
            ) : (
              <>
                <Search size={13} />
                Search
              </>
            )}
          </button>
        </div>

        {candidates.length > 0 && !searching && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {candidates.length} signal{candidates.length !== 1 ? "s" : ""} found
            </span>
            {unsavedCount > 0 && (
              <button
                onClick={handleSaveAll}
                disabled={savingAll}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  backgroundColor: savingAll
                    ? "var(--border)"
                    : "var(--viega-yellow-dim)",
                  color: savingAll ? "var(--text-muted)" : "var(--viega-yellow)",
                  border: "1px solid var(--viega-yellow-border)",
                  cursor: savingAll ? "not-allowed" : "pointer",
                }}
              >
                {savingAll ? (
                  <>
                    <div
                      className="spinner"
                      style={{ width: 10, height: 10, borderWidth: 1.5 }}
                    />
                    Analyzing all…
                  </>
                ) : (
                  `⚡ Save All & Analyze (${unsavedCount})`
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-8">
        {searching ? (
          <SkeletonCards />
        ) : searchError ? (
          <div
            className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <AlertCircle size={24} style={{ color: "var(--competitor)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {searchError}
            </p>
          </div>
        ) : candidates.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {candidates.map((c, i) => (
              <CandidateCard
                key={i}
                candidate={c}
                state={
                  cardStates[i] ?? { saving: false, saved: false, error: null }
                }
                onSave={() => saveAndAnalyze(c, i)}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3 h-64 rounded-2xl"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <Globe size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Manuelle Suche oder Auto-Research starten
            </p>
            <p
              className="text-xs text-center max-w-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Gemini durchsucht Google live und extrahiert relevante Signale für
              Viegas Pipeline — mit Echtzeit-Quellen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
