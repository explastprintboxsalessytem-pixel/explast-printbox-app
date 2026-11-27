'use client';

import React, { useState } from 'react';

export interface GroupedBarDataPoint {
  label: string; // e.g. "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"
  quotedValue: number; // in MUR
  signedRevenue: number; // in MUR
}

interface GroupedBarChartProps {
  data: GroupedBarDataPoint[];
  height?: number;
  className?: string;
  tealColor?: string;
  purpleColor?: string;
}

export function GroupedBarChart({
  data,
  height = 240,
  className = '',
  tealColor = '#119A94',
  purpleColor = '#6E4A9E',
}: GroupedBarChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-text-muted">
        No sales performance data available for this range
      </div>
    );
  }

  const svgWidth = 640;
  const svgHeight = height;
  const padding = { top: 25, right: 20, bottom: 35, left: 65 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Maximum value for scaling
  const maxRaw = Math.max(...data.flatMap(d => [d.quotedValue, d.signedRevenue]), 100000);
  const maxVal = Math.ceil(maxRaw / 500000) * 500000 || 1000000;

  // Grid steps (4 horizontal intervals)
  const steps = 4;
  const yTicks = Array.from({ length: steps + 1 }, (_, i) => (maxVal / steps) * i);

  const formatShortMur = (val: number) => {
    if (val >= 1000000) return `Rs ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `Rs ${(val / 1000).toFixed(0)}k`;
    return `Rs ${val}`;
  };

  const groupWidth = chartW / data.length;
  const barGap = 4;
  const barWidth = Math.min(24, Math.max(14, (groupWidth - 28) / 2));

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
      >
        {/* HORIZONTAL GRID LINES & LABELS */}
        {yTicks.map((val, idx) => {
          const y = padding.top + chartH - (val / maxVal) * chartH;
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="#EEF2F0"
                strokeWidth={1}
                strokeDasharray={idx === 0 ? undefined : '3 3'}
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                className="fill-text-muted text-[10px] font-mono font-medium"
              >
                {formatShortMur(val)}
              </text>
            </g>
          );
        })}

        {/* BARS */}
        {data.map((item, idx) => {
          const groupCenterX = padding.left + idx * groupWidth + groupWidth / 2;
          const quotedBarHeight = Math.max(3, (item.quotedValue / maxVal) * chartH);
          const signedBarHeight = Math.max(3, (item.signedRevenue / maxVal) * chartH);

          const quotedX = groupCenterX - barWidth - barGap / 2;
          const signedX = groupCenterX + barGap / 2;

          const quotedY = padding.top + chartH - quotedBarHeight;
          const signedY = padding.top + chartH - signedBarHeight;

          const isHovered = hoverIndex === idx;

          return (
            <g
              key={idx}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Highlight Background on Hover */}
              {isHovered && (
                <rect
                  x={padding.left + idx * groupWidth + 6}
                  y={padding.top - 5}
                  width={groupWidth - 12}
                  height={chartH + 10}
                  fill="#F1F6F5"
                  rx={6}
                />
              )}

              {/* Quoted Value Bar (Teal) */}
              <rect
                x={quotedX}
                y={quotedY}
                width={barWidth}
                height={quotedBarHeight}
                rx={3}
                fill={tealColor}
                opacity={isHovered ? 1 : 0.9}
                className="transition-all duration-200"
              />

              {/* Signed Revenue Bar (Purple) */}
              <rect
                x={signedX}
                y={signedY}
                width={barWidth}
                height={signedBarHeight}
                rx={3}
                fill={purpleColor}
                opacity={isHovered ? 1 : 0.9}
                className="transition-all duration-200"
              />

              {/* X-Axis Month Label */}
              <text
                x={groupCenterX}
                y={padding.top + chartH + 20}
                textAnchor="middle"
                className={`text-[11px] font-medium transition-colors ${
                  isHovered ? 'fill-text-primary font-bold' : 'fill-text-secondary'
                }`}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* FLOATING HOVER CARD */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          className="pointer-events-none absolute z-20 bg-bg-card border border-border-strong rounded-lg p-3 shadow-lg text-xs space-y-1.5 transition-all duration-150"
          style={{
            left: `${Math.min(
              85,
              Math.max(15, ((padding.left + hoverIndex * groupWidth + groupWidth / 2) / svgWidth) * 100)
            )}%`,
            top: '8px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-bold text-text-primary border-b border-border-subtle pb-1">
            {data[hoverIndex].label} Performance
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: tealColor }} />
                Quoted:
              </span>
              <span className="font-bold text-text-primary">
                Rs {data[hoverIndex].quotedValue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: purpleColor }} />
                Signed:
              </span>
              <span className="font-bold text-[#6E4A9E]">
                Rs {data[hoverIndex].signedRevenue.toLocaleString()}
              </span>
            </div>
            {data[hoverIndex].quotedValue > 0 && (
              <div className="flex items-center justify-between gap-4 text-[10px] text-text-muted pt-0.5 border-t border-border-subtle">
                <span>Conversion:</span>
                <span className="font-bold text-brand-primary">
                  {Math.round((data[hoverIndex].signedRevenue / data[hoverIndex].quotedValue) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
