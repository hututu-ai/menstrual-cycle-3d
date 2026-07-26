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

const UTERUS_PROFILE: [number, number][] = [
  [0.001, 0], [0.14, 0.02], [0.17, 0.2], [0.22, 0.42], [0.4, 0.75],
  [0.62, 1.15], [0.8, 1.55], [0.9, 1.9], [0.88, 2.2], [0.72, 2.45],
  [0.42, 2.6], [0.12, 2.68], [0.001, 2.7],
];

function smoothProfile(pts: [number, number][], samples = 110): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return curve.getPoints(samples);
}

const RIGHT_TUBE_POINTS = [
  new THREE.Vector3(0.5, 2.18, 0),
  new THREE.Vector3(1.0, 2.38, 0.05),
  new THREE.Vector3(1.5, 2.32, 0.1),
  new THREE.Vector3(1.85, 2.05, 0.12),
];

const OVARY_R = new THREE.Vector3(2.12, 1.82, 0.12);
const OVARY_L = new THREE.Vector3(-2.12, 1.82, 0.12);


/* ---------------------------------- 经血粒子 ---------------------------------- */

function BloodParticles({ intensity }: { intensity: number }) {
  const count = 260;
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 0.3 * Math.sqrt(Math.random());
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.5 + Math.random() * 1.8;
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
      if (arr[i * 3 + 1] < -1.7) {
        const r = 0.3 * Math.sqrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = 1.4 + Math.random() * 0.9;
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
        color="#ff5c7a"
        size={0.075}
        transparent
        opacity={0.95 * intensity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
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

  const endoGeo = useMemo(() => {
    const pts = UTERUS_PROFILE.map(([r, y]): [number, number] => [
      r <= 0.001 ? 0.001 : Math.max(0.02, r * 0.52),
      0.5 + y * 0.68,
    ]);
    return new THREE.LatheGeometry(smoothProfile(pts), 72);
  }, []);

  const endoScale = 0.35 + thickness * 0.75;

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

  const eggPos = useMemo(() => {
    if (!egg.visible) return null;
    if (egg.t < 0) return new THREE.Vector3(2.32, 1.98, 0.3);
    return new THREE.CatmullRomCurve3(RIGHT_TUBE_POINTS).getPoint(1 - egg.t);
  }, [egg.visible, egg.t]);

  const ovaryMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f0bd90',
        roughness: 0.38,
        clearcoat: 0.6,
        clearcoatRoughness: 0.4,
        sheen: 0.5,
        sheenColor: new THREE.Color('#ffd9c2'),
      }),
    []
  );

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
            c.x + Math.sin(b) * Math.cos(a) * 0.34,
            c.y + Math.cos(b) * 0.26,
            c.z + Math.sin(b) * Math.sin(a) * 0.28,
          ],
          r: 0.055 + rand() * 0.03,
        });
      }
    });
    return arr;
  }, []);

  return (
    <group ref={breathRef}>
      {/* 子宫壁 —— 果冻感生物组织 */}
      <mesh geometry={uterusGeo}>
        <meshPhysicalMaterial
          color="#f28ba4"
          roughness={0.25}
          metalness={0}
          clearcoat={0.9}
          clearcoatRoughness={0.25}
          transmission={0.3}
          thickness={1.2}
          ior={1.3}
          attenuationColor="#e2547a"
          attenuationDistance={1.8}
          sheen={0.7}
          sheenColor={new THREE.Color('#ffd1dc')}
          iridescence={0.25}
          iridescenceIOR={1.2}
          emissive="#5e1226"
          emissiveIntensity={0.55}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 子宫内膜 */}
      <mesh geometry={endoGeo} scale={[endoScale, 1, endoScale]}>
        <meshStandardMaterial
          color={phase.id === 'menstrual' ? '#a1123a' : '#e14b7e'}
          roughness={0.42}
          emissive={phase.id === 'menstrual' ? '#8f1032' : '#6e1338'}
          emissiveIntensity={phase.id === 'menstrual' ? 1.4 : 1.0}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* 阴道 */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 1.35, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ea8aa3"
          roughness={0.3}
          clearcoat={0.6}
          emissive="#571224"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 输卵管 */}
      <mesh geometry={tubeGeoR}>
        <meshPhysicalMaterial color="#f0a3b5" roughness={0.35} clearcoat={0.5} transparent opacity={0.9} />
      </mesh>
      <mesh geometry={tubeGeoL}>
        <meshPhysicalMaterial color="#f0a3b5" roughness={0.35} clearcoat={0.5} transparent opacity={0.9} />
      </mesh>
      <mesh position={[1.9, 2.02, 0.12]} rotation={[0, 0, -1.1]}>
        <coneGeometry args={[0.14, 0.22, 24, 1, true]} />
        <meshPhysicalMaterial color="#f0a3b5" roughness={0.35} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-1.9, 2.02, 0.12]} rotation={[0, 0, 1.1]}>
        <coneGeometry args={[0.14, 0.22, 24, 1, true]} />
        <meshPhysicalMaterial color="#f0a3b5" roughness={0.35} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* 卵巢 */}
      <mesh position={OVARY_R} scale={[1, 0.78, 0.72]} material={ovaryMat}>
        <sphereGeometry args={[0.5, 48, 36]} />
      </mesh>
      <mesh position={OVARY_L} scale={[1, 0.78, 0.72]} material={ovaryMat}>
        <sphereGeometry args={[0.5, 48, 36]} />
      </mesh>

      {/* 小卵泡 */}
      {smallFollicles.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <sphereGeometry args={[f.r, 20, 14]} />
          <meshPhysicalMaterial color="#ffe3ee" roughness={0.2} clearcoat={0.8} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* 优势卵泡 */}
      {follicle > 0 && (
        <mesh position={[2.32, 1.98, 0.3]}>
          <sphereGeometry args={[follicle, 32, 24]} />
          <meshPhysicalMaterial
            color="#ffe6ee"
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.15}
            transparent
            opacity={0.92}
            emissive="#ffb9cd"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* 黄体 */}
      {luteum > 0 && (
        <mesh position={[2.32, 1.98, 0.3]}>
          <sphereGeometry args={[luteum, 32, 24]} />
          <meshPhysicalMaterial
            color="#f7b93e"
            roughness={0.35}
            clearcoat={0.4}
            emissive="#c07f08"
            emissiveIntensity={0.9}
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
              emissiveIntensity={2.2}
              transparent
              opacity={egg.opacity}
            />
          </mesh>
          <sprite scale={[0.6, 0.6, 1]}>
            <spriteMaterial
              map={eggGlowTex}
              color="#ffdf9e"
              transparent
              opacity={0.9 * egg.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        </group>
      )}

      {/* 经血粒子 */}
      <BloodParticles intensity={flow} />

      {/* 标签 */}
      {showLabels && (
        <>
          <Tag position={[0, 2.95, 0]} text="子宫" />
          <Tag position={[1.08, 1.45, 0.35]} text="子宫内膜" color="#fb8ba7" />
          <Tag position={[-2.12, 2.52, 0.1]} text="卵巢" color="#fcd34d" />
          <Tag position={[-1.25, 2.78, 0.1]} text="输卵管" color="#f9a8d4" />
          {follicle > 0.14 && <Tag position={[2.66, 2.62, 0.35]} text="优势卵泡" color="#a5f3fc" />}
          {luteum > 0.15 && <Tag position={[2.66, 2.62, 0.35]} text="黄体" color="#fcd34d" />}
          {egg.visible && egg.t >= 0 && egg.t < 1 && (
            <Tag position={[eggPos!.x, eggPos!.y + 0.45, eggPos!.z]} text="卵子" color="#fde68a" />
          )}
          {flow > 0.05 && <Tag position={[0.95, -0.9, 0.2]} text="经血排出" color="#fb8ba7" />}
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
  const stageGlowTex = useMemo(
    () => makeRadialTexture('rgba(244,114,142,0.55)', 'rgba(167,139,250,0.18)', 'rgba(20,9,16,0)'),
    []
  );
  return (
    <Canvas
      camera={{ position: [0.6, 1.5, 7.4], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#fff1f2" />
      <directionalLight position={[-4, 2, 5]} intensity={0.85} color="#d8b4fe" />
      <pointLight position={[0, 1.6, 1.6]} intensity={1.0} color="#fb7185" />

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
        <group position={[0, -0.5, 0]}>
          <Anatomy day={day} showLabels={showLabels} />
        </group>
      </Float>

      <ContactShadows position={[0, -2.55, 0]} opacity={0.5} scale={11} blur={2.8} far={4.5} color="#2b0716" />
      <Sparkles count={80} scale={[10, 7, 7]} size={1.8} speed={0.22} opacity={0.4} color="#f9a8d4" />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.72}
        autoRotate
        autoRotateSpeed={0.55}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.18} intensity={0.55} mipmapBlur radius={0.72} />
        <Vignette offset={0.22} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
}
