import { useState } from 'react';
import {
  LIFE_AGE_MIN,
  LIFE_AGE_MAX,
  LIFE_STAGES,
  lifeEstrogen,
} from '../cycle/lifeData';
import {
  Hourglass,
  X,
  ChevronUp,
  ChevronDown,
  Waves,
  CalendarRange,
  HeartHandshake,
} from 'lucide-react';

const xPct = (age: number) => ((age - LIFE_AGE_MIN) / (LIFE_AGE_MAX - LIFE_AGE_MIN)) * 100;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** viewBox 高 40：曲线 y ∈ [6, 34] → 容器百分比 */
const yPct = (v: number) => ((34 - v * 28) / 40) * 100;

/** 一生激素长卷：嵌入周期时间轴上方的生命时间带 */
export default function LifeStrip() {
  const [selected, setSelected] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const stage = selected ? (LIFE_STAGES.find((s) => s.id === selected) ?? null) : null;

  const pts: string[] = [];
  for (let a = LIFE_AGE_MIN; a <= LIFE_AGE_MAX; a += 0.5) {
    pts.push(`${xPct(a).toFixed(1)},${(34 - lifeEstrogen(a) * 28).toFixed(1)}`);
  }
  const line = `M ${pts.join(' L ')}`;

  return (
    <div className="mb-2.5 border-b border-white/[0.07] pb-2">
      <button onClick={() => setCollapsed((c) => !c)} className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] tracking-wider text-white/40">
          <Hourglass size={11} className="text-amber-300/70" />
          一生 · 激素长卷
          <span className="hidden text-white/25 sm:inline">初潮到绝经 · 约 400–500 次周期</span>
        </span>
        {collapsed ? (
          <ChevronDown size={13} className="text-white/30" />
        ) : (
          <ChevronUp size={13} className="text-white/30" />
        )}
      </button>

      {!collapsed && (
        <div className="relative mt-1 h-[62px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="stripLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="42%" stopColor="#fb7185" />
                <stop offset="72%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            {LIFE_STAGES.map((s) => (
              <rect
                key={s.id}
                x={xPct(s.span[0])}
                y={2}
                width={xPct(s.span[1]) - xPct(s.span[0])}
                height={36}
                fill={s.color}
                opacity={selected === s.id ? 0.16 : 0.06}
                onClick={() => setSelected(selected === s.id ? null : s.id)}
                style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
              />
            ))}
            <path
              d={line}
              fill="none"
              stroke="url(#stripLine)"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 3px rgba(251,113,133,0.5))' }}
            />
          </svg>

          {/* 年龄刻度 */}
          {[10, 20, 30, 40, 50, 60].map((a) => (
            <span
              key={a}
              className="absolute bottom-0 -translate-x-1/2 text-[8px] tabular text-white/25"
              style={{ left: `${xPct(a)}%` }}
            >
              {a}
            </span>
          ))}

          {/* 阶段标记：直接标注在曲线上 */}
          {LIFE_STAGES.map((s) => {
            const sx = xPct(s.anchorAge);
            const sy = yPct(lifeEstrogen(s.anchorAge));
            const active = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(active ? null : s.id)}
                className="group absolute z-10"
                style={{ left: `${sx}%`, top: `${sy}%`, transform: 'translate(-50%, -50%)' }}
              >
                <span className="relative block h-2.5 w-2.5">
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-300"
                    style={{
                      background: s.color,
                      boxShadow: `0 0 ${active ? 12 : 7}px ${s.color}`,
                      transform: active ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                </span>
                <span
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8.5px] transition-colors"
                  style={{ color: active ? s.color : 'rgba(255,255,255,0.45)' }}
                >
                  {s.name.split(' · ')[0]}
                </span>
              </button>
            );
          })}

          {/* 气泡讲解卡：锚定在标记上方弹出 */}
          {stage && (
            <div
              className="absolute z-50 w-[300px]"
              style={{
                left: `${clamp(xPct(stage.anchorAge), 24, 76)}%`,
                bottom: 'calc(100% + 10px)',
                transform: 'translateX(-50%)',
              }}
            >
              <div
                className="phase-in max-h-[320px] overflow-y-auto rounded-2xl border p-4 backdrop-blur-2xl"
                style={{
                  borderColor: `${stage.color}55`,
                  background: 'rgba(20, 9, 16, 0.92)',
                  boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 40px ${stage.color}22`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-display text-[16px] font-bold"
                      style={{ color: stage.color, textShadow: `0 0 16px ${stage.color}60` }}
                    >
                      {stage.name}
                    </span>
                    <span className="ml-2 text-[10px] text-white/40">{stage.ageText}</span>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </div>
                <p className="mt-0.5 text-[11px] font-medium text-white/60">{stage.tagline}</p>
                <ul className="mt-2 space-y-1.5">
                  {stage.happening.map((h, i) => (
                    <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-white/70">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{ background: stage.color, boxShadow: `0 0 6px ${stage.color}` }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 space-y-1 border-t border-white/10 pt-2">
                  <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-white/55">
                    <Waves size={11} className="mt-0.5 shrink-0" style={{ color: stage.color }} />
                    {stage.hormoneNote}
                  </p>
                  <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-white/55">
                    <CalendarRange size={11} className="mt-0.5 shrink-0" style={{ color: stage.color }} />
                    {stage.cycleNote}
                  </p>
                </div>
                <div className="mt-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] p-2.5">
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                    <HeartHandshake size={12} />
                    这个阶段，关怀自己
                  </h4>
                  <ul className="mt-1.5 space-y-1">
                    {stage.care.map((c, i) => (
                      <li key={i} className="flex gap-1.5 text-[10.5px] leading-relaxed text-white/60">
                        <span className="mt-0.5 text-rose-300/70">·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
