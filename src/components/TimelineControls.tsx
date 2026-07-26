import { PHASES, CYCLE_DAYS, phaseAt } from '../cycle/cycleData';
import { Play, Pause, RotateCcw } from 'lucide-react';
import LifeStrip from './LifeStrip';

const EVENTS: { day: number; label: string; color: string }[] = [
  { day: 1, label: '月经来潮', color: '#fb6f92' },
  { day: 5, label: '经期结束', color: '#fb6f92' },
  { day: 13, label: '雌激素峰', color: '#4ade80' },
  { day: 14, label: '排卵', color: '#fbbf24' },
  { day: 21, label: '内膜最厚', color: '#c4b5fd' },
  { day: 27, label: '黄体退化', color: '#c4b5fd' },
];

interface Props {
  day: number;
  playing: boolean;
  speed: number;
  onDayChange: (d: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (s: number) => void;
  onReset: () => void;
}

export default function TimelineControls({
  day,
  playing,
  speed,
  onDayChange,
  onTogglePlay,
  onSpeedChange,
  onReset,
}: Props) {
  const phase = phaseAt(day);
  const pct = ((day - 1) / (CYCLE_DAYS - 1)) * 100;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-5">
      <div className="glass pointer-events-auto w-[min(760px,94%)] rounded-2xl px-5 pb-3.5 pt-3">
        {/* 一生激素长卷（可折叠） */}
        <LifeStrip />

        {/* 阶段色带 */}
        <div className="relative mb-1 h-2 w-full overflow-hidden rounded-full bg-white/5">
          {PHASES.map((p) => {
            const left = ((p.range[0] - 1) / (CYCLE_DAYS - 1)) * 100;
            const right = ((Math.min(p.range[1], CYCLE_DAYS) - 1) / (CYCLE_DAYS - 1)) * 100;
            return (
              <button
                key={p.id}
                onClick={() => onDayChange(p.anchorDay)}
                title={p.name}
                className="absolute top-0 h-full opacity-75 transition-opacity hover:opacity-100"
                style={{
                  left: `${left}%`,
                  width: `${right - left + 3.6}%`,
                  background: `linear-gradient(180deg, ${p.color}, ${p.color}bb)`,
                }}
              />
            );
          })}
          {/* 易孕期高亮（第 11–16 天） */}
          <button
            onClick={() => onDayChange(13)}
            title="易孕期（第 11–16 天）：排卵前后怀孕概率最高"
            className="absolute top-0 h-full rounded-full border border-dashed border-amber-200/70 bg-amber-300/10 transition-colors hover:bg-amber-300/20"
            style={{ left: `${(10 / 27) * 100}%`, width: `${(6 / 27) * 100}%` }}
          />
        </div>

        {/* 事件刻度 */}
        <div className="relative mb-2.5 h-5 w-full">
          {EVENTS.map((e) => {
            const left = ((e.day - 1) / (CYCLE_DAYS - 1)) * 100;
            return (
              <button
                key={e.label}
                onClick={() => onDayChange(e.day)}
                className="group absolute top-0 -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                <span
                  className="mx-auto block h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150"
                  style={{ background: e.color, boxShadow: `0 0 8px ${e.color}` }}
                />
                <span className="mt-0.5 hidden whitespace-nowrap text-[9px] text-white/40 transition group-hover:text-white/90 sm:block">
                  {e.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* 播放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${phase.color}, ${phase.color}aa)`,
                boxShadow: `0 4px 24px ${phase.color}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              onClick={onReset}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/10 hover:text-white"
              title="回到第 1 天"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* 滑轨 */}
          <div className="relative flex-1">
            <input
              type="range"
              min={1}
              max={CYCLE_DAYS}
              step={0.1}
              value={day}
              onChange={(e) => onDayChange(parseFloat(e.target.value))}
              className="cycle-slider w-full"
              style={{
                background: `linear-gradient(to right, ${phase.color}dd 0%, ${phase.color}dd ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
              }}
            />
          </div>

          {/* 天数与速度 */}
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="font-display tabular text-xl font-bold text-white">
                {Math.floor(day)}
                <span className="ml-1 text-[11px] font-normal text-white/50">/ 28 天</span>
              </div>
              <div className="text-[10px] tracking-wider" style={{ color: phase.color }}>
                {phase.name}
              </div>
            </div>
            <div className="flex overflow-hidden rounded-full border border-white/10 text-[11px]">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`px-2.5 py-1 transition ${
                    speed === s ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
