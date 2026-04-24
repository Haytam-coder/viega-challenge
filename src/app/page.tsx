"use client";

import { useState, useEffect, useCallback } from "react";
import type { Signal } from "@/types";
import { SignalDetail } from "@/components/dashboard/SignalDetail";
import { Plus, RefreshCw, X, Filter, ChevronDown } from "lucide-react";

type SortKey = "newest" | "impact" | "relevance";
type TypeFilter = "all" | "competitor" | "market" | "patent";
type StatusFilter = "all" | "pending" | "analyzed" | "decided";

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const TYPE_META = {
  competitor: { label: "Competitor", short: "COMP", color: "var(--competitor)", bg: "var(--competitor-bg)", border: "var(--competitor-border)" },
  market:     { label: "Market",     short: "MKT",  color: "var(--market)",     bg: "var(--market-bg)",     border: "var(--market-border)" },
  patent:     { label: "Patent",     short: "PAT",  color: "var(--patent)",     bg: "var(--patent-bg)",     border: "var(--patent-border)" },
};

const STATUS_META = {
  pending:  { label: "Pending",   color: "#9ca3af", bg: "rgba(156,163,175,0.18)", },
  analyzed: { label: "Analyzed",  color: "#4880FF", bg: "rgba(72,128,255,0.15)", },
  decided_Build:  { label: "Build",  color: "#00B69B", bg: "rgba(0,182,155,0.15)", },
  decided_Invest: { label: "Invest", color: "#6226EF", bg: "rgba(98,38,239,0.15)", },
  decided_Ignore: { label: "Ignore", color: "#EF3826", bg: "rgba(239,56,38,0.15)", },
};

function getStatusMeta(signal: Signal) {
  if (signal.status === "decided" && signal.decision?.verdict) {
    const key = `decided_${signal.decision.verdict}` as keyof typeof STATUS_META;
    return STATUS_META[key] ?? STATUS_META.analyzed;
  }
  return STATUS_META[signal.status as keyof typeof STATUS_META] ?? STATUS_META.pending;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 14px",
        height: "36px",
        borderRadius: "8px",
        backgroundColor: "var(--card)",
        border: "0.6px solid var(--border)",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ width: "1px", height: "16px", backgroundColor: "var(--border)" }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text)",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          paddingRight: "18px",
          fontFamily: "var(--font-sans)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ backgroundColor: "var(--card)", color: "var(--text)" }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} style={{ color: "var(--text-muted)", position: "absolute", right: "10px", pointerEvents: "none" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Signal | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningStep, setRunningStep] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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
          tags: addForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const newSignal: Signal = await res.json();
      setSignals((prev) => [newSignal, ...prev]);
      setSelectedId(newSignal.id);
      setShowAddForm(false);
      setAddForm({ type: "competitor", title: "", description: "", source: "", rawContent: "", tags: "" });
      await runPipeline(newSignal.id);
    } finally {
      setAdding(false);
    }
  };

  const filtered = signals
    .filter((s) => typeFilter === "all" || s.type === typeFilter)
    .filter((s) => statusFilter === "all" || s.status === statusFilter);
  const sorted = sortSignals(filtered, sortKey);
  const hasFilters = typeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 28px 16px",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "var(--card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.3px",
              lineHeight: 1.1,
              fontFamily: "var(--font-sans)",
            }}
          >
            Signal Intelligence
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            Monitor market signals · detect opportunities · act with confidence
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => fetchSignals()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-secondary)",
              backgroundColor: "var(--surface)",
              border: "0.6px solid var(--border)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              backgroundColor: "var(--accent)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            <Plus size={14} />
            Add Signal
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* ── LEFT: Signal table ───────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            width: "480px",
            borderRight: "1px solid var(--border-light)",
            overflow: "hidden",
          }}
        >
          {/* Filter bar */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
              backgroundColor: "var(--card)",
            }}
          >
            <Filter size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <FilterSelect
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              options={[
                { value: "all", label: "All Types" },
                { value: "competitor", label: "Competitor" },
                { value: "market", label: "Market" },
                { value: "patent", label: "Patent" },
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "analyzed", label: "Analyzed" },
                { value: "decided", label: "Decided" },
              ]}
            />
            <FilterSelect
              label="Sort"
              value={sortKey}
              onChange={(v) => setSortKey(v as SortKey)}
              options={[
                { value: "newest", label: "Newest" },
                { value: "impact", label: "Impact" },
                { value: "relevance", label: "Relevance" },
              ]}
            />
            {hasFilters && (
              <button
                onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  color: "#EA0234",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                <RefreshCw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 70px",
              gap: "0",
              padding: "10px 16px",
              backgroundColor: "var(--surface)",
              borderBottom: "0.6px solid var(--border)",
              flexShrink: 0,
            }}
          >
            {["SIGNAL TITLE", "TYPE", "STATUS"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="skeleton" style={{ height: "14px", width: "70%" }} />
                    <div className="skeleton" style={{ height: "10px", width: "40%" }} />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No signals match the current filters
              </div>
            ) : (
              sorted.map((signal) => {
                const isSelected = selectedId === signal.id;
                const tMeta = TYPE_META[signal.type as keyof typeof TYPE_META] ?? TYPE_META.market;
                const sMeta = getStatusMeta(signal);
                return (
                  <button
                    key={signal.id}
                    onClick={() => setSelectedId(signal.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 90px 70px",
                      gap: "0",
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor: isSelected ? "var(--accent-bg)" : "transparent",
                      borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                      borderBottom: "0.4px solid rgba(151,151,151,0.3)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      alignItems: "center",
                    }}
                  >
                    {/* Title + meta */}
                    <div style={{ paddingRight: "8px", minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? "var(--text)" : "var(--text-secondary)",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {signal.title}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          marginTop: "3px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatDate(signal.createdAt)} · {signal.source?.slice(0, 30)}
                      </div>
                    </div>

                    {/* Type badge */}
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        color: tMeta.color,
                        backgroundColor: tMeta.bg,
                        border: `1px solid ${tMeta.border}`,
                        fontFamily: "var(--font-mono)",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tMeta.short}
                    </span>

                    {/* Status badge */}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        color: sMeta.color,
                        backgroundColor: sMeta.bg,
                        display: "inline-block",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {sMeta.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div
            style={{
              padding: "8px 16px",
              borderTop: "0.6px solid var(--border-light)",
              backgroundColor: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {sorted.length} signal{sorted.length !== 1 ? "s" : ""}
            </span>
            {hasFilters && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                filtered from {signals.length} total
              </span>
            )}
          </div>
        </div>

        {/* ── RIGHT: Signal Detail ─────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selected && !loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", opacity: 0.15, marginBottom: "12px" }}>🧭</div>
                <p style={{ fontSize: "14px" }}>Select a signal to view details</p>
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

      {/* ── Add Signal Modal ─────────────────────────────────────── */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-sans)" }}>
                Add New Signal
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ color: "var(--text-muted)", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSignal} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                    Type
                  </label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    style={{ width: "100%", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", backgroundColor: "var(--surface)", border: "0.6px solid var(--border)", color: "var(--text)", outline: "none", fontFamily: "var(--font-sans)" }}
                  >
                    <option value="competitor">Competitor</option>
                    <option value="market">Market</option>
                    <option value="patent">Patent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                    Source
                  </label>
                  <input
                    required
                    placeholder="e.g. Press Release"
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    style={{ width: "100%", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", backgroundColor: "var(--surface)", border: "0.6px solid var(--border)", color: "var(--text)", outline: "none", fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>
              {[
                { key: "title", placeholder: "Signal title", label: "Title" },
                { key: "description", placeholder: "Short description", label: "Description" },
              ].map(({ key, placeholder, label }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                    {label}
                  </label>
                  <input
                    required
                    placeholder={placeholder}
                    value={addForm[key as keyof typeof addForm]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    style={{ width: "100%", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", backgroundColor: "var(--surface)", border: "0.6px solid var(--border)", color: "var(--text)", outline: "none", fontFamily: "var(--font-sans)" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Full Content
                </label>
                <textarea
                  required
                  placeholder="Paste the full signal content, article, or raw data…"
                  value={addForm.rawContent}
                  onChange={(e) => setAddForm({ ...addForm, rawContent: e.target.value })}
                  rows={4}
                  style={{ width: "100%", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", backgroundColor: "var(--surface)", border: "0.6px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", fontFamily: "var(--font-sans)" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, backgroundColor: "var(--surface)", border: "0.6px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, backgroundColor: adding ? "var(--border)" : "var(--accent)", color: adding ? "var(--text-muted)" : "#fff", border: "none", cursor: adding ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)" }}
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
