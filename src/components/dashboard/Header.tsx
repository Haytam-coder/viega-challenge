"use client";

interface HeaderProps {
  signalCount: number;
}

export function Header({ signalCount }: HeaderProps) {
  const now = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
      className="flex items-center justify-between px-6 py-3 shrink-0"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: "var(--viega-yellow)" }}
            className="w-6 h-6 rounded-sm flex items-center justify-center"
          >
            <span className="text-black font-black text-xs">V</span>
          </div>
          <span className="font-semibold tracking-wide text-sm">
            VIEGA COMPASS
          </span>
        </div>
        <div
          style={{ backgroundColor: "var(--border)" }}
          className="w-px h-4"
        />
        <span style={{ color: "var(--muted)" }} className="text-xs">
          Market Intelligence
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: "var(--build)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span style={{ color: "var(--build)" }} className="text-xs font-medium">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span style={{ color: "var(--muted)" }} className="text-xs">
            {signalCount} signal{signalCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ color: "var(--muted)" }} className="text-xs">
          {now}
        </div>
      </div>
    </header>
  );
}
