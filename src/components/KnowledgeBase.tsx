import { X, AlertCircle, Lightbulb } from 'lucide-react';

interface Item {
  type: 'myth' | 'fact';
  title: string;
  content: string;
}

const ITEMS: Item[] = [
  {
    type: 'myth',
    title: '月经是身体在“排毒”？',
    content:
      '不是。经血 = 子宫内膜功能层碎片 + 血液 + 宫颈黏液，是激素撤退后的正常生理剥落，与“毒素”无关。经期不需要“排毒产品”。',
  },
  {
    type: 'fact',
    title: '经血里到底有什么？',
    content:
      '约一半是血液（动脉血为主，所以呈鲜红至暗红），其余是内膜组织碎片、宫颈黏液和阴道上皮细胞。正常经量 20–80 ml，超过 80 ml 建议就医排查。',
  },
  {
    type: 'myth',
    title: '月经周期必须是 28 天？',
    content:
      '21–35 天都算正常范围，关键是“规律”。本页面用 28 天只是教学模型。偶尔提前或推迟 7 天以内，通常无需担心。',
  },
  {
    type: 'fact',
    title: '排卵日怎么估算？',
    content:
      '排卵日 ≈ 下次月经来潮前 14 天（黄体期相对固定），而不是本次月经后第 14 天。所以周期 35 天的人，排卵大约在第 21 天。',
  },
  {
    type: 'myth',
    title: '经期同房不会怀孕？',
    content:
      '仍有小概率。精子在女性体内可存活 3–5 天，若周期短、排卵提前，经期末的同房可能“接上”排卵。安全期避孕并不可靠。',
  },
  {
    type: 'fact',
    title: '痛经的元凶是前列腺素',
    content:
      '经期子宫内膜释放前列腺素，促使子宫收缩排出经血。收缩过强会压迫血管造成缺血疼痛。布洛芬等药物正是通过抑制前列腺素合成来止痛。',
  },
  {
    type: 'myth',
    title: '经期不能洗头、运动、吃冰？',
    content:
      '都可以。温水洗头及时吹干即可；轻中度运动（散步、瑜伽）反而促进盆腔血液循环、缓解痛经；吃冰没有证据显示会伤害子宫，按个人舒适度来。',
  },
  {
    type: 'fact',
    title: 'PMS 经前综合征是真实的生理反应',
    content:
      '黄体后期雌/孕激素骤降，影响血清素等神经递质，导致情绪波动、乳房胀痛、水肿、失眠。这不是“矫情”，严重时可就医评估（PMDD）。',
  },
];

export default function KnowledgeBase({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩 */}
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      {/* 抽屉 */}
      <div
        className="fade-in relative flex h-full w-[min(460px,92vw)] flex-col border-l border-white/10 backdrop-blur-2xl"
        style={{ background: 'linear-gradient(180deg, rgba(30,13,22,0.92), rgba(18,8,15,0.95))' }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <h2 className="font-display text-[17px] font-bold">科普知识库</h2>
            <p className="mt-0.5 text-[11px] text-white/40">误区澄清 · 生理事实</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {ITEMS.map((item, i) => (
            <div key={i} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: item.type === 'myth' ? 'rgba(251,113,133,0.15)' : 'rgba(52,211,153,0.15)',
                    color: item.type === 'myth' ? '#fb7185' : '#34d399',
                  }}
                >
                  {item.type === 'myth' ? <AlertCircle size={12} /> : <Lightbulb size={12} />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-1.5 py-px text-[9px] font-semibold tracking-wide"
                      style={{
                        background: item.type === 'myth' ? 'rgba(251,113,133,0.12)' : 'rgba(52,211,153,0.12)',
                        color: item.type === 'myth' ? '#fb7185' : '#34d399',
                      }}
                    >
                      {item.type === 'myth' ? '常见误区' : '生理事实'}
                    </span>
                  </div>
                  <h3 className="mt-1 text-[13.5px] font-semibold text-white/90">{item.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
          <p className="pb-3 pt-1 text-center text-[10px] leading-relaxed text-white/25">
            内容仅供科普参考，不能替代专业医疗建议；如有经期异常、严重痛经等请咨询医生
          </p>
        </div>
      </div>
    </div>
  );
}
