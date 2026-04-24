"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  total: number;
}

export function DonutChart({ data, total }: DonutChartProps) {
  const cx = 72;
  const cy = 72;
  const r = 52;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * r;
  const gap = 3;

  let cumulativePct = 0;

  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const pct = d.value / total;
      const arcLength = Math.max(0, pct * circumference - gap);
      const offset = circumference * (0.25 - cumulativePct);
      cumulativePct += pct;
      return { ...d, pct, strokeDash: arcLength, offset };
    });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={144} height={144} viewBox="0 0 144 144">
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${s.strokeDash} ${circumference}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          ))}
          {/* Center */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="var(--text)"
            fontSize="22"
            fontWeight="700"
            fontFamily="inherit"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="inherit"
          >
            signals
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 flex-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span
                className="text-xs font-medium capitalize"
                style={{ color: "var(--text-secondary)" }}
              >
                {d.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                {d.value}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
