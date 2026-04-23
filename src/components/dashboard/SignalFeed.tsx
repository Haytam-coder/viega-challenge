"use client";

import { useState } from "react";
import type { Signal } from "@/types";
import { SignalCard } from "./SignalCard";

interface SignalFeedProps {
  signals: Signal[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddSignal: (data: {
    type: string;
    title: string;
    description: string;
    source: string;
    rawContent: string;
    tags: string[];
  }) => Promise<void>;
}

export function SignalFeed({
  signals,
  selectedId,
  onSelect,
  onAddSignal,
}: SignalFeedProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "competitor",
    title: "",
    description: "",
    source: "",
    rawContent: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddSignal({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setForm({
        type: "competitor",
        title: "",
        description: "",
        source: "",
        rawContent: "",
        tags: "",
      });
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ borderRight: "1px solid var(--border)" }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--muted)" }}
        >
          Signal Feed
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{
            backgroundColor: showForm ? "var(--viega-yellow)" : "var(--card)",
            color: showForm ? "#000" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Signal"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-2 shrink-0"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
        >
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded px-2 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <option value="competitor">Competitor</option>
            <option value="market">Market</option>
            <option value="patent">Patent</option>
          </select>
          <input
            required
            placeholder="Signal title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded px-2 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            required
            placeholder="Source (e.g. Press Release, Forum)"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full rounded px-2 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            required
            placeholder="Short description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded px-2 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <textarea
            required
            placeholder="Full signal content / raw data..."
            value={form.rawContent}
            onChange={(e) => setForm({ ...form, rawContent: e.target.value })}
            rows={4}
            className="w-full rounded px-2 py-1.5 text-xs resize-none"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <input
            placeholder="Tags (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full rounded px-2 py-1.5 text-xs"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-1.5 text-xs font-semibold rounded transition-opacity"
            style={{
              backgroundColor: "var(--viega-yellow)",
              color: "#000",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Adding…" : "Add Signal"}
          </button>
        </form>
      )}

      <div className="overflow-y-auto flex-1">
        {signals.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--muted)" }}>
            <p className="text-sm">No signals yet.</p>
            <p className="text-xs mt-1">Click "+ Add Signal" or seed demo data.</p>
          </div>
        ) : (
          signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              selected={selectedId === signal.id}
              onClick={() => onSelect(signal.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
