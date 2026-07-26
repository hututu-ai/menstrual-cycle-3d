import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
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
import { VULVA_PARTS } from '../cycle/vulvaData';

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

/* ---------------------------------- 交互式标注 ---------------------------------- */

function Hotspot({
  position,
  name,
  color,
  selected,
  onSelect,
}: {
  position: [number, number, number];
  name: string;
  color: string;
  selected: boolean;
  onSelect: (name: string | null) => void;
}) {
  return (
    <Html position={position} center distanceFactor={9.5} zIndexRange={[10, 0]}>
      <button
        onClick={() => onSelect(selected ? null : name)}
        className="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium tracking-wide backdrop-blur-xl transition-all hover:scale-110"
        style={{
          border: `1px solid ${selected ? color : color + '55'}`,
          color,
          background: selected ? `${color}22` : 'rgba(20, 9, 16, 0.65)',
          boxShadow: selected
            ? `0 0 28px ${color}60, inset 0 1px 0 rgba(255,255,255,0.12)`
            : `0 0 24px ${color}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
          textShadow: `0 0 12px ${color}80`,
          pointerEvents: 'auto',
          cursor: 'pointer',
          transform: selected ? 'scale(1.08)' : undefined,
        }}
      >
        {name}
      </button>
    </Html>
  );
}

/* ---------------------------------- 材质 ---------------------------------- */

function useSkinMats() {
  return useMemo(
    () => ({
      pad: new THREE.MeshPhysicalMaterial({
        color: '#eec39e',
        roughness: 0.55,
        sheen: 0.6,
        sheenColor: new THREE.Color('#ffd9c2'),
        clearcoat: 0.25,
      }),
      majora: new THREE.MeshPhysicalMaterial({
        color: '#e8a87c',
        roughness: 0.5,
        sheen: 0.5,
        sheenColor: new THREE.Color('#ffd9c2'),
        clearcoat: 0.35,
      }),
      minora: new THREE.MeshPhysicalMaterial({
        color: '#f08ba4',
        roughness: 0.35,
        clearcoat: 0.7,
        clearcoatRoughness: 0.3,
        sheen: 0.6,
        sheenColor: new THREE.Color('#ffd1dc'),
        emissive: new THREE.Color('#5e1226'),
        emissiveIntensity: 0.35,
      }),
      clitoris: new THREE.MeshPhysicalMaterial({
        color: '#fb8ba7',
        roughness: 0.25,
        clearcoat: 0.9,
        emissive: new THREE.Color('#8f1032'),
        emissiveIntensity: 0.7,
      }),
      opening: new THREE.MeshPhysicalMaterial({
        color: '#6b1d3a',
        roughness: 0.6,
        emissive: new THREE.Color('#3d0a1c'),
        emissiveIntensity: 0.6,
      }),
      urethra: new THREE.MeshPhysicalMaterial({
        color: '#d99a5b',
        roughness: 0.4,
        clearcoat: 0.6,
      }),
    }),
    []
  );
}

/* ---------------------------------- 解剖模型（正视图） ---------------------------------- */

// 各部位的标签位置与点击高亮光点位置
const PART_SPOTS: Record<string, { label: [number, number, number]; glow: [number, number, number] }> = {
  阴阜: { label: [0, 2.45, 0.2], glow: [0, 1.5, 0.55] },
  大阴唇: { label: [1.62, 0.55, 0.2], glow: [0.62, -0.25, 0.62] },
  小阴唇: { label: [-1.42, -0.15, 0.4], glow: [-0.3, -0.3, 0.62] },
  阴蒂: { label: [1.15, 1.18, 0.55], glow: [0, 0.76, 0.62] },
  尿道口: { label: [-1.1, 0.55, 0.55], glow: [0, 0.12, 0.62] },
  阴道口: { label: [1.2, -0.78, 0.45], glow: [0, -0.68, 0.6] },
  G点: { label: [-1.3, -1.05, 0.5], glow: [0, -0.45, 0.58] },
  会阴: { label: [0, -2.0, 0.2], glow: [0, -1.55, 0.4] },
};

function VulvaAnatomy({
  showLabels,
  selected,
  onSelect,
}: {
  showLabels: boolean;
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  const mats = useSkinMats();
  const glowTex = useMemo(
    () => makeRadialTexture('rgba(255,255,255,0.95)', 'rgba(251,139,167,0.4)', 'rgba(251,139,167,0)'),
    []
  );

  const pick =
    (name: string) =>
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(selected === name ? null : name);
    };

  return (
    <group>
      {/* 身体底色（会阴区域皮肤） */}
      <mesh position={[0, -0.1, -0.6]} scale={[2.3, 3.0, 0.85]} material={mats.pad} onClick={pick('会阴')}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>

      {/* 阴阜 */}
      <mesh position={[0, 1.5, -0.05]} scale={[1.05, 0.78, 0.5]} material={mats.pad} onClick={pick('阴阜')}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>

      {/* 大阴唇 */}
      <mesh position={[0.62, -0.25, 0.05]} rotation={[0, 0, -0.1]} scale={[0.6, 1.85, 0.5]} material={mats.majora} onClick={pick('大阴唇')}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>
      <mesh position={[-0.62, -0.25, 0.05]} rotation={[0, 0, 0.1]} scale={[0.6, 1.85, 0.5]} material={mats.majora} onClick={pick('大阴唇')}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>

      {/* 小阴唇 */}
      <mesh position={[0.3, -0.3, 0.32]} rotation={[0, 0, -0.06]} scale={[0.24, 1.3, 0.26]} material={mats.minora} onClick={pick('小阴唇')}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>
      <mesh position={[-0.3, -0.3, 0.32]} rotation={[0, 0, 0.06]} scale={[0.24, 1.3, 0.26]} material={mats.minora} onClick={pick('小阴唇')}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>

      {/* 阴蒂（包皮 + 蒂头） */}
      <mesh position={[0, 0.84, 0.4]} scale={[0.24, 0.26, 0.17]} material={mats.minora} onClick={pick('阴蒂')}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <mesh position={[0, 0.74, 0.47]} material={mats.clitoris} onClick={pick('阴蒂')}>
        <sphereGeometry args={[0.11, 24, 18]} />
      </mesh>

      {/* 尿道口 */}
      <mesh position={[0, 0.12, 0.48]} material={mats.urethra} onClick={pick('尿道口')}>
        <sphereGeometry args={[0.055, 16, 12]} />
      </mesh>

      {/* 阴道口（边缘 + 开口） */}
      <mesh position={[0, -0.68, 0.3]} scale={[0.4, 0.62, 0.16]} material={mats.minora} onClick={pick('阴道口')}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>
      <mesh position={[0, -0.68, 0.4]} scale={[0.28, 0.5, 0.1]} material={mats.opening} onClick={pick('阴道口')}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>

      {/* 选中部位的光点 */}
      {selected && PART_SPOTS[selected] && (
        <sprite position={PART_SPOTS[selected].glow} scale={[0.85, 0.85, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      )}

      {/* 交互式标注 */}
      {showLabels &&
        VULVA_PARTS.map((p) => (
          <Hotspot
            key={p.name}
            position={PART_SPOTS[p.name].label}
            name={p.name}
            color={p.color}
            selected={selected === p.name}
            onSelect={onSelect}
          />
        ))}
    </group>
  );
}

/* ---------------------------------- 场景 ---------------------------------- */

export default function VulvaScene({
  showLabels,
  selected,
  onSelect,
}: {
  showLabels: boolean;
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, -0.05, 6.4], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 6]} intensity={1.5} color="#fff1f2" />
      <directionalLight position={[-4, 1, 4]} intensity={0.7} color="#d8b4fe" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#fb7185" />

      <Environment resolution={256}>
        <group>
          <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[10, 6, 1]} color="#ffe1e8" />
          <Lightformer intensity={1.5} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#f472b6" />
          <Lightformer intensity={1.3} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#a78bfa" />
        </group>
      </Environment>

      <Float speed={1} rotationIntensity={0.06} floatIntensity={0.15}>
        <group position={[0, 0.1, 0]} scale={0.74}>
          <VulvaAnatomy showLabels={showLabels} selected={selected} onSelect={onSelect} />
        </group>
      </Float>

      <ContactShadows position={[0, -3.2, 0]} opacity={0.4} scale={10} blur={2.8} far={4} color="#2b0716" />
      <Sparkles count={60} scale={[9, 7, 6]} size={1.6} speed={0.2} opacity={0.35} color="#f9a8d4" />

      <OrbitControls
        target={[0, -0.05, 0]}
        enablePan={false}
        minDistance={3}
        maxDistance={9}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.3}
        autoRotate={!selected}
        autoRotateSpeed={0.35}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={0.45} mipmapBlur radius={0.7} />
        <Vignette offset={0.22} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
