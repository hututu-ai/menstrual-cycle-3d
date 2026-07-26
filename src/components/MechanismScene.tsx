import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Environment, Lightformer, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ---------------- 动画时间轴（16 秒一个循环） ---------------- */

const LOOP = 16;

const STEPS = [
  { title: '① 激素支持', desc: '雌 / 孕激素维持内膜丰厚，螺旋动脉畅通供血' },
  { title: '② 激素撤退', desc: '未受孕 → 黄体退化 → 激素水平骤降' },
  { title: '③ 动脉痉挛', desc: '螺旋动脉剧烈收缩，内膜缺血缺氧' },
  { title: '④ 坏死剥脱 · 经血排出', desc: '功能层碎裂，碎片与血液经宫颈、阴道排出 = 月经' },
  { title: '⑤ 修复再生', desc: '雌激素回升，内膜从基底层重新开始生长' },
];

function stepOf(f: number): number {
  if (f < 0.25) return 0;
  if (f < 0.45) return 1;
  if (f < 0.55) return 2;
  if (f < 0.8) return 3;
  return 4;
}

/** 动脉通畅度 0.25–1 */
function opennessOf(f: number): number {
  if (f < 0.25) return 1;
  if (f < 0.45) return 1 - ((f - 0.25) / 0.2) * 0.75;
  if (f < 0.8) return 0.25;
  if (f < 0.95) return 0.25 + ((f - 0.8) / 0.15) * 0.75;
  return 1;
}

/** 内膜健康度（颜色）0.25–1 */
function healthOf(f: number): number {
  if (f < 0.4) return 1;
  if (f < 0.58) return 1 - ((f - 0.4) / 0.18) * 0.75;
  if (f < 0.8) return 0.25;
  if (f < 0.95) return 0.25 + ((f - 0.8) / 0.15) * 0.75;
  return 1;
}

/** 功能层厚度比例 0.3–1 */
function thickOf(f: number): number {
  if (f < 0.55) return 1;
  if (f < 0.78) return 1 - ((f - 0.55) / 0.23) * 0.7;
  if (f < 0.85) return 0.3;
  return Math.min(1, 0.3 + ((f - 0.85) / 0.15) * 0.7);
}

/** 剥脱进度 0–1（仅剥脱窗口内） */
function shedOf(f: number): number {
  if (f < 0.55) return 0;
  if (f > 0.8) return 1;
  return (f - 0.55) / 0.25;
}

/* ---------------- 螺旋动脉曲线 ---------------- */

class HelixCurve extends THREE.Curve<THREE.Vector3> {
  private h: number;
  private r: number;
  private turns: number;
  private base: THREE.Vector3;

  constructor(h: number, r: number, turns: number, base: THREE.Vector3) {
    super();
    this.h = h;
    this.r = r;
    this.turns = turns;
    this.base = base;
  }
  override getPoint(t: number): THREE.Vector3 {
    const a = this.turns * Math.PI * 2 * t;
    const rr = this.r * (0.6 + t * 0.4);
    return new THREE.Vector3(
      this.base.x + Math.cos(a) * rr,
      this.base.y + t * this.h,
      this.base.z + Math.sin(a) * rr
    );
  }
}

/* ---------------- 场景内容 ---------------- */

const FUNC_BOTTOM = -0.6; // 功能层底部
const FUNC_H = 1.8; // 功能层满厚度
const FUNC_TOP = FUNC_BOTTOM + FUNC_H; // 1.2

const BRIGHT = new THREE.Color('#e8557f');
const NECROTIC = new THREE.Color('#6e1c34');
const ARTERY_RED = new THREE.Color('#e11d48');
const ARTERY_DARK = new THREE.Color('#5c1420');

function Tissue() {
  const funcMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e8557f',
        roughness: 0.55,
        clearcoat: 0.3,
        emissive: '#5e1226',
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );
  const arteryMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e11d48',
        roughness: 0.4,
        emissive: '#7f0f28',
        emissiveIntensity: 1.4,
      }),
    []
  );

  const funcRef = useRef<THREE.Mesh>(null);
  const arteryGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const fragRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bloodRef = useRef<THREE.Points>(null);

  const arteryGeos = useMemo(
    () =>
      [-1.5, 0, 1.5].map(
        (x) =>
          new THREE.TubeGeometry(
            new HelixCurve(FUNC_TOP + 0.75, 0.16, 4, new THREE.Vector3(x, -2.05, 0)),
            120,
            0.05,
            8,
            false
          )
      ),
    []
  );

  // 功能层表面碎片（剥脱的内膜组织）
  const fragments = useMemo(() => {
    let s = 7;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: 14 }, (_, i) => ({
      x: -2.2 + (i % 7) * 0.72 + rand() * 0.2,
      z: -0.6 + rand() * 1.2,
      size: 0.16 + rand() * 0.12,
      delay: (i / 14) * 0.55,
      spin: rand() * 4 - 2,
      drift: rand() * 1.4 - 0.7,
    }));
  }, []);

  // 血液粒子
  const blood = useMemo(() => {
    const count = 320;
    let s = 99;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const spawn = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const offset = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      spawn[i * 3] = -2.4 + rand() * 4.8;
      spawn[i * 3 + 1] = FUNC_TOP + 0.05;
      spawn[i * 3 + 2] = -0.5 + rand() * 1.0;
      vel[i * 3] = (rand() - 0.5) * 0.4;
      vel[i * 3 + 1] = -(1.6 + rand() * 1.6);
      vel[i * 3 + 2] = 1.0 + rand() * 1.4;
      offset[i] = rand();
    }
    return { count, spawn, vel, offset, positions: new Float32Array(count * 3) };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const f = (t % LOOP) / LOOP;
    const open = opennessOf(f);
    const health = healthOf(f);
    const thick = thickOf(f);
    const shed = shedOf(f);

    // 功能层：厚度 + 颜色
    if (funcRef.current) {
      funcRef.current.scale.y = thick;
      funcRef.current.position.y = FUNC_BOTTOM + (FUNC_H * thick) / 2;
      funcMat.color.lerpColors(BRIGHT, NECROTIC, 1 - health);
      funcMat.emissiveIntensity = 0.2 + health * 0.4;
    }

    // 螺旋动脉：收缩 + 变暗 + 痉挛抖动
    arteryMat.color.lerpColors(ARTERY_RED, ARTERY_DARK, 1 - open);
    arteryMat.emissiveIntensity = 0.25 + open * 0.9;
    arteryGroupRefs.current.forEach((g) => {
      if (!g) return;
      const spasm = open < 0.7 ? Math.sin(t * 14) * 0.05 : 0;
      const s = 0.7 + open * 0.3 + spasm;
      g.scale.set(s, 1, s);
    });

    // 碎片：剥脱窗口内脱落
    fragRefs.current.forEach((m, i) => {
      if (!m) return;
      const frag = fragments[i];
      const local = THREE.MathUtils.clamp((shed - frag.delay) / 0.45, 0, 1);
      if (local <= 0) {
        m.position.set(frag.x, FUNC_TOP + 0.08, frag.z);
        m.rotation.set(0, 0, 0);
        m.visible = shed < 1;
      } else {
        m.position.set(
          frag.x + frag.drift * local,
          FUNC_TOP + 0.08 - local * 3.3,
          frag.z + local * 2.1
        );
        m.rotation.set(local * frag.spin, local * frag.spin * 0.7, 0);
        m.visible = local < 0.92;
      }
    });

    // 血液粒子
    if (bloodRef.current) {
      const active = f > 0.55 && f < 0.82;
      bloodRef.current.visible = active;
      if (active) {
        const arr = blood.positions;
        const span = 0.82 - 0.55;
        for (let i = 0; i < blood.count; i++) {
          const start = 0.55 + blood.offset[i] * span * 0.75;
          const age = (f - start) / span;
          if (age <= 0) {
            arr[i * 3 + 1] = -999;
            continue;
          }
          arr[i * 3] = blood.spawn[i * 3] + blood.vel[i * 3] * age * 2.2;
          arr[i * 3 + 1] = blood.spawn[i * 3 + 1] + blood.vel[i * 3 + 1] * age * 2.2;
          arr[i * 3 + 2] = blood.spawn[i * 3 + 2] + blood.vel[i * 3 + 2] * age * 2.2;
        }
        const attr = bloodRef.current.geometry.attributes.position as THREE.BufferAttribute;
        (attr.array as Float32Array).set(arr);
        attr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* 子宫肌层 */}
      <mesh position={[0, -1.55, 0]}>
        <boxGeometry args={[5.4, 0.9, 2.4]} />
        <meshPhysicalMaterial color="#7e2942" roughness={0.7} transparent opacity={0.88} />
      </mesh>
      {/* 基底层 */}
      <mesh position={[0, -0.85, 0]}>
        <boxGeometry args={[5.4, 0.5, 2.4]} />
        <meshPhysicalMaterial color="#b8465f" roughness={0.6} clearcoat={0.2} transparent opacity={0.85} />
      </mesh>
      {/* 功能层（厚度与颜色随阶段变化） */}
      <mesh ref={funcRef} material={funcMat}>
        <boxGeometry args={[5.4, FUNC_H, 2.4]} />
      </mesh>

      {/* 螺旋动脉 */}
      {arteryGeos.map((g, i) => (
        <group
          key={i}
          ref={(el) => {
            arteryGroupRefs.current[i] = el;
          }}
        >
          <mesh geometry={g} material={arteryMat} />
        </group>
      ))}

      {/* 剥脱碎片 */}
      {fragments.map((frag, i) => (
        <mesh
          key={i}
          ref={(el) => {
            fragRefs.current[i] = el;
          }}
          position={[frag.x, FUNC_TOP + 0.08, frag.z]}
        >
          <boxGeometry args={[frag.size, frag.size * 0.7, frag.size]} />
          <meshStandardMaterial color="#a12c4c" roughness={0.7} emissive="#4a0f1e" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* 经血粒子 */}
      <points ref={bloodRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[blood.positions.slice(), 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ff4d6d"
          size={0.08}
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 标注 */}
      <Html position={[3.15, 0.3, 0]} center distanceFactor={10} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full border border-rose-300/40 bg-[#140910]/70 px-2.5 py-1 text-[10px] text-rose-300 backdrop-blur-md">
          功能层（会剥脱的部分）
        </div>
      </Html>
      <Html position={[3.15, -0.85, 0]} center distanceFactor={10} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-[#140910]/70 px-2.5 py-1 text-[10px] text-white/60 backdrop-blur-md">
          基底层（不剥脱）
        </div>
      </Html>
      <Html position={[-1.5, -2.6, 0.3]} center distanceFactor={10} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap rounded-full border border-red-400/40 bg-[#140910]/70 px-2.5 py-1 text-[10px] text-red-300 backdrop-blur-md">
          螺旋动脉
        </div>
      </Html>
    </group>
  );
}

/* ---------------- 主场景（含步骤解说） ---------------- */

export default function MechanismScene() {
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const clockRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const f = (clockRef.current % LOOP) / LOOP;
      const s = stepOf(f);
      if (s !== stepRef.current) {
        stepRef.current = s;
        setStep(s);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0.6, 8.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ clock }) => {
          clockRef.current = clock.elapsedTime;
        }}
      >
        <ClockTracker clockRef={clockRef} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 6]} intensity={1.4} color="#fff1f2" />
        <directionalLight position={[-4, 2, 4]} intensity={0.6} color="#d8b4fe" />

        <Environment resolution={256}>
          <group>
            <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[10, 6, 1]} color="#ffe1e8" />
            <Lightformer intensity={1.4} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#f472b6" />
            <Lightformer intensity={1.2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#a78bfa" />
          </group>
        </Environment>

        <Tissue />

        <Sparkles count={50} scale={[10, 7, 6]} size={1.5} speed={0.2} opacity={0.3} color="#f9a8d4" />

        <OrbitControls target={[0, -0.2, 0]} enablePan={false} minDistance={5} maxDistance={13} maxPolarAngle={Math.PI * 0.68} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={0.5} mipmapBlur radius={0.7} />
          <Vignette offset={0.22} darkness={0.6} />
        </EffectComposer>
      </Canvas>

      {/* 步骤解说（HTML 覆盖层，不遮挡模型主体） */}
      <div className="pointer-events-none absolute left-6 top-3 w-[290px]">
        <div className="glass rounded-2xl p-4">
          <h3 className="font-display text-[15px] font-bold text-rose-300">经血是怎么产生的？</h3>
          <p className="mt-0.5 text-[10px] text-white/40">子宫壁横截面 · 循环演示</p>
          <ul className="mt-3 space-y-2">
            {STEPS.map((s, i) => {
              const active = i === step;
              return (
                <li
                  key={i}
                  className="rounded-xl border p-2.5 transition-all duration-500"
                  style={{
                    borderColor: active ? 'rgba(251,113,133,0.45)' : 'rgba(255,255,255,0.06)',
                    background: active ? 'rgba(251,113,133,0.1)' : 'rgba(255,255,255,0.02)',
                    opacity: active ? 1 : 0.55,
                  }}
                >
                  <div className="text-[12px] font-semibold" style={{ color: active ? '#fda4af' : 'rgba(255,255,255,0.6)' }}>
                    {s.title}
                  </div>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-white/55">{s.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// 把 R3F clock 同步给外层 React（步骤高亮）
function ClockTracker({ clockRef }: { clockRef: React.MutableRefObject<number> }) {
  useFrame(({ clock }) => {
    clockRef.current = clock.elapsedTime;
  });
  return null;
}
