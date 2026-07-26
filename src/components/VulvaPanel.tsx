import { VULVA_FACTS } from '../cycle/vulvaData';
import { Eye, ShieldCheck, ArrowRight, Droplets, Heart, Hand } from 'lucide-react';

const ICONS: Record<string, typeof Eye> = {
  Eye,
  ShieldCheck,
  ArrowRight,
  Droplets,
  Heart,
  Hand,
};

export default function VulvaPanel() {
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
        <p className="mt-2 text-[11px] leading-relaxed text-white/40">
          点击模型上的部位标注，直接查看每个部位的讲解
        </p>
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
