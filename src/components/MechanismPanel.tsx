import { Droplet, HelpCircle, Layers, Activity } from 'lucide-react';

const CHAIN = [
  {
    title: '没有怀孕，是这一切的开关',
    content:
      '黄体期的子宫一直在等待受精卵。当卵巢确认没有受孕信号（没有 hCG），黄体的使命结束，开始退化 —— 它分泌的雌激素和孕激素随之断崖式下降。',
  },
  {
    title: '激素撤退 = 断了内膜的“后勤补给”',
    content:
      '子宫内膜功能层的丰厚状态完全依赖激素维持。激素骤降后，内膜失去支持，同时释放前列腺素等信号分子。',
  },
  {
    title: '螺旋动脉痉挛，内膜被“饿死”',
    content:
      '激素撤退引起螺旋动脉剧烈痉挛性收缩，功能层缺血、缺氧、坏死 —— 这就是痛经的生理起点之一（前列腺素同时刺激子宫收缩）。',
  },
  {
    title: '功能层剥脱，出血即成月经',
    content:
      '坏死的内膜碎裂脱落，小血管断裂出血。血液 + 内膜碎片 + 宫颈黏液一起经宫颈、阴道排出体外。几天后动脉修复、出血停止，新周期开始。',
  },
];

const FACTS = [
  {
    title: '经血里为什么有血块？',
    content:
      '身体本来准备了“抗凝系统”（纤溶酶）防止经血凝固。经量大、流速快时，纤溶酶“忙不过来”，就会形成小血块 —— 指甲盖大小的血块是正常的。',
  },
  {
    title: '颜色从鲜红到暗红、褐色？',
    content:
      '取决于血液在体内停留的时间：快速排出是鲜红色；在宫腔或阴道里停留氧化后变暗红、褐色。经期快结束时的褐色分泌物，就是“走得慢”的陈旧血液。',
  },
  {
    title: '经量多少算正常？',
    content:
      '整个经期 20–80 ml 都算正常（大约每天更换 3–5 片卫生巾）。超过 80 ml（1–2 小时就浸透一片、持续多天）或伴随大血块、头晕乏力，建议就医检查。',
  },
];

export default function MechanismPanel() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      {/* 引言 */}
      <div
        className="phase-in rounded-2xl border border-rose-300/25 p-4"
        style={{
          background: 'linear-gradient(155deg, rgba(251,113,133,0.12), rgba(255,255,255,0.02))',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
        }}
      >
        <h2 className="font-display text-[22px] font-bold text-rose-300" style={{ textShadow: '0 0 24px rgba(251,113,133,0.5)' }}>
          月经为什么会流血？
        </h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-white/85">
          一句话：<span className="font-semibold text-rose-200">激素撤退引发的内膜剥脱出血</span>。
          它不是“排毒”，而是一套精密策划的「拆了重建」工程 —— 左边 3D 模型正在循环演示全过程。
        </p>
      </div>

      {/* 因果链 */}
      <div className="glass rounded-2xl p-4">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">
          <Activity size={14} className="text-rose-300" />
          完整因果链
        </h3>
        <div className="mt-3 space-y-0">
          {CHAIN.map((c, i) => (
            <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {/* 连接线 */}
              {i < CHAIN.length - 1 && (
                <span className="absolute left-[7px] top-6 h-full w-px bg-gradient-to-b from-rose-400/40 to-transparent" />
              )}
              <span className="mt-1 h-[15px] w-[15px] shrink-0 rounded-full border border-rose-300/50 bg-rose-400/15 text-center text-[9px] leading-[13px] text-rose-300">
                {i + 1}
              </span>
              <div>
                <div className="text-[12.5px] font-semibold text-white/85">{c.title}</div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/55">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 常见疑问 */}
      {FACTS.map((f) => (
        <div key={f.title} className="glass rounded-2xl p-4">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-rose-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-300/15 text-rose-300">
              <HelpCircle size={12} />
            </span>
            {f.title}
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-white/60">{f.content}</p>
        </div>
      ))}

      {/* 层次小词典 */}
      <div className="glass rounded-2xl p-4">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">
          <Layers size={14} className="text-rose-300" />
          模型里的三层结构
        </h3>
        <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-white/55">
          <li><span className="font-semibold text-rose-300">功能层</span> —— 每月增厚、等待胚胎、最终剥脱的部分（经血的来源）</li>
          <li><span className="font-semibold text-rose-200/80">基底层</span> —— 不剥脱的“种子层”，经期后从它重新长出功能层</li>
          <li><span className="font-semibold text-rose-200/60">子宫肌层</span> —— 肌肉层，经期收缩排出经血（痛经时的“元凶”）</li>
          <li><span className="font-semibold text-red-300">螺旋动脉</span> —— 从肌层盘旋进入内膜的供血管道，痉挛与修复驱动了整个周期</li>
        </ul>
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[10px] text-white/25">
        <Droplet size={10} />
        月经是身体每月一次的自我更新，了解它 = 更懂自己
      </p>
    </div>
  );
}
