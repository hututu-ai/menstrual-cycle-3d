import { useMemo } from 'react';
import { hormones, HORMONE_META, PHASES, CYCLE_DAYS } from '../cycle/cycleData';

const W = 380;
const H = 176;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 22;

const xOf = (day: number) => PAD_L + ((day - 1) / (CYCLE_DAYS - 1)) * (W - PAD_L - PAD_R);
const yOf = (v: number) => PAD_T + (1 - v) * (H - PAD_T - PAD_B);
const BASE = H - PAD_B;

export default function HormoneChart({ day }: { day: number }) {
  const { lines, areas } = useMemo(() => {
    const lines: Record<string, string> = {};
    const areas: Record<string, string> = {};
    HORMONE_META.forEach((h) => {
      let d = '';
      for (let x = 1; x <= CYCLE_DAYS; x += 0.25) {
        const v = hormones(x)[h.key as keyof ReturnType<typeof hormones>];
        d += `${x === 1 ? 'M' : 'L'}${xOf(x).toFixed(1)},${yOf(v).toFixed(1)} `;
      }
      lines[h.key] = d;
      areas[h.key] = `${d}L${xOf(CYCLE_DAYS).toFixed(1)},${BASE} L${xOf(1).toFixed(1)},${BASE} Z`;
    });
    return { lines, areas };
  }, []);

  const now = hormones(day);
  const cx = xOf(day);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          {HORMONE_META.map((h) => (
            <linearGradient key={h.key} id={`hg-${h.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={h.color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={h.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 阶段背景 */}
        {PHASES.map((p) => (
          <rect
            key={p.id}
            x={xOf(p.range[0])}
            y={PAD_T}
            width={xOf(Math.min(p.range[1] + 1, CYCLE_DAYS + 0.99)) - xOf(p.range[0])}
            height={H - PAD_T - PAD_B}
            fill={p.color}
            opacity={0.06}
            rx={4}
          />
        ))}
        {[7, 14, 21, 28].map((d) => (
          <g key={d}>
            <line x1={xOf(d)} y1={PAD_T} x2={xOf(d)} y2={BASE} stroke="rgba(255,255,255,0.07)" strokeDasharray="2 5" />
            <text x={xOf(d)} y={H - 7} fill="rgba(255,255,255,0.38)" fontSize={9} textAnchor="middle">
              {d}天
            </text>
          </g>
        ))}

        {/* 面积 + 曲线 */}
        {HORMONE_META.map((h) => (
          <path key={`a-${h.key}`} d={areas[h.key]} fill={`url(#hg-${h.key})`} />
        ))}
        {HORMONE_META.map((h) => (
          <path key={`l-${h.key}`} d={lines[h.key]} fill="none" stroke={h.color} strokeWidth={1.8} opacity={0.95} filter="url(#soft)" />
        ))}

        {/* 当前日期 */}
        <line x1={cx} y1={PAD_T} x2={cx} y2={BASE} stroke="#fff" strokeWidth={1} opacity={0.5} />
        {HORMONE_META.map((h) => (
          <g key={`d-${h.key}`}>
            <circle cx={cx} cy={yOf(now[h.key as keyof typeof now])} r={5} fill={h.color} opacity={0.25} />
            <circle cx={cx} cy={yOf(now[h.key as keyof typeof now])} r={2.6} fill={h.color} stroke="#140910" strokeWidth={1.2} />
          </g>
        ))}
      </svg>

      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 px-1">
        {HORMONE_META.map((h) => {
          const v = now[h.key as keyof typeof now];
          return (
            <div key={h.key} className="flex items-center gap-1.5 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: h.color, boxShadow: `0 0 8px ${h.color}` }} />
              <span className="text-white/65">{h.name}</span>
              <span className="tabular ml-auto font-mono text-white/45">{Math.round(v * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
