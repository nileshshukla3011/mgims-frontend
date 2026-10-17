import React from 'react';

/**
 * Small bar chart for dashboards. The SVG is a picture of the data for sighted users; the same numbers are in a table
 * that screen readers use and anyone can open (WCAG 1.1.1).
 */
export const BarChart: React.FC<{ title: string; data: { label: string; value: number }[]; unit?: string; color?: string }> = ({ title, data, unit = '', color = '#004080' }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const width = 600;
  const height = 120;
  const barWidth = width / Math.max(1, data.length);
  return (
    <figure className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
        <span className="font-bold text-ink">{title}</span>
        <span className="text-slate-600">Total {total.toLocaleString('en-IN')}{unit}</span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full" aria-hidden="true" preserveAspectRatio="none">
        <line x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} stroke="#94a3b8" />
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 8);
          return <rect key={d.label} x={i * barWidth + barWidth * 0.15} y={height - h} width={barWidth * 0.7} height={h} fill={color} rx="2" />;
        })}
      </svg>
      <details className="text-xs">
        <summary className="cursor-pointer font-semibold text-link">Show the numbers</summary>
        <div className="max-h-48 overflow-y-auto">
          <table className="mt-1 w-full text-left">
            <caption className="sr-only">{title}</caption>
            <thead><tr><th scope="col" className="py-0.5 pr-3">Period</th><th scope="col" className="py-0.5 text-right">Value</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d.label}><td className="py-0.5 pr-3">{d.label}</td><td className="py-0.5 text-right font-mono">{d.value.toLocaleString('en-IN')}{unit}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
};
