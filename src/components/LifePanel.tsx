import { LIFE_STAGES } from '../cycle/lifeData';
import { Hourglass, HeartHandshake, Waves, CalendarRange, ChevronDown } from 'lucide-react';

interface Props {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export default function LifePanel({ selected, onSelect }: Props) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-5">
      {/* 引言 */}
      <div className="glass rounded-2xl p-4">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
          <Hourglass size={14} className="text-amber-300" />
          月经的一生
        </h3>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/55">
          月经会陪伴女性约 35–40 年，经历约 400–500 次周期。
          了解一生的激素地图 —— 知道现在的自己在哪，未来会经历什么。
        </p>
      </div>

      {/* 四个人生阶段 */}
      {LIFE_STAGES.map((s) => {
        const active = selected === s.id;
        return (
          <div
            key={s.id}
            className="rounded-2xl border transition-all duration-300"
            style={{
              background: active
                ? `linear-gradient(155deg, ${s.color}22, rgba(255,255,255,0.02))`
                : 'rgba(255,255,255,0.03)',
              borderColor: active ? `${s.color}55` : 'rgba(255,255,255,0.07)',
              boxShadow: active ? `0 10px 32px rgba(0,0,0,0.35), 0 0 28px ${s.color}18` : 'none',
            }}
          >
            <button
              onClick={() => onSelect(active ? null : s.id)}
              className="flex w-full items-center justify-between gap-2 p-4 text-left"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }}
                />
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: active ? s.color : 'rgba(255,255,255,0.85)' }}>
                    {s.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/40">
                    {s.ageText} · {s.tagline}
                  </div>
                </div>
              </div>
              <ChevronDown
                size={15}
                className="shrink-0 text-white/35 transition-transform duration-300"
                style={{ transform: active ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {active && (
              <div className="phase-in px-4 pb-4">
                <ul className="space-y-1.5 border-t border-white/10 pt-3">
                  {s.happening.map((h, i) => (
                    <li key={i} className="flex gap-1.5 text-[11.5px] leading-relaxed text-white/70">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 space-y-1.5">
                  <p className="flex items-start gap-1.5 rounded-lg bg-white/[0.04] p-2 text-[11px] leading-relaxed text-white/60">
                    <Waves size={12} className="mt-0.5 shrink-0" style={{ color: s.color }} />
                    <span>
                      <span className="font-medium text-white/80">激素形态：</span>
                      {s.hormoneNote}
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5 rounded-lg bg-white/[0.04] p-2 text-[11px] leading-relaxed text-white/60">
                    <CalendarRange size={12} className="mt-0.5 shrink-0" style={{ color: s.color }} />
                    <span>
                      <span className="font-medium text-white/80">周期特点：</span>
                      {s.cycleNote}
                    </span>
                  </p>
                </div>

                <div className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] p-3">
                  <h4 className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-300">
                    <HeartHandshake size={13} />
                    这个阶段，关怀自己
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {s.care.map((c, i) => (
                      <li key={i} className="flex gap-1.5 text-[11.5px] leading-relaxed text-white/60">
                        <span className="mt-1 text-rose-300/70">·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <p className="pb-2 text-center text-[10px] leading-relaxed text-white/25">
        年龄范围是人群的平均值 —— 初潮 9–15 岁、绝经 45–55 岁都属正常，
        每个人的时间表都独一无二
      </p>
    </div>
  );
}
