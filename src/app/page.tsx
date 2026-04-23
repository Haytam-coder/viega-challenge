"use client";

import { useState, useEffect, useCallback } from "react";
import type { Signal } from "@/types";
import { SignalCard } from "@/components/dashboard/SignalCard";
import { SignalDetail } from "@/components/dashboard/SignalDetail";
import {
  ArrowUpDown,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

type SortKey = "newest" | "impact" | "relevance";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "impact", label: "Impact" },
  { key: "relevance", label: "Relevance" },
];

function sortSignals(signals: Signal[], key: SortKey): Signal[] {
  return [...signals].sort((a, b) => {
    if (key === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (key === "impact")
      return (b.decision?.impactScore ?? 0) - (a.decision?.impactScore ?? 0);
    if (key === "relevance")
      return (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
    return 0;
  });
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Signal | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningStep, setRunningStep] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    type: "competitor",
    title: "",
    description: "",
    source: "",
    rawContent: "",
    tags: "",
  });
  const [adding, setAdding] = useState(false);

  const fetchSignals = useCallback(async () => {
    const res = await fetch("/api/signals");
    const data: Signal[] = await res.json();
    setSignals(data);
    return data;
  }, []);

  const fetchSelected = useCallback(async (id: string) => {
    const res = await fetch(`/api/signals/${id}`);
    const data: Signal = await res.json();
    setSelected(data);
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let data = await fetchSignals();
      if (data.length === 0) {
        await fetch("/api/seed", { method: "POST" });
        data = await fetchSignals();
      }
      setLoading(false);
      if (data.length > 0) setSelectedId(data[0].id);
    })();
  }, [fetchSignals]);

  useEffect(() => {
    if (selectedId) fetchSelected(selectedId);
    else setSelected(null);
  }, [selectedId, fetchSelected]);

  const runPipeline = useCallback(
    async (signalId: string, feedbackCtx?: string) => {
      setIsRunning(true);
      try {
        setRunningStep("Analyzing signal…");
        await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId }),
        });
        setRunningStep("Generating decision…");
        await fetch("/api/decide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId, userFeedbackContext: feedbackCtx }),
        });
        setRunningStep("Refreshing…");
        await fetchSelected(signalId);
        await fetchSignals();
      } finally {
        setIsRunning(false);
        setRunningStep("");
      }
    },
    [fetchSelected, fetchSignals]
  );

  const handleFeedback = useCallback(
    async (action: string, importance: number, reanalyze: boolean) => {
      if (!selectedId) return;
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: selectedId, action, importance }),
      });
      if (reanalyze) {
        await runPipeline(
          selectedId,
          `User marked as "${action}" with importance ${importance}/5. Adjust confidence accordingly.`
        );
      }
    },
    [selectedId, runPipeline]
  );

  const handleAddSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          tags: addForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const newSignal: Signal = await res.json();
      setSignals((prev) => [newSignal, ...prev]);
      setSelectedId(newSignal.id);
      setShowAddForm(false);
      setAddForm({
        type: "competitor",
        title: "",
        description: "",
        source: "",
        rawContent: "",
        tags: "",
      });
      await runPipeline(newSignal.id);
    } finally {
      setAdding(false);
    }
  };

  // Computed stats
  const sorted = sortSignals(signals, sortKey);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg)" }}>
      {/* Page header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Market Intelligence Dashboard
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Monitor signals · Detect opportunities · Act with confidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSignals()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ backgroundColor: "var(--viega-yellow)", color: "#000" }}
          >
            <Plus size={13} />
            Add Signal
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Signal List */}
        <div
          className="flex flex-col shrink-0"
          style={{
            width: "340px",
            borderRight: "1px solid var(--border-light)",
          }}
        >
          {/* List header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Signals
            </span>
            <div className="flex items-center gap-1">
              <ArrowUpDown size={11} style={{ color: "var(--text-muted)" }} />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-[11px] rounded px-1 py-0.5 appearance-none cursor-pointer"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text-secondary)",
                  border: "none",
                  outline: "none",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} style={{ backgroundColor: "#161616" }}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Signal items */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div
                className="p-6 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <p className="text-sm">No signals yet</p>
              </div>
            ) : (
              sorted.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  selected={selectedId === signal.id}
                  onClick={() => setSelectedId(signal.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* CENTER: Signal Detail */}
        <div
          className="flex-1 min-w-0"
          style={{ borderRight: "1px solid var(--border-light)" }}
        >
          {!selected && !loading ? (
            <div
              className="flex items-center justify-center h-full"
              style={{ color: "var(--text-muted)" }}
            >
              <div className="text-center">
                <div className="text-3xl mb-3 opacity-20">🧭</div>
                <p className="text-sm">Select a signal to view details</p>
              </div>
            </div>
          ) : selected ? (
            <SignalDetail
              signal={selected}
              isRunning={isRunning}
              runningStep={runningStep}
              onAnalyze={() => runPipeline(selected.id)}
              onFeedback={handleFeedback}
            />
          ) : null}
        </div>

      </div>

      {/* Add Signal Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Add New Signal
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSignal} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-[10px] font-semibold tracking-wider uppercase mb-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Type
                  </label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-xs"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="competitor">Competitor</option>
                    <option value="market">Market</option>
                    <option value="patent">Patent</option>
                  </select>
                </div>
                <div>
                  <label
                    className="text-[10px] font-semibold tracking-wider uppercase mb-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Source
                  </label>
                  <input
                    required
                    placeholder="e.g. Press Release"
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-xs"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
              </div>
              {[
                { key: "title", placeholder: "Signal title", label: "Title" },
                { key: "description", placeholder: "Short description", label: "Description" },
              ].map(({ key, placeholder, label }) => (
                <div key={key}>
                  <label
                    className="text-[10px] font-semibold tracking-wider uppercase mb-1 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </label>
                  <input
                    required
                    placeholder={placeholder}
                    value={addForm[key as keyof typeof addForm]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-xs"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
              ))}
              <div>
                <label
                  className="text-[10px] font-semibold tracking-wider uppercase mb-1 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  Full Content
                </label>
                <textarea
                  required
                  placeholder="Paste the full signal content, article, or raw data…"
                  value={addForm.rawContent}
                  onChange={(e) => setAddForm({ ...addForm, rawContent: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg px-3 py-2 text-xs resize-none"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: adding ? "var(--border)" : "var(--viega-yellow)",
                    color: adding ? "var(--text-muted)" : "#000",
                  }}
                >
                  {adding ? "Adding…" : "Add & Analyze"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
