import { useEffect, useRef, useState } from 'react';
import CycleScene from '../components/CycleScene';
import PhasePanel from '../components/PhasePanel';
import TimelineControls from '../components/TimelineControls';
import { CYCLE_DAYS, phaseAt } from '../cycle/cycleData';
import { Tag, MousePointer2, BookOpen, Venus, Sparkle, Layers, Gem } from 'lucide-react';
import KnowledgeBase from '../components/KnowledgeBase';
import VulvaScene, { type VulvaLayer } from '../components/VulvaScene';
import VulvaPanel from '../components/VulvaPanel';

type ViewMode = 'internal' | 'vulva';

export default function Home() {
  const [day, setDay] = useState(() => {
    const d = parseFloat(new URLSearchParams(window.location.search).get('day') ?? '');
    return Number.isFinite(d) ? Math.min(28, Math.max(1, d)) : 1;
  });
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [kbOpen, setKbOpen] = useState(false);
  const [view, setView] = useState<ViewMode>(() => {
    const v = new URLSearchParams(window.location.search).get('view');
    return v === 'vulva' ? 'vulva' : 'internal';
  });
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [vulvaLayer, setVulvaLayer] = useState<VulvaLayer>('surface');
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const phase = phaseAt(day);

  // 播放循环：1x ≈ 每秒推进 1.4 天（dt 钳制，防止后台/卡顿后天数瞬移）
  useEffect(() => {
    if (!playing) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      setDay((d) => {
        const next = d + dt * 1.4 * speed;
        return next > CYCLE_DAYS + 0.5 ? 1 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed]);

  // 调试钩子：e2e 截图可精确定位天数
  useEffect(() => {
    (window as unknown as { __cycleSetDay?: (d: number) => void }).__cycleSetDay = setDay;
  }, []);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 32% 30%, rgba(244,63,94,0.14), transparent 62%), radial-gradient(ellipse 55% 50% at 78% 75%, rgba(167,139,250,0.11), transparent 60%), linear-gradient(160deg, #18090f 0%, #120710 55%, #0d060c 100%)',
      }}
    >
      {/* 顶栏 */}
      <header className="relative z-20 flex items-center justify-between px-7 py-4">
        <div>
          <h1 className="font-display text-[19px] font-bold tracking-wide">
            月经周期
            <span className="ml-2 bg-gradient-to-r from-rose-300 via-rose-400 to-violet-400 bg-clip-text font-semibold text-transparent">
              3D 互动科普
            </span>
          </h1>
          <p className="mt-0.5 text-[11px] tracking-wide text-white/40">
            经血是如何生成的 · 28 天里女性身体究竟在发生什么
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKbOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-1.5 text-[12px] text-amber-300 backdrop-blur-md transition-all hover:bg-amber-300/20"
          >
            <BookOpen size={13} />
            科普知识库
          </button>
          <button
            onClick={() => setShowLabels((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] backdrop-blur-md transition-all"
            style={{
              borderColor: showLabels ? 'rgba(251,113,133,0.4)' : 'rgba(255,255,255,0.1)',
              background: showLabels ? 'rgba(251,113,133,0.1)' : 'rgba(255,255,255,0.03)',
              color: showLabels ? '#fda4af' : 'rgba(255,255,255,0.5)',
            }}
          >
            <Tag size={13} />
            部位标注
          </button>
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-white/40 md:flex">
            <MousePointer2 size={13} />
            拖动旋转 · 滚轮缩放
          </div>
        </div>
      </header>

      {/* 主区域 */}
      <div className="relative z-10 flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          {view === 'internal' && <CycleScene day={day} showLabels={showLabels} />}
          {view === 'vulva' && (
            <VulvaScene
              showLabels={showLabels}
              selected={selectedPart}
              onSelect={setSelectedPart}
              layer={vulvaLayer}
            />
          )}

          {/* 外阴图层切换：表层解剖 / 阴蒂全貌 */}
          {view === 'vulva' && (
            <div className="absolute bottom-6 left-6 flex overflow-hidden rounded-full border border-white/10 bg-[#140910]/70 backdrop-blur-xl">
              {(
                [
                  { id: 'surface', label: '表层解剖', icon: Layers },
                  { id: 'clitoris', label: '阴蒂全貌 · 冰山之下', icon: Gem },
                ] as const
              ).map((l) => {
                const active = vulvaLayer === l.id;
                const Icon = l.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setVulvaLayer(l.id);
                      setSelectedPart(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-[12px] transition-all"
                    style={{
                      background: active ? 'rgba(244,114,182,0.15)' : 'transparent',
                      color: active ? '#f9a8d4' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    <Icon size={13} />
                    {l.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 视图切换 */}
          <div className="absolute left-1/2 top-2 flex -translate-x-1/2 overflow-hidden rounded-full border border-white/10 bg-[#140910]/70 backdrop-blur-xl">
            {(
              [
                { id: 'internal', label: '内部器官 · 周期', icon: Sparkle },
                { id: 'vulva', label: '认识外阴', icon: Venus },
              ] as const
            ).map((v) => {
              const active = view === v.id;
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setView(v.id);
                    setSelectedPart(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-[12px] transition-all"
                  style={{
                    background: active ? 'rgba(251,113,133,0.15)' : 'transparent',
                    color: active ? '#fda4af' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <Icon size={13} />
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* 大字天数覆盖层（仅周期视图） */}
          {view === 'internal' && (
            <div className="pointer-events-none absolute left-7 top-14 select-none">
              <div
                className="tabular font-display leading-none transition-colors duration-500"
                style={{
                  fontSize: 'clamp(64px, 9vw, 110px)',
                  fontWeight: 900,
                  color: 'transparent',
                  WebkitTextStroke: `1.5px ${phase.color}55`,
                  textShadow: `0 0 60px ${phase.color}30`,
                }}
              >
                {String(Math.floor(day)).padStart(2, '0')}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full glow-pulse"
                  style={{ background: phase.color, boxShadow: `0 0 12px ${phase.color}` }}
                />
                <span className="font-display text-[15px] font-semibold tracking-wider" style={{ color: phase.color }}>
                  {phase.name}
                </span>
                <span className="text-[11px] text-white/35">第 {Math.floor(day)} 天 / 共 28 天</span>
              </div>
            </div>
          )}

          {/* 悬浮式时间轴（仅周期视图）：一生激素长卷 + 28 天周期 */}
          {view === 'internal' && (
            <TimelineControls
              day={day}
              playing={playing}
              speed={speed}
              onDayChange={setDay}
              onTogglePlay={() => setPlaying((p) => !p)}
              onSpeedChange={setSpeed}
              onReset={() => setDay(1)}
            />
          )}
        </main>

        {/* 右侧信息面板 */}
        <aside
          className="w-[392px] shrink-0 border-l border-white/[0.07] backdrop-blur-2xl max-lg:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(24,10,18,0.72), rgba(16,8,14,0.82))' }}
        >
          {view === 'internal' && (
            <PhasePanel day={day} onJumpTo={(d) => setDay(d)} />
          )}
          {view === 'vulva' && <VulvaPanel />}
        </aside>
      </div>

      {/* 科普知识库抽屉 */}
      <KnowledgeBase open={kbOpen} onClose={() => setKbOpen(false)} />
    </div>
  );
}
