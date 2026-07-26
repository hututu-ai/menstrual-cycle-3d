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

function VulvaAnatomy({ showLabels }: { showLabels: boolean }) {
  const mats = useSkinMats();

  return (
    <group>
      {/* 身体底色（会阴区域皮肤） */}
      <mesh position={[0, -0.1, -0.6]} scale={[2.3, 3.0, 0.85]} material={mats.pad}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>

      {/* 阴阜 */}
      <mesh position={[0, 1.5, -0.05]} scale={[1.05, 0.78, 0.5]} material={mats.pad}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>

      {/* 大阴唇 */}
      <mesh position={[0.62, -0.25, 0.05]} rotation={[0, 0, -0.1]} scale={[0.6, 1.85, 0.5]} material={mats.majora}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>
      <mesh position={[-0.62, -0.25, 0.05]} rotation={[0, 0, 0.1]} scale={[0.6, 1.85, 0.5]} material={mats.majora}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>

      {/* 小阴唇 */}
      <mesh position={[0.3, -0.3, 0.32]} rotation={[0, 0, -0.06]} scale={[0.24, 1.3, 0.26]} material={mats.minora}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>
      <mesh position={[-0.3, -0.3, 0.32]} rotation={[0, 0, 0.06]} scale={[0.24, 1.3, 0.26]} material={mats.minora}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>

      {/* 阴蒂（包皮 + 蒂头） */}
      <mesh position={[0, 0.84, 0.4]} scale={[0.24, 0.26, 0.17]} material={mats.minora}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <mesh position={[0, 0.74, 0.47]} material={mats.clitoris}>
        <sphereGeometry args={[0.11, 24, 18]} />
      </mesh>

      {/* 尿道口 */}
      <mesh position={[0, 0.12, 0.48]} material={mats.urethra}>
        <sphereGeometry args={[0.055, 16, 12]} />
      </mesh>

      {/* 阴道口（边缘 + 开口） */}
      <mesh position={[0, -0.68, 0.3]} scale={[0.4, 0.62, 0.16]} material={mats.minora}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>
      <mesh position={[0, -0.68, 0.4]} scale={[0.28, 0.5, 0.1]} material={mats.opening}>
        <sphereGeometry args={[1, 40, 30]} />
      </mesh>

      {/* 标签 */}
      {showLabels && (
        <>
          <Tag position={[0, 2.45, 0.2]} text="阴阜" color="#f2c09a" />
          <Tag position={[1.55, 0.55, 0.2]} text="大阴唇" color="#e8a87c" />
          <Tag position={[-1.35, -0.15, 0.4]} text="小阴唇" color="#f472b6" />
          <Tag position={[1.1, 1.15, 0.55]} text="阴蒂" color="#fb7185" />
          <Tag position={[-1.05, 0.55, 0.55]} text="尿道口" color="#fbbf24" />
          <Tag position={[1.15, -0.75, 0.45]} text="阴道口" color="#a78bfa" />
          <Tag position={[0, -1.95, 0.2]} text="会阴" color="#c4b5fd" />
        </>
      )}
    </group>
  );
}

/* ---------------------------------- 场景 ---------------------------------- */

export default function VulvaScene({ showLabels }: { showLabels: boolean }) {
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
          <VulvaAnatomy showLabels={showLabels} />
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
        autoRotate
        autoRotateSpeed={0.35}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={0.45} mipmapBlur radius={0.7} />
        <Vignette offset={0.22} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
