import React, { useState } from 'react';

// Line chart with smooth spline or straight segments, area fill, data points, and interactive hover tooltip
export interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const CustomLineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = '#3B82F6',
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-400">No chart data</div>;
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const minVal = 0;

  const getX = (idx: number) => {
    if (data.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (idx / (data.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;
  };

  // Generate SVG path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `${points} ${getX(data.length - 1)},${padding.top + innerHeight} ${getX(0)},${padding.top + innerHeight} Z`;

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id={`chart-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + innerHeight * (1 - ratio);
          const val = Math.round(minVal + (maxVal - minVal) * ratio);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <polygon
          points={areaPath}
          fill={`url(#chart-grad-${color.replace('#', '')})`}
        />

        {/* Main Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Dots & Labels */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 5.5 : 3.5}
                fill={isHovered ? '#fff' : color}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all"
              />
              {/* X label */}
              <text
                x={cx}
                y={chartHeight - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute pointer-events-none -top-2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700/50 transform -translate-x-1/2 -translate-y-full transition-all"
          style={{
            left: `${((getX(hoveredIdx) / chartWidth) * 100).toFixed(1)}%`,
          }}
        >
          <div className="font-semibold">{data[hoveredIdx].label}</div>
          <div className="text-blue-400 font-mono">
            {valuePrefix}{data[hoveredIdx].value.toLocaleString()}{valueSuffix}
          </div>
        </div>
      )}
    </div>
  );
};

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  valueSuffix?: string;
}

export const CustomBarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  color = '#10B981',
  valueSuffix = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-400">No chart data</div>;
  }

  const padding = { top: 20, right: 15, bottom: 30, left: 35 };
  const chartWidth = 500;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 5);

  const barWidth = Math.min(32, (innerWidth / data.length) * 0.6);

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Horizontal grid lines */}
        {[0, 0.33, 0.66, 1].map((ratio, i) => {
          const y = padding.top + innerHeight * (1 - ratio);
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + (i + 0.5) * (innerWidth / data.length) - barWidth / 2;
          const barH = (d.value / maxVal) * innerHeight;
          const y = padding.top + innerHeight - barH;
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barH)}
                rx="4"
                fill={color}
                opacity={isHovered ? 1 : 0.85}
                className="transition-all duration-150"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute pointer-events-none -top-2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700/50 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(( (padding.left + (hoveredIdx + 0.5) * (innerWidth / data.length)) / chartWidth) * 100).toFixed(1)}%`,
          }}
        >
          <div className="font-semibold">{data[hoveredIdx].label}</div>
          <div className="text-emerald-400 font-mono">
            {data[hoveredIdx].value} {valueSuffix}
          </div>
        </div>
      )}
    </div>
  );
};

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export const CustomDonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
}) => {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const center = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.18;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, i) => {
            const ratio = item.value / total;
            const strokeDasharray = `${ratio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulated * circumference;
            accumulated += ratio;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-85"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            100%
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Formats
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-36">
        {data.map((item, i) => {
          const pct = ((item.value / total) * 100).toFixed(0);
          return (
            <div key={i} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
              </div>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
