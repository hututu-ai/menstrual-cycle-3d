import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  Float,
  Sparkles,
  Environment,
  Lightformer,
  ContactShadows,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  endometriumThickness,
  follicleSize,
  corpusLuteumSize,
  eggJourney,
  menstrualFlow,
  cervicalMucus,
  phaseAt,
} from '../cycle/cycleData';

/* ---------------------------------- 工具 ---------------------------------- */

function makeRadialTexture(inner: string, mid: string, outer: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------- 几何轮廓 ---------------------------------- */

/** 子宫解剖轮廓：宫颈 → 峡部 → 宫体 → 宫底（圆润穹顶的梨形） */
const UTERUS_PROFILE: [number, number][] = [
  [0.001, 0], [0.16, 0.05], [0.19, 0.3], [0.18, 0.55], // 宫颈（窄）
  [0.22, 0.78], // 峡部
  [0.38, 1.05], [0.6, 1.35], [0.78, 1.7], // 宫体渐宽
  [0.9, 2.05], [0.94, 2.4], // 最宽处
  [0.88, 2.7], [0.72, 2.95], [0.48, 3.12], [0.22, 3.2], [0.001, 3.22], // 宫底圆穹顶
];

/** 子宫内膜轮廓：贴合宫腔壁的内衬（峡部以上） */
const ENDO_PROFILE: [number, number][] = [
  [0.001, 1.0], [0.16, 1.1], [0.32, 1.35], [0.46, 1.7],
  [0.56, 2.05], [0.58, 2.4], [0.5, 2.68], [0.28, 2.88], [0.001, 2.95],
];

function smoothProfile(pts: [number, number][], samples = 110): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return curve.getPoints(samples);
}

const RIGHT_TUBE_POINTS = [
  new THREE.Vector3(0.78, 2.52, 0),
  new THREE.Vector3(1.15, 2.7, 0.05),
  new THREE.Vector3(1.6, 2.58, 0.1),
  new THREE.Vector3(1.88, 2.18, 0.12),
];

const OVARY_R = new THREE.Vector3(2.05, 1.9, 0.12);
const OVARY_L = new THREE.Vector3(-2.05, 1.9, 0.12);
const FOLLICLE_POS = new THREE.Vector3(2.22, 2.08, 0.3);

/* ---------------------------------- 经血粒子（宫腔内壁 → 宫颈漏斗 → 阴道） ---------------------------------- */

function BloodParticles({ intensity }: { intensity: number }) {
  const count = 300;
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 0.42 * Math.sqrt(Math.random());
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 1.0 + Math.random() * 1.6; // 从宫腔内壁高度出发
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.55 + Math.random() * 0.9;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || intensity <= 0) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= data.speeds[i] * delta * (0.6 + intensity);
      // 进入宫颈（y < 0.9）后向中轴汇聚，形成漏斗
      if (arr[i * 3 + 1] < 0.9) {
        arr[i * 3] *= 1 - delta * 1.6;
        arr[i * 3 + 2] *= 1 - delta * 1.6;
      }
      if (arr[i * 3 + 1] < -1.75) {
        const r = 0.42 * Math.sqrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = 1.2 + Math.random() * 1.4;
        arr[i * 3 + 2] = Math.sin(a) * r;
      }
    }
    pos.needsUpdate = true;
  });

  if (intensity <= 0) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ff4d6e"
        size={0.07}
        transparent
        opacity={0.95 * intensity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------------------------- 内膜剥脱碎片（经期时从内膜表面崩落） ---------------------------------- */

function SheddingFragments({ intensity }: { intensity: number }) {
  const count = 90;
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // 贴在内膜壁附近
      const a = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 0.16;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 1.3 + Math.random() * 1.3;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.22 + Math.random() * 0.35;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, seeds };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!ref.current || intensity <= 0) return;
    const t = clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= data.speeds[i] * delta * (0.5 + intensity * 0.8);
      arr[i * 3] += Math.sin(t * 2.2 + data.seeds[i]) * delta * 0.06; // 崩落时轻微摇摆
      if (arr[i * 3 + 1] < 0.85) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.3 + Math.random() * 0.16;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = 1.4 + Math.random() * 1.2;
        arr[i * 3 + 2] = Math.sin(a) * r;
      }
    }
    pos.needsUpdate = true;
  });

  if (intensity <= 0) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c2143f"
        size={0.12}
        transparent
        opacity={0.9 * intensity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ---------------------------------- 排卵破裂光环 ---------------------------------- */

function OvulationBurst({ day }: { day: number }) {
  const p = (day - 14) / 0.9;
  if (p < 0 || p > 1) return null;
  const s = 0.25 + p * 1.5;
  const opacity = (1 - p) * 0.95;
  return (
    <group position={FOLLICLE_POS}>
      <mesh>
        <ringGeometry args={[0.16, 0.2, 48]} />
        <meshBasicMaterial
          color="#ffd6e6"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* 放射小碎片 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const d = 0.1 + p * 0.55;
        return (
          <mesh key={i} position={[Math.cos(a) * d, Math.sin(a) * d, 0]} scale={s * 0.16}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshBasicMaterial
              color="#ffe9a8"
              transparent
              opacity={opacity * 0.9}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------------------------------- 魔环光晕 ---------------------------------- */

function HaloRing({ radius, color, tilt, speed, opacity }: {
  radius: number; color: string; tilt: number; speed: number; opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]} position={[0, 1.1, 0]}>
      <torusGeometry args={[radius, 0.012, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ---------------------------------- 标签 ---------------------------------- */

function Tag({
  position,
  text,
  color = '#f9a8d4',
}: {
  position: [number, number, number];
  text: string;
  color?: string;
}) {
  return (
    <Html position={position} center distanceFactor={9.5} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none select-none whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium tracking-wide backdrop-blur-xl"
        style={{
          border: `1px solid ${color}40`,
          color,
          background: 'rgba(20, 9, 16, 0.6)',
          boxShadow: `0 0 24px ${color}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
          textShadow: `0 0 12px ${color}80`,
        }}
      >
        {text}
      </div>
    </Html>
  );
}

/* ---------------------------------- 解剖模型 ---------------------------------- */

function Anatomy({ day, showLabels }: { day: number; showLabels: boolean }) {
  const thickness = endometriumThickness(day);
  const flow = menstrualFlow(day);
  const follicle = follicleSize(day);
  const luteum = corpusLuteumSize(day);
  const egg = eggJourney(day);
  const phase = phaseAt(day);
  const mucus = cervicalMucus(day);

  const breathRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (breathRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.1) * 0.008;
      breathRef.current.scale.setScalar(s);
    }
  });

  const uterusGeo = useMemo(
    () => new THREE.LatheGeometry(smoothProfile(UTERUS_PROFILE), 96),
    []
  );

  const endoGeo = useMemo(
    () => new THREE.LatheGeometry(smoothProfile(ENDO_PROFILE, 90), 72),
    []
  );

  const endoScale = 0.32 + thickness * 0.88;

  const tubeGeoR = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(RIGHT_TUBE_POINTS), 64, 0.055, 16, false),
    []
  );
  const tubeGeoL = useMemo(() => {
    const pts = RIGHT_TUBE_POINTS.map((p) => new THREE.Vector3(-p.x, p.y, p.z));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.055, 16, false);
  }, []);

  const glowTex = useMemo(
    () => makeRadialTexture('rgba(255,214,226,0.9)', 'rgba(244,114,142,0.28)', 'rgba(244,114,142,0)'),
    []
  );
  const eggGlowTex = useMemo(
    () => makeRadialTexture('rgba(255,244,214,1)', 'rgba(255,214,150,0.35)', 'rgba(255,214,150,0)'),
    []
  );
  const cavityGlowTex = useMemo(
    () => makeRadialTexture('rgba(255,120,160,0.55)', 'rgba(200,40,90,0.2)', 'rgba(200,40,90,0)'),
    []
  );

  const eggPos = useMemo(() => {
    if (!egg.visible) return null;
    if (egg.t < 0) return FOLLICLE_POS.clone();
    return new THREE.CatmullRomCurve3(RIGHT_TUBE_POINTS).getPoint(1 - egg.t);
  }, [egg.visible, egg.t]);

  const ovaryMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f2c49a',
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.3,
        transmission: 0.45,
        thickness: 0.5,
        sheen: 0.6,
        sheenColor: new THREE.Color('#ffd9c2'),
        transparent: true,
        opacity: 0.78,
      }),
    []
  );

  /** 卵巢内部的小卵泡（含发光质感） */
  const smallFollicles = useMemo(() => {
    const arr: { pos: [number, number, number]; r: number }[] = [];
    let s = 42;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    [
      { c: OVARY_L, n: 5 },
      { c: OVARY_R, n: 4 },
    ].forEach(({ c, n }) => {
      for (let i = 0; i < n; i++) {
        const a = rand() * Math.PI * 2;
        const b = rand() * Math.PI;
        arr.push({
          pos: [
            c.x + Math.sin(b) * Math.cos(a) * 0.3,
            c.y + Math.cos(b) * 0.24,
            c.z + Math.sin(b) * Math.sin(a) * 0.26,
          ],
          r: 0.055 + rand() * 0.035,
        });
      }
    });
    return arr;
  }, []);

  const isMenstrual = phase.id === 'menstrual';

  return (
    <group ref={breathRef}>
      {/* 子宫壁 —— 半透明琉璃质感，可以直接看见腔内的内膜 */}
      <mesh geometry={uterusGeo}>
        <meshPhysicalMaterial
          color="#f7a8bd"
          roughness={0.18}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.2}
          transmission={0.55}
          thickness={0.9}
          ior={1.35}
          attenuationColor="#e2547a"
          attenuationDistance={1.6}
          sheen={0.8}
          sheenColor={new THREE.Color('#ffd1dc')}
          iridescence={0.3}
          iridescenceIOR={1.2}
          emissive="#6b1530"
          emissiveIntensity={0.5}
          transparent
          opacity={0.52}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 宫腔内辉光（随内膜厚度与经期呼吸） */}
      <sprite position={[0, 1.95, 0]} scale={[1.9, 2.4, 1]}>
        <spriteMaterial
          map={cavityGlowTex}
          transparent
          opacity={0.16 + thickness * 0.22 + flow * 0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* 子宫内膜 —— 隔着宫壁可见，随周期增厚 / 经期剥落变薄 */}
      <mesh geometry={endoGeo} scale={[endoScale, 1, endoScale]}>
        <meshPhysicalMaterial
          color={isMenstrual ? '#a1123a' : '#f0567f'}
          roughness={0.32}
          clearcoat={0.5}
          emissive={isMenstrual ? '#8f1032' : '#9c1b47'}
          emissiveIntensity={isMenstrual ? 1.35 : 0.95}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* 经期：内膜崩落碎片 + 经血粒子流 */}
      <SheddingFragments intensity={flow} />
      <BloodParticles intensity={flow} />

      {/* 经血通道微光（阴道内） */}
      {flow > 0.05 && (
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 1.5, 20, 1, true]} />
          <meshBasicMaterial
            color="#e11d48"
            transparent
            opacity={0.3 * flow}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 阴道 */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.17, 0.21, 1.35, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ea8aa3"
          roughness={0.3}
          clearcoat={0.6}
          emissive="#571224"
          emissiveIntensity={0.5}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 宫颈黏液（湿润期可见；排卵期变蛋清样透明拉丝） */}
      {mucus.level >= 2 && (
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[mucus.level === 3 ? 0.13 : 0.1, 24, 18]} />
          <meshPhysicalMaterial
            color={mucus.level === 3 ? '#d8f6ff' : '#f7efe6'}
            roughness={mucus.level === 3 ? 0.08 : 0.35}
            clearcoat={1}
            transmission={mucus.level === 3 ? 0.5 : 0.1}
            transparent
            opacity={mucus.level === 3 ? 0.85 : 0.4}
            emissive={mucus.level === 3 ? '#8fd8f0' : '#000000'}
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {/* 输卵管 */}
      <mesh geometry={tubeGeoR}>
        <meshPhysicalMaterial color="#f2a9ba" roughness={0.3} clearcoat={0.6} transparent opacity={0.85} />
      </mesh>
      <mesh geometry={tubeGeoL}>
        <meshPhysicalMaterial color="#f2a9ba" roughness={0.3} clearcoat={0.6} transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.93, 2.14, 0.12]} rotation={[0, 0, -1.15]}>
        <coneGeometry args={[0.14, 0.22, 24, 1, true]} />
        <meshPhysicalMaterial color="#f2a9ba" roughness={0.3} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-1.93, 2.14, 0.12]} rotation={[0, 0, 1.15]}>
        <coneGeometry args={[0.14, 0.22, 24, 1, true]} />
        <meshPhysicalMaterial color="#f2a9ba" roughness={0.3} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* 卵巢（半透明，可见内部卵泡） */}
      <mesh position={OVARY_R} scale={[1, 0.78, 0.72]} material={ovaryMat}>
        <sphereGeometry args={[0.44, 48, 36]} />
      </mesh>
      <mesh position={OVARY_L} scale={[1, 0.78, 0.72]} material={ovaryMat}>
        <sphereGeometry args={[0.44, 48, 36]} />
      </mesh>

      {/* 卵巢内的小卵泡 */}
      {smallFollicles.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <sphereGeometry args={[f.r, 20, 14]} />
          <meshPhysicalMaterial
            color="#ffe3ee"
            roughness={0.15}
            clearcoat={0.9}
            transparent
            opacity={0.92}
            emissive="#ffb9cd"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}

      {/* 优势卵泡（右卵巢表面，逐渐长大） */}
      {follicle > 0 && (
        <mesh position={FOLLICLE_POS}>
          <sphereGeometry args={[follicle, 32, 24]} />
          <meshPhysicalMaterial
            color="#ffe6ee"
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.12}
            transmission={0.3}
            transparent
            opacity={0.94}
            emissive="#ffb9cd"
            emissiveIntensity={0.7}
          />
        </mesh>
      )}

      {/* 排卵破裂爆发 */}
      <OvulationBurst day={day} />

      {/* 黄体 */}
      {luteum > 0 && (
        <mesh position={FOLLICLE_POS}>
          <sphereGeometry args={[luteum, 32, 24]} />
          <meshPhysicalMaterial
            color="#f7b93e"
            roughness={0.35}
            clearcoat={0.5}
            emissive="#c07f08"
            emissiveIntensity={1.0}
          />
        </mesh>
      )}

      {/* 卵子 + 光晕 */}
      {eggPos && (
        <group position={eggPos}>
          <mesh>
            <sphereGeometry args={[0.085, 24, 18]} />
            <meshStandardMaterial
              color="#fff6e3"
              roughness={0.15}
              emissive="#ffe4ae"
              emissiveIntensity={2.4}
              transparent
              opacity={egg.opacity}
            />
          </mesh>
          <sprite scale={[0.65, 0.65, 1]}>
            <spriteMaterial
              map={eggGlowTex}
              color="#ffdf9e"
              transparent
              opacity={0.95 * egg.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      )}

      {/* 标签 */}
      {showLabels && (
        <>
          <Tag position={[1.35, 2.95, 0.3]} text="子宫" />
          <Tag position={[1.18, 1.72, 0.35]} text="子宫内膜" color="#fb8ba7" />
          <Tag position={[-2.15, 2.62, 0.1]} text="卵巢" color="#fcd34d" />
          <Tag position={[-1.32, 3.02, 0.1]} text="输卵管" color="#f9a8d4" />
          {follicle > 0.14 && <Tag position={[2.72, 2.78, 0.35]} text="优势卵泡" color="#a5f3fc" />}
          {luteum > 0.15 && <Tag position={[2.72, 2.78, 0.35]} text="黄体" color="#fcd34d" />}
          {egg.visible && egg.t >= 0 && egg.t < 1 && (
            <Tag position={[eggPos!.x, eggPos!.y + 0.45, eggPos!.z]} text="卵子" color="#fde68a" />
          )}
          {flow > 0.05 && <Tag position={[1.05, -0.85, 0.2]} text="经血排出" color="#fb8ba7" />}
          {mucus.level === 3 && <Tag position={[0.62, 0.42, 0.2]} text="蛋清样宫颈黏液" color="#a5f3fc" />}
          <Tag position={[0, -1.8, 0]} text="阴道" color="#c4b5fd" />
        </>
      )}

      {/* 底部玫瑰光晕 */}
      <mesh position={[0, -2.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 8.5]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------- 场景 ---------------------------------- */

export default function CycleScene({ day, showLabels }: { day: number; showLabels: boolean }) {
  const phase = phaseAt(day);
  const stageGlowTex = useMemo(
    () => makeRadialTexture('rgba(244,114,142,0.55)', 'rgba(167,139,250,0.18)', 'rgba(20,9,16,0)'),
    []
  );
  return (
    <Canvas
      camera={{ position: [0.3, 1.6, 6.7], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 6]} intensity={1.25} color="#fff1f2" />
      <directionalLight position={[-4, 2, 5]} intensity={0.65} color="#d8b4fe" />
      {/* 相位色补光：灯光随周期阶段变换颜色 */}
      <pointLight position={[0, 1.6, 1.8]} intensity={1.0} color={phase.color} />

      {/* 舞台背景光晕 */}
      <mesh position={[0, 0.6, -6]}>
        <planeGeometry args={[30, 17]} />
        <meshBasicMaterial
          map={stageGlowTex}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 程序化妆环境光（无需外部 HDR） */}
      <Environment resolution={256}>
        <group>
          <Lightformer intensity={2.4} position={[0, 5, -6]} scale={[10, 6, 1]} color="#ffe1e8" />
          <Lightformer intensity={1.6} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#f472b6" />
          <Lightformer intensity={1.4} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#a78bfa" />
          <Lightformer intensity={0.9} position={[0, -4, 2]} scale={[8, 2, 1]} color="#7c2d4e" />
        </group>
      </Environment>

      <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.22}>
        <group position={[0, -0.62, 0]} scale={1.05}>
          <Anatomy day={day} showLabels={showLabels} />
          {/* 魔环光晕 */}
          <HaloRing radius={3.0} color="#f9a8d4" tilt={1.25} speed={0.06} opacity={0.14} />
          <HaloRing radius={3.35} color="#c4b5fd" tilt={1.85} speed={-0.045} opacity={0.08} />
        </group>
      </Float>

      <ContactShadows position={[0, -2.7, 0]} opacity={0.5} scale={11} blur={2.8} far={4.5} color="#2b0716" />
      <Sparkles count={90} scale={[10, 7, 7]} size={1.8} speed={0.22} opacity={0.4} color="#f9a8d4" />
      <Sparkles count={40} scale={[12, 8, 8]} size={2.6} speed={0.15} opacity={0.25} color="#c4b5fd" />

      <OrbitControls
        target={[0, 0.55, 0]}
        enablePan={false}
        minDistance={3.4}
        maxDistance={11}
        maxPolarAngle={Math.PI * 0.72}
        autoRotate
        autoRotateSpeed={0.45}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.24} intensity={0.48} mipmapBlur radius={0.72} />
        <Vignette offset={0.22} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
}
