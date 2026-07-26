import { PHASES, phaseAt, endometriumThickness, endometriumMM } from '../cycle/cycleData';
import HormoneChart from './HormoneChart';
import DailyReport from './DailyReport';
import { Eye, HeartHandshake } from 'lucide-react';

interface Props {
  day: number;
  onJumpTo: (day: number) => void;
}

export default function PhasePanel({ day, onJumpTo }: Props) {
  const phase = phaseAt(day);
  const thickness = endometriumThickness(day);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      {/* 阶段切换 */}
      <div className="grid grid-cols-4 gap-1.5">
        {PHASES.map((p) => {
          const active = p.id === phase.id;
          return (
            <button
              key={p.id}
              onClick={() => onJumpTo(p.anchorDay)}
              className="rounded-xl border px-1 py-2.5 text-center transition-all duration-300"
              style={{
                background: active ? p.colorSoft : 'rgba(255,255,255,0.03)',
                borderColor: active ? `${p.color}55` : 'rgba(255,255,255,0.07)',
                boxShadow: active ? `0 0 20px ${p.color}22, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
              }}
            >
              <div
                className="text-[12px] font-semibold transition-colors"
                style={{ color: active ? p.color : 'rgba(255,255,255,0.5)' }}
              >
                {p.name}
              </div>
              <div className="tabular mt-0.5 text-[9px] text-white/30">
                {p.range[0]}–{p.range[1]}天
              </div>
            </button>
          );
        })}
      </div>

      {/* 当前阶段卡片（切换时播放过渡动画） */}
      <div
        key={phase.id}
        className="phase-in rounded-2xl border p-4"
        style={{
          background: `linear-gradient(155deg, ${phase.colorSoft}, rgba(255,255,255,0.02))`,
          borderColor: `${phase.color}3d`,
          boxShadow: `0 12px 36px rgba(0,0,0,0.35), 0 0 32px ${phase.color}14`,
        }}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] font-bold" style={{ color: phase.color, textShadow: `0 0 24px ${phase.color}55` }}>
            {phase.name}
          </h2>
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">{phase.english}</span>
        </div>
        <p className="mt-0.5 text-[12px] font-medium text-white/65">{phase.tagline}</p>
        <p className="mt-2.5 text-[13px] leading-relaxed text-white/85">{phase.summary}</p>
        <ul className="mt-3 space-y-2">
          {phase.details.map((d, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-white/65">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: phase.color, boxShadow: `0 0 8px ${phase.color}` }}
              />
              {d}
            </li>
          ))}
        </ul>

        {/* 关注 & 关怀自己 */}
        <div className="mt-4 grid gap-2.5">
          <div className="rounded-xl border border-sky-300/15 bg-sky-300/[0.06] p-3">
            <h4 className="flex items-center gap-1.5 text-[12px] font-semibold text-sky-300">
              <Eye size={13} />
              这个阶段，关注自己
            </h4>
            <ul className="mt-2 space-y-1.5">
              {phase.watch.map((w, i) => (
                <li key={i} className="flex gap-1.5 text-[11.5px] leading-relaxed text-white/60">
                  <span className="mt-1 text-sky-300/70">·</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-rose-300/15 bg-rose-300/[0.06] p-3">
            <h4 className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-300">
              <HeartHandshake size={13} />
              这个阶段，关怀自己
            </h4>
            <ul className="mt-2 space-y-1.5">
              {phase.care.map((c, i) => (
                <li key={i} className="flex gap-1.5 text-[11.5px] leading-relaxed text-white/60">
                  <span className="mt-1 text-rose-300/70">·</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 今日身体报告（全身维度） */}
      <DailyReport day={day} />

      {/* 子宫内膜厚度 */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[13px] font-semibold text-white/80">子宫内膜厚度</h3>
          <span className="font-display tabular text-[17px] font-bold text-rose-300" style={{ textShadow: '0 0 16px rgba(251,113,133,0.5)' }}>
            {endometriumMM(day)} <span className="text-[11px] font-normal text-white/45">mm</span>
          </span>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${thickness * 100}%`,
              background: 'linear-gradient(90deg, #8f1032, #fb7185, #fda4af)',
              boxShadow: '0 0 12px rgba(251,113,133,0.55)',
            }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
          {phase.id === 'menstrual'
            ? '功能层正在剥脱 —— 内膜碎片与血液混合排出，形成经血'
            : phase.id === 'luteal'
              ? '分泌期：血管丰富、腺体分泌营养液，随时准备接纳受精卵'
              : '增生期：在雌激素作用下，内膜从基底层快速修复增厚'}
        </p>
      </div>

      {/* 激素曲线 */}
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-1 text-[13px] font-semibold text-white/80">四种关键激素（相对水平）</h3>
        <HormoneChart day={day} />
      </div>

      <p className="pb-2 text-center text-[10px] leading-relaxed text-white/25">
        本页面为 28 天标准周期的科普示意模型，实际周期长度与激素水平因人而异
      </p>
    </div>
  );
}
