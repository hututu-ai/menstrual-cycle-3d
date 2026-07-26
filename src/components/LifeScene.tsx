import {
  LIFE_AGE_MIN,
  LIFE_AGE_MAX,
  LIFE_STAGES,
  LIFE_EVENTS,
  lifeEstrogen,
} from '../cycle/lifeData';
import { X, MousePointerClick, Waves, CalendarRange } from 'lucide-react';

interface Props {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

const xPct = (age: number) => ((age - LIFE_AGE_MIN) / (LIFE_AGE_MAX - LIFE_AGE_MIN)) * 100;
const yPct = (v: number) => 20 + (1 - v) * 62; // 绘图区：20% → 82%
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function LifeScene({ selected, onSelect }: Props) {
  const stage = selected ? (LIFE_STAGES.find((s) => s.id === selected) ?? null) : null;

  // 雌激素一生曲线（viewBox 0 0 100 100，拉伸铺满）
  const pts: string[] = [];
  for (let a = LIFE_AGE_MIN; a <= LIFE_AGE_MAX; a += 0.25) {
    pts.push(`${xPct(a).toFixed(2)},${yPct(lifeEstrogen(a)).toFixed(2)}`);
  }
  const line = `M ${pts.join(' L ')}`;
  const area = `${line} L ${xPct(LIFE_AGE_MAX)},88 L ${xPct(LIFE_AGE_MIN)},88 Z`;

  // 气泡卡位置：贴着选中标记，自动避开边缘
  const mx = stage ? xPct(stage.anchorAge) : 0;
  const my = stage ? yPct(lifeEstrogen(stage.anchorAge)) : 0;
  const cardTop = stage ? clamp(my - 20, 15, 46) : 0;
  const cardSide = mx > 52 ? { right: `${100 - mx + 4}%` } : { left: `${mx + 4}%` };

  return (
    <div className="absolute inset-0">
      {/* 标题 */}
      <div className="pointer-events-none absolute left-7 top-5 z-10 select-none">
        <h2 className="font-display text-[20px] font-bold text-white/90">
          一生的月经周期
          <span className="ml-2 bg-gradient-to-r from-sky-300 via-rose-300 to-amber-300 bg-clip-text text-[15px] font-semibold text-transparent">
            从初潮到绝经
          </span>
        </h2>
        <p className="mt-0.5 text-[11px] tracking-wide text-white/40">
          一条曲线，看完雌激素的一辈子 · 约 400–500 次周期
        </p>
      </div>

      {/* 图表底层：阶段色带 + 曲线 */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lifeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.30" />
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lifeLine" x1="0" y1="0" x2="1" y2="0">
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
            y={12}
            width={xPct(s.span[1]) - xPct(s.span[0])}
            height={76}
            fill={s.color}
            opacity={selected === s.id ? 0.14 : 0.05}
            onClick={() => onSelect(s.id)}
            style={{ cursor: 'pointer', transition: 'opacity 0.4s' }}
          />
        ))}
        <path d={area} fill="url(#lifeArea)" />
        <path
          d={line}
          fill="none"
          stroke="url(#lifeLine)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(251,113,133,0.45))' }}
        />
      </svg>

      {/* 年龄网格线与刻度（HTML，保证清晰） */}
      {[10, 20, 30, 40, 50, 60].map((a) => (
        <div key={a}>
          <div
            className="absolute w-px bg-white/[0.06]"
            style={{ left: `${xPct(a)}%`, top: '14%', height: '72%' }}
          />
          <span
            className="absolute -translate-x-1/2 text-[10px] tabular text-white/30"
            style={{ left: `${xPct(a)}%`, top: '88%' }}
          >
            {a} 岁
          </span>
        </div>
      ))}
      <span className="absolute bottom-[6%] right-[2%] text-[10px] tracking-wider text-white/25">年龄 →</span>
      <span
        className="absolute left-[1%] top-[13%] text-[10px] tracking-wider text-white/25"
        style={{ writingMode: 'vertical-rl' }}
      >
        雌激素水平 →
      </span>

      {/* 人生事件标注 */}
      {LIFE_EVENTS.map((e) => {
        const ex = xPct(e.age);
        const ey = yPct(lifeEstrogen(e.age));
        return (
          <div
            key={e.label}
            className="pointer-events-none absolute"
            style={{ left: `${ex}%`, top: `${ey}%` }}
          >
            <div className="h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/50" />
            <div
              className="absolute w-max -translate-x-1/2 text-center"
              style={e.pos === 'above' ? { bottom: 12 } : { top: 12 }}
            >
              <div className="text-[10px] font-medium text-white/55">{e.label}</div>
              {e.note && <div className="text-[8.5px] text-white/30">{e.note}</div>}
            </div>
          </div>
        );
      })}

      {/* 阶段标记：直接标注在曲线上 */}
      {LIFE_STAGES.map((s) => {
        const sx = xPct(s.anchorAge);
        const sy = yPct(lifeEstrogen(s.anchorAge));
        const active = selected === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(active ? null : s.id)}
            className="group absolute z-10"
            style={{ left: `${sx}%`, top: `${sy}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* 发光点 */}
            <span className="relative block h-4 w-4">
              <span
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background: s.color,
                  boxShadow: `0 0 ${active ? 22 : 12}px ${s.color}${active ? 'ff' : 'aa'}`,
                  transform: active ? 'scale(1.35)' : 'scale(1)',
                }}
              />
              <span
                className="absolute inset-0 animate-ping rounded-full"
                style={{ background: `${s.color}55`, animationDuration: '2.4s' }}
              />
              {active && (
                <span
                  className="absolute -inset-2 rounded-full border"
                  style={{ borderColor: `${s.color}88` }}
                />
              )}
            </span>
            {/* 名称标签：直接挂在标记上方 */}
            <span
              className="absolute bottom-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-300"
              style={{ opacity: active || !selected ? 1 : 0.45 }}
            >
              <span
                className="block rounded-lg border px-2.5 py-1 text-[11.5px] font-semibold backdrop-blur-md transition-all"
                style={{
                  color: s.color,
                  borderColor: `${s.color}${active ? '77' : '33'}`,
                  background: `rgba(18, 8, 14, ${active ? 0.85 : 0.55})`,
                  textShadow: `0 0 12px ${s.color}70`,
                }}
              >
                {s.name}
              </span>
              <span className="mt-0.5 block text-[9px] text-white/40">{s.ageText}</span>
            </span>
          </button>
        );
      })}

      {/* 选中阶段的气泡讲解卡：直接标注在图上 */}
      {stage && (
        <div className="absolute z-20 w-[320px]" style={{ ...cardSide, top: `${cardTop}%` }}>
          <div
            className="phase-in rounded-2xl border p-4 backdrop-blur-2xl"
            style={{
              borderColor: `${stage.color}55`,
              background: 'rgba(20, 9, 16, 0.86)',
              boxShadow: `0 16px 48px rgba(0,0,0,0.55), 0 0 40px ${stage.color}22`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="font-display text-[17px] font-bold"
                  style={{ color: stage.color, textShadow: `0 0 16px ${stage.color}60` }}
                >
                  {stage.name}
                </span>
                <span className="ml-2 text-[10px] text-white/40">{stage.ageText}</span>
              </div>
              <button
                onClick={() => onSelect(null)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <X size={11} />
              </button>
            </div>
            <p className="mt-1 text-[11.5px] font-medium text-white/60">{stage.tagline}</p>
            <ul className="mt-2 space-y-1.5">
              {stage.happening.slice(0, 3).map((h, i) => (
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
              <p className="flex items-center gap-1.5 text-[10.5px] text-white/55">
                <Waves size={11} style={{ color: stage.color }} />
                {stage.hormoneNote}
              </p>
              <p className="flex items-center gap-1.5 text-[10.5px] text-white/55">
                <CalendarRange size={11} style={{ color: stage.color }} />
                {stage.cycleNote}
              </p>
            </div>
            <p className="mt-2 text-[9px] text-white/30">完整的关怀建议见右侧面板 →</p>
          </div>
        </div>
      )}

      {/* 未选中时的提示 */}
      {!stage && (
        <div className="pointer-events-none absolute bottom-[14%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#140910]/70 px-4 py-2 text-[11.5px] text-white/50 backdrop-blur-xl">
          <MousePointerClick size={13} className="text-rose-300" />
          点击曲线上的发光标记，探索每个人生阶段
        </div>
      )}
    </div>
  );
}
