import { useMemo } from 'react';
import {
  basalBodyTemp,
  cervicalMucus,
  bodySignals,
  ovarianPhase,
  uterinePhase,
  isFertile,
  MUCUS_LEVELS,
  CYCLE_DAYS,
} from '../cycle/cycleData';
import {
  Flame,
  BatteryLow,
  BatteryMedium,
  Zap,
  Sparkles,
  Smile,
  Heart,
  Droplets,
  Droplet,
  Activity,
  Thermometer,
  ThermometerSun,
  Cookie,
  HeartPulse,
  CloudRain,
  CircleDot,
  Moon,
  Baby,
} from 'lucide-react';

const ICONS: Record<string, typeof Flame> = {
  Flame,
  BatteryLow,
  BatteryMedium,
  Zap,
  Sparkles,
  Smile,
  Heart,
  Droplets,
  Droplet,
  Activity,
  Thermometer,
  ThermometerSun,
  Cookie,
  HeartPulse,
  CloudRain,
  CircleDot,
  Moon,
};

/* ---------------- 基础体温迷你曲线 ---------------- */

const BW = 340;
const BH = 86;
const BPAD = { l: 6, r: 6, t: 8, b: 16 };
const T_MIN = 36.0;
const T_MAX = 37.1;

const bx = (d: number) => BPAD.l + ((d - 1) / (CYCLE_DAYS - 1)) * (BW - BPAD.l - BPAD.r);
const by = (t: number) => BPAD.t + (1 - (t - T_MIN) / (T_MAX - T_MIN)) * (BH - BPAD.t - BPAD.b);

function TempChart({ day }: { day: number }) {
  const { line, area } = useMemo(() => {
    let d = '';
    for (let x = 1; x <= CYCLE_DAYS; x += 0.25) {
      d += `${x === 1 ? 'M' : 'L'}${bx(x).toFixed(1)},${by(basalBodyTemp(x)).toFixed(1)} `;
    }
    const base = BH - BPAD.b;
    return {
      line: d,
      area: `${d}L${bx(CYCLE_DAYS).toFixed(1)},${base} L${bx(1).toFixed(1)},${base} Z`,
    };
  }, []);

  const temp = basalBodyTemp(day);

  return (
    <svg viewBox={`0 0 ${BW} ${BH}`} className="w-full">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* 高温相区域（排卵后） */}
      <rect
        x={bx(15)}
        y={BPAD.t}
        width={bx(CYCLE_DAYS) - bx(15)}
        height={BH - BPAD.t - BPAD.b}
        fill="#fb923c"
        opacity={0.05}
        rx={4}
      />
      <line x1={bx(14)} y1={BPAD.t} x2={bx(14)} y2={BH - BPAD.b} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 4" />
      <text x={bx(14)} y={BH - 4} fill="rgba(255,255,255,0.35)" fontSize={8} textAnchor="middle">
        排卵
      </text>
      <path d={area} fill="url(#tg)" />
      <path d={line} fill="none" stroke="#fb923c" strokeWidth={1.8} />
      {/* 当前点 */}
      <line x1={bx(day)} y1={BPAD.t} x2={bx(day)} y2={BH - BPAD.b} stroke="#fff" strokeWidth={1} opacity={0.4} />
      <circle cx={bx(day)} cy={by(temp)} r={4.5} fill="#fb923c" opacity={0.3} />
      <circle cx={bx(day)} cy={by(temp)} r={2.6} fill="#fdba74" stroke="#140910" strokeWidth={1.2} />
    </svg>
  );
}

/* ---------------- 主组件 ---------------- */

export default function DailyReport({ day }: { day: number }) {
  const temp = basalBodyTemp(day);
  const mucus = cervicalMucus(day);
  const signals = bodySignals(day);
  const ov = ovarianPhase(day);
  const ut = uterinePhase(day);
  const fertile = isFertile(day);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-white/80">今日身体报告</h3>
        {fertile && (
          <span className="flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[10px] text-amber-300">
            <Baby size={11} />
            易孕期
          </span>
        )}
      </div>

      {/* 双周期轨道 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2">
          <div className="text-[9px] tracking-wider text-white/35">卵巢正在</div>
          <div className="mt-0.5 text-[12px] font-semibold" style={{ color: ov.color }}>
            {ov.name}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2">
          <div className="text-[9px] tracking-wider text-white/35">子宫正在</div>
          <div className="mt-0.5 text-[12px] font-semibold" style={{ color: ut.color }}>
            {ut.name}
          </div>
        </div>
      </div>

      {/* 基础体温 */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-white/55">基础体温 BBT</span>
          <span className="tabular font-mono text-[14px] font-bold text-orange-300" style={{ textShadow: '0 0 14px rgba(251,146,60,0.5)' }}>
            {temp.toFixed(2)} ℃
          </span>
        </div>
        <TempChart day={day} />
      </div>

      {/* 宫颈黏液 */}
      <div className="mt-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-white/55">宫颈黏液</span>
          <span className="text-[11px] font-medium text-sky-300">{mucus.name}</span>
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          {MUCUS_LEVELS.map((name, i) => {
            const active = i === mucus.level;
            return (
              <div
                key={name}
                className="rounded-md px-1 py-1 text-center text-[9px] transition-all"
                style={{
                  background: active ? 'rgba(56,189,248,0.15)' : 'rgba(var(--ink),0.05)',
                  color: active ? '#7dd3fc' : 'rgba(var(--ink),0.45)',
                  border: `1px solid ${active ? 'rgba(56,189,248,0.35)' : 'transparent'}`,
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] text-white/35">{mucus.desc}</p>
      </div>

      {/* 身体感受 */}
      <div className="mt-3">
        <span className="text-[11px] text-white/55">可能的身体感受</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {signals.map((s) => {
            const Icon = ICONS[s.icon] ?? Activity;
            return (
              <span
                key={s.label}
                title={s.note}
                className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10.5px] text-white/70"
              >
                <Icon size={11} className="text-rose-300/80" />
                {s.label}
              </span>
            );
          })}
        </div>
        {signals.some((s) => s.note) && (
          <p className="mt-1.5 text-[10px] leading-relaxed text-white/35">
            {signals.find((s) => s.note)?.note}
          </p>
        )}
      </div>
    </div>
  );
}
