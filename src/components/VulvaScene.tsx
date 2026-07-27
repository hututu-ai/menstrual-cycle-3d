import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  Float,
  Sparkles,
  Environment,
  Lightformer,
  ContactShadows,
  useCursor,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField, Noise } from '@react-three/postprocessing';
import { X } from 'lucide-react';
import * as THREE from 'three';
import { VULVA_PARTS, CLITORIS_PARTS } from '../cycle/vulvaData';

export type VulvaLayer = 'surface' | 'clitoris';

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

/** 皮肤微纹理 bump 贴图（程序生成，细颗粒） */
function makeSkinBump() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 0.4 + Math.random() * 1.4;
    const v = 108 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

/** 菲涅尔轮廓光晕材质 */
function makeFresnelMaterial(color: string, intensity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.8);
        gl_FragColor = vec4(uColor, f * uIntensity);
      }
    `,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
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
  return useMemo(() => {
    const bump = makeSkinBump();
    return {
      pad: new THREE.MeshPhysicalMaterial({
        color: '#eec39e',
        roughness: 0.55,
        sheen: 0.6,
        sheenColor: new THREE.Color('#ffd9c2'),
        clearcoat: 0.25,
        bumpMap: bump,
        bumpScale: 0.012,
        transparent: true,
      }),
      majora: new THREE.MeshPhysicalMaterial({
        color: '#e8a87c',
        roughness: 0.5,
        sheen: 0.5,
        sheenColor: new THREE.Color('#ffd9c2'),
        clearcoat: 0.35,
        bumpMap: bump,
        bumpScale: 0.01,
        transparent: true,
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
        transparent: true,
      }),
      clitoris: new THREE.MeshPhysicalMaterial({
        color: '#fb8ba7',
        roughness: 0.25,
        clearcoat: 0.9,
        emissive: new THREE.Color('#8f1032'),
        emissiveIntensity: 0.7,
        transparent: true,
      }),
      opening: new THREE.MeshPhysicalMaterial({
        color: '#6b1d3a',
        roughness: 0.6,
        emissive: new THREE.Color('#3d0a1c'),
        emissiveIntensity: 0.6,
        transparent: true,
      }),
      urethra: new THREE.MeshPhysicalMaterial({
        color: '#d99a5b',
        roughness: 0.4,
        clearcoat: 0.6,
        transparent: true,
      }),
    };
  }, []);
}

/* ---------------------------------- 解剖模型（正视图） ---------------------------------- */

// 表层：各部位的标签位置与点击高亮光点位置
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

// 阴蒂全貌（冰山之下）：内部结构标注位置
const CLITORIS_SPOTS: Record<string, { label: [number, number, number]; glow: [number, number, number] }> = {
  阴蒂头: { label: [1.3, 0.98, 0.55], glow: [0, 0.74, 0.5] },
  阴蒂体: { label: [1.4, 1.5, 0.3], glow: [0, 1.05, 0.15] },
  阴蒂脚: { label: [-1.6, 0.5, 0.25], glow: [-0.7, 0.1, -0.1] },
  前庭球: { label: [1.45, -0.55, 0.45], glow: [0.32, -0.42, 0.15] },
};

/* ---------------------------------- 阴蒂内部结构（发光的冰山） ---------------------------------- */

function ClitorisNetwork() {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f472b6',
        roughness: 0.25,
        clearcoat: 0.8,
        transmission: 0.25,
        emissive: new THREE.Color('#a21c50'),
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0.95,
      }),
    []
  );

  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.085, 0.5, 8, 20), []);
  const cruraGeoR = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 1.12, 0.05),
          new THREE.Vector3(0.42, 0.68, -0.1),
          new THREE.Vector3(0.72, 0.08, -0.2),
          new THREE.Vector3(0.78, -0.55, -0.24),
        ]),
        48,
        0.055,
        12,
        false
      ),
    []
  );
  const cruraGeoL = useMemo(() => cruraGeoR.clone().scale(-1, 1, 1), [cruraGeoR]);

  return (
    <group>
      {/* 阴蒂体（向耻骨后方延伸） */}
      <mesh geometry={bodyGeo} material={mat} position={[0, 1.02, 0.18]} rotation={[-0.72, 0, 0]} />
      {/* 阴蒂脚（两条长腿） */}
      <mesh geometry={cruraGeoR} material={mat} />
      <mesh geometry={cruraGeoL} material={mat} />
      {/* 前庭球（环绕阴道口两侧） */}
      <mesh position={[0.32, -0.42, 0.12]} rotation={[0, 0, -0.12]} scale={[0.17, 0.52, 0.13]} material={mat}>
        <sphereGeometry args={[1, 28, 20]} />
      </mesh>
      <mesh position={[-0.32, -0.42, 0.12]} rotation={[0, 0, 0.12]} scale={[0.17, 0.52, 0.13]} material={mat}>
        <sphereGeometry args={[1, 28, 20]} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- 外阴主体 ---------------------------------- */

function VulvaAnatomy({
  showLabels,
  selected,
  onSelect,
  layer,
}: {
  showLabels: boolean;
  selected: string | null;
  onSelect: (name: string | null) => void;
  layer: VulvaLayer;
}) {
  const mats = useSkinMats();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const glowTex = useMemo(
    () => makeRadialTexture('rgba(255,255,255,0.95)', 'rgba(251,139,167,0.4)', 'rgba(251,139,167,0)'),
    []
  );
  const fresnelMat = useMemo(() => makeFresnelMaterial('#ffc9a8', 0.3), []);

  const netRef = useRef<THREE.Group>(null);
  // 皮肤淡化 / 内部阴蒂结构缩放的平滑过渡
  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.002, delta);
    const skinTarget = layer === 'clitoris' ? 0.2 : 1;
    mats.pad.opacity = THREE.MathUtils.lerp(mats.pad.opacity, skinTarget, k);
    mats.majora.opacity = THREE.MathUtils.lerp(mats.majora.opacity, skinTarget, k);
    mats.minora.opacity = THREE.MathUtils.lerp(mats.minora.opacity, layer === 'clitoris' ? 0.3 : 1, k);
    mats.opening.opacity = THREE.MathUtils.lerp(mats.opening.opacity, layer === 'clitoris' ? 0.25 : 1, k);
    mats.urethra.opacity = THREE.MathUtils.lerp(mats.urethra.opacity, skinTarget, k);
    if (netRef.current) {
      const sTarget = layer === 'clitoris' ? 1 : 0.0001;
      const s = THREE.MathUtils.lerp(netRef.current.scale.x || 0.0001, sTarget, k);
      netRef.current.scale.setScalar(Math.max(s, 0.0001));
      netRef.current.visible = s > 0.02;
    }
  });

  const pick =
    (name: string) =>
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(selected === name ? null : name);
    };

  const spots = layer === 'clitoris' ? CLITORIS_SPOTS : PART_SPOTS;
  const parts = layer === 'clitoris' ? CLITORIS_PARTS : VULVA_PARTS;
  const allParts = useMemo(() => [...VULVA_PARTS, ...CLITORIS_PARTS], []);
  const selectedInfo = selected ? allParts.find((p) => p.name === selected) : null;

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 身体底色（会阴区域皮肤） */}
      <mesh position={[0, -0.1, -0.6]} scale={[2.3, 3.0, 0.85]} material={mats.pad} onClick={pick('会阴')}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      {/* 菲涅尔轮廓光晕壳 */}
      <mesh position={[0, -0.1, -0.6]} scale={[2.42, 3.15, 0.9]} material={fresnelMat}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>

      {/* 阴阜 */}
      <mesh position={[0, 1.5, -0.05]} scale={[1.05, 0.78, 0.5]} material={mats.pad} onClick={pick('阴阜')}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>
      <mesh position={[0, 1.5, -0.05]} scale={[1.1, 0.82, 0.53]} material={fresnelMat}>
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
      <mesh position={[0, 0.84, 0.4]} scale={[0.24, 0.26, 0.17]} material={mats.minora} onClick={pick(layer === 'clitoris' ? '阴蒂头' : '阴蒂')}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <mesh position={[0, 0.74, 0.47]} material={mats.clitoris} onClick={pick(layer === 'clitoris' ? '阴蒂头' : '阴蒂')}>
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

      {/* 阴蒂内部结构（冰山之下，clitoris 模式淡入） */}
      <group ref={netRef} scale={0.0001} visible={false}>
        <ClitorisNetwork />
      </group>

      {/* 选中部位的光点 */}
      {selected && spots[selected] && (
        <sprite position={spots[selected].glow} scale={[0.85, 0.85, 1]}>
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
        parts.map((p) => (
          <Hotspot
            key={p.name}
            position={spots[p.name].label}
            name={p.name}
            color={p.color}
            selected={selected === p.name}
            onSelect={onSelect}
          />
        ))}

      {/* 阴蒂模式的金句标注 */}
      {layer === 'clitoris' && (
        <Html position={[0, -2.25, 0.3]} center distanceFactor={9.5} zIndexRange={[10, 0]}>
          <div
            className="pointer-events-none select-none whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide backdrop-blur-xl"
            style={{
              border: '1px solid rgba(251,191,36,0.4)',
              color: '#fcd34d',
              background: 'rgba(20, 9, 16, 0.65)',
              boxShadow: '0 0 24px rgba(251,191,36,0.25)',
              textShadow: '0 0 12px rgba(251,191,36,0.6)',
            }}
          >
            「小珍珠」只是冰山一角 —— 整个阴蒂沿骨盆延伸近 10 cm
          </div>
        </Html>
      )}

      {/* 选中部位的讲解卡：锚定在标注旁 */}
      {selected &&
        spots[selected] &&
        selectedInfo &&
        (() => {
          const below = spots[selected].label[1] > 1.8;
          return (
            <Html position={spots[selected].label} distanceFactor={9.5} zIndexRange={[40, 0]}>
              <div
                className="phase-in w-[230px] rounded-2xl border p-3.5 backdrop-blur-2xl"
                style={{
                  transform: below ? 'translate(-50%, 20px)' : 'translate(-50%, calc(-100% - 20px))',
                  borderColor: `${selectedInfo.color}55`,
                  background: 'rgba(20, 9, 16, 0.88)',
                  boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 28px ${selectedInfo.color}25`,
                  pointerEvents: 'auto',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="font-display text-[15px] font-bold"
                    style={{ color: selectedInfo.color, textShadow: `0 0 14px ${selectedInfo.color}60` }}
                  >
                    {selectedInfo.name}
                  </span>
                  <button
                    onClick={() => onSelect(null)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/75">{selectedInfo.desc}</p>
              </div>
            </Html>
          );
        })()}
    </group>
  );
}

/* ---------------------------------- 漂移星云 ---------------------------------- */

function Nebula() {
  const texR = useMemo(
    () => makeRadialTexture('rgba(251,113,133,0.45)', 'rgba(190,60,110,0.14)', 'rgba(190,60,110,0)'),
    []
  );
  const texV = useMemo(
    () => makeRadialTexture('rgba(167,139,250,0.4)', 'rgba(120,90,220,0.12)', 'rgba(120,90,220,0)'),
    []
  );
  return (
    <group>
      <sprite position={[-4.5, 2, -5]} scale={[12, 8, 1]}>
        <spriteMaterial map={texR} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[4.5, -1.5, -6]} scale={[13, 9, 1]}>
        <spriteMaterial map={texV} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/* ---------------------------------- 场景 ---------------------------------- */

export default function VulvaScene({
  showLabels,
  selected,
  onSelect,
  layer,
}: {
  showLabels: boolean;
  selected: string | null;
  onSelect: (name: string | null) => void;
  layer: VulvaLayer;
}) {
  return (
    <Canvas
      camera={{ position: [0, -0.05, 6.4], fov: 42 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.22,
      }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 6]} intensity={1.4} color="#fff1f2" />
      <directionalLight position={[-4, 1, 4]} intensity={0.65} color="#d8b4fe" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#fb7185" />

      <Nebula />

      <Environment resolution={256}>
        <group>
          <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[10, 6, 1]} color="#ffe1e8" />
          <Lightformer intensity={1.5} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#f472b6" />
          <Lightformer intensity={1.3} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#a78bfa" />
        </group>
      </Environment>

      <Float speed={1} rotationIntensity={0.06} floatIntensity={0.15}>
        <group position={[0, 0.1, 0]} scale={0.74}>
          <VulvaAnatomy showLabels={showLabels} selected={selected} onSelect={onSelect} layer={layer} />
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
        <DepthOfField focusDistance={0.045} focalLength={0.02} bokehScale={1.3} />
        <Bloom luminanceThreshold={0.2} intensity={0.45} mipmapBlur radius={0.7} />
        <Noise opacity={0.05} />
        <Vignette offset={0.22} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
