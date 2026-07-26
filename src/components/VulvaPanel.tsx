import { VULVA_PARTS, VULVA_FACTS } from '../cycle/vulvaData';
import { Eye, ShieldCheck, ArrowRight, Droplets, Heart, Hand } from 'lucide-react';

const ICONS: Record<string, typeof Eye> = {
  Eye,
  ShieldCheck,
  ArrowRight,
  Droplets,
  Heart,
  Hand,
};

export default function VulvaPanel({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      {/* 标题 */}
      <div
        className="phase-in rounded-2xl border border-rose-300/25 p-4"
        style={{
          background: 'linear-gradient(155deg, rgba(251,113,133,0.12), rgba(255,255,255,0.02))',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
        }}
      >
        <h2 className="font-display text-[22px] font-bold text-rose-300" style={{ textShadow: '0 0 24px rgba(251,113,133,0.5)' }}>
          认识外阴
        </h2>
        <p className="mt-0.5 text-[12px] font-medium text-white/65">Vulva · 身体可见的那一面</p>
        <p className="mt-2.5 text-[13px] leading-relaxed text-white/85">
          这是你自己就能看到的身体。很多女性从未被允许、也从未被鼓励好好看看它 ——
          从今天开始，大方地认识它的每一个部分。
        </p>
      </div>

      {/* 部位导览（点击与 3D 模型联动） */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-[13px] font-semibold text-white/80">部位导览</h3>
        <p className="mt-0.5 text-[10px] text-white/35">点击部位，在 3D 模型上查看标注讲解</p>
        <ul className="mt-2.5 space-y-1.5">
          {VULVA_PARTS.map((p) => {
            const active = selected === p.name;
            return (
              <li key={p.name}>
                <button
                  onClick={() => onSelect(active ? null : p.name)}
                  className="flex w-full gap-2.5 rounded-xl border p-2 text-left transition-all"
                  style={{
                    borderColor: active ? `${p.color}66` : 'transparent',
                    background: active ? `${p.color}14` : 'transparent',
                  }}
                >
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                  />
                  <div>
                    <span className="text-[12.5px] font-semibold" style={{ color: p.color }}>
                      {p.name}
                    </span>
                    <p className={`mt-0.5 text-[11.5px] leading-relaxed ${active ? 'text-white/80' : 'text-white/50'}`}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 关键知识 */}
      {VULVA_FACTS.map((f) => {
        const Icon = ICONS[f.icon] ?? Heart;
        return (
          <div key={f.title} className="glass rounded-2xl p-4">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-rose-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-300/15 text-rose-300">
                <Icon size={12} />
              </span>
              {f.title}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-white/60">{f.content}</p>
          </div>
        );
      })}

      <p className="pb-2 text-center text-[10px] leading-relaxed text-white/25">
        观察自己的身体不是羞耻的事 —— 认识它，是照顾它的第一步
      </p>
    </div>
  );
}
