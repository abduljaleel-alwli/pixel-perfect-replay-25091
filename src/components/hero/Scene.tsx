import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makePlasterBump, makeSlabTexture, makeTileTexture } from "./textures";

// ---- Feel constants -------------------------------------------------------
const PARALLAX = 0.45;
const CAM_DAMP = 2.2;
const PAINT_CYCLE = 7; // seconds per wall repaint
const TILE_CYCLE = 9; // seconds per assemble/disperse loop
const PAINTS = ["#d9cbb6", "#a8604a", "#6f7a68", "#e6e0d6", "#3e4a52"];
const PLASTER = "#efe9df";

type Shared = { pointer: THREE.Vector2; scroll: number; motion: number };

function Rig({ shared, mobile }: { shared: Shared; mobile: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime * shared.motion;
    const s = shared.scroll;
    const baseZ = mobile ? 9.5 : 7.2;
    // Slow cinematic drift + mouse parallax + scroll dolly toward the room.
    target.set(
      Math.sin(t * 0.12) * 0.6 + shared.pointer.x * PARALLAX,
      1.7 + shared.pointer.y * PARALLAX * 0.5 - s * 0.6,
      baseZ - s * 3.2,
    );
    const k = 1 - Math.exp(-CAM_DAMP * dt);
    camera.position.lerp(target, k);
    look.lerp(new THREE.Vector3(shared.pointer.x * 0.3, 1.9 + s * 0.6, 0), k);
    camera.lookAt(look);
  });
  return null;
}

/** Coffered gypsum ceiling with warm cove lighting. */
function Ceiling() {
  const bump = useMemo(() => makePlasterBump(), []);
  const beams = useMemo(() => {
    const out: { p: [number, number, number]; s: [number, number, number] }[] = [];
    for (let i = -4; i <= 4; i++) {
      out.push({ p: [i * 1.6, 0, -3], s: [0.22, 0.35, 16] });
    }
    for (let j = -4; j <= 4; j++) {
      out.push({ p: [0, 0, j * 1.6 - 3], s: [16, 0.35, 0.22] });
    }
    return out;
  }, []);
  return (
    <group position={[0, 4.6, 0]}>
      <mesh rotation-x={Math.PI / 2} position-y={0.2}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={PLASTER} roughness={0.95} bumpMap={bump} bumpScale={0.02} />
      </mesh>
      {beams.map((b, i) => (
        <mesh key={i} position={b.p}>
          <boxGeometry args={b.s} />
          <meshStandardMaterial color={PLASTER} roughness={0.9} bumpMap={bump} bumpScale={0.02} />
        </mesh>
      ))}
      {/* Cove light strip */}
      <mesh position={[0, 0.12, -3]} rotation-x={Math.PI / 2}>
        <ringGeometry args={[2.3, 2.38, 64]} />
        <meshBasicMaterial color="#ffd9a8" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Decorative gypsum medallion built from a lathed molding profile. */
function Medallion({ shared }: { shared: Shared }) {
  const ref = useRef<THREE.Group>(null);
  const bump = useMemo(() => makePlasterBump(), []);
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = 0.15 + (i / 60) * 1.25;
      const y = 0.06 * Math.sin(i * 0.9) + 0.1 * Math.cos(i * 0.25) - (i / 60) * 0.15;
      pts.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  const petals = useMemo(() => Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime * shared.motion;
    if (!ref.current) return;
    ref.current.rotation.y = t * 0.15;
    ref.current.position.y = 3.6 + Math.sin(t * 0.6) * 0.08;
  });
  const mat = <meshStandardMaterial color={PLASTER} roughness={0.75} bumpMap={bump} bumpScale={0.015} />;
  return (
    <group ref={ref} position={[0, 3.6, -3]}>
      <mesh geometry={geo} castShadow>{mat}</mesh>
      {petals.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 1.05, -0.1, Math.sin(a) * 1.05]} rotation-y={-a} castShadow>
          <torusGeometry args={[0.13, 0.035, 12, 24, Math.PI]} />
          {mat}
        </mesh>
      ))}
      <mesh position-y={-0.18}>
        <sphereGeometry args={[0.18, 32, 16]} />
        {mat}
      </mesh>
    </group>
  );
}

/** Painted back wall: a roller sweeps a new colour up the wall on loop. */
function PaintWall({ shared }: { shared: Shared }) {
  const base = useRef<THREE.MeshStandardMaterial>(null);
  const coat = useRef<THREE.Mesh>(null);
  const coatMat = useRef<THREE.MeshStandardMaterial>(null);
  const roller = useRef<THREE.Group>(null);
  const idx = useRef(0);
  const W = 5.2, H = 4.4;
  useFrame((state) => {
    const t = (state.clock.elapsedTime * Math.max(shared.motion, 0.0001)) / PAINT_CYCLE;
    const cycle = Math.floor(t);
    const p = THREE.MathUtils.smootherstep(t - cycle, 0.05, 0.9);
    if (cycle !== idx.current) idx.current = cycle;
    const from = PAINTS[cycle % PAINTS.length]!;
    const to = PAINTS[(cycle + 1) % PAINTS.length]!;
    base.current?.color.set(from);
    coatMat.current?.color.set(to);
    if (coat.current) {
      coat.current.scale.y = Math.max(p, 0.0001);
      coat.current.position.y = p * H * 0.5;
    }
    if (roller.current) {
      roller.current.position.y = p * H;
      roller.current.position.x = Math.sin(t * 6) * 0.3;
      roller.current.visible = p > 0.001 && p < 0.999;
      roller.current.children[0]!.rotation.x = t * 20;
    }
  });
  return (
    <group position={[1.4, 0, -6.4]}>
      <mesh position-y={H / 2} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial ref={base} roughness={0.85} />
      </mesh>
      <mesh ref={coat} position={[0, 0, 0.005]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial ref={coatMat} roughness={0.6} />
      </mesh>
      <group ref={roller} position-z={0.12}>
        <mesh rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.9, 24]} />
          <meshStandardMaterial color="#cfc6ba" roughness={1} />
        </mesh>
        <mesh position={[0, -0.45, 0.12]} rotation-x={0.3}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#2b2622" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** Fluted gypsum wall panel on the left. */
function FlutedWall() {
  const flutes = useMemo(() => Array.from({ length: 22 }, (_, i) => i), []);
  return (
    <group position={[-3.2, 0, -5.2]} rotation-y={0.55}>
      <mesh position={[0, 2.2, -0.08]} receiveShadow>
        <planeGeometry args={[4.6, 4.4]} />
        <meshStandardMaterial color={PLASTER} roughness={0.9} />
      </mesh>
      {flutes.map((i) => (
        <mesh key={i} position={[-2.2 + i * 0.21, 2.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.09, 4.4, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={PLASTER} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Nine tiles that drift apart and lock back into a grid. */
function TileAssembly({ shared }: { shared: Shared }) {
  const group = useRef<THREE.Group>(null);
  const tiles = useMemo(() => {
    const r = (n: number) => Math.sin(n * 91.7) * 0.5;
    return Array.from({ length: 9 }, (_, i) => {
      const gx = (i % 3) - 1, gy = Math.floor(i / 3) - 1;
      const dark = i % 2 === 1;
      return {
        home: new THREE.Vector3(gx * 0.52, gy * 0.52, 0),
        away: new THREE.Vector3(gx * 1.4 + r(i) * 1.2, gy * 1.3 + r(i + 3), r(i + 7) * 2),
        spin: new THREE.Euler(r(i + 1) * 4, r(i + 2) * 4, r(i + 5) * 3),
        tex: makeSlabTexture(i + 11, dark ? 160 : 34, dark ? 28 : 84),
      };
    });
  }, []);
  useFrame((state) => {
    const t = (state.clock.elapsedTime * shared.motion) / TILE_CYCLE;
    const ph = t - Math.floor(t);
    // 0-0.35 assemble, 0.35-0.7 hold, 0.7-1 disperse
    const a = shared.motion === 0 ? 1 : ph < 0.35 ? THREE.MathUtils.smootherstep(ph, 0, 0.35) : ph < 0.7 ? 1 : 1 - THREE.MathUtils.smootherstep(ph, 0.7, 1);
    const g = group.current;
    if (!g) return;
    g.rotation.y = -0.5 + shared.pointer.x * 0.25;
    g.rotation.x = 0.15 - shared.pointer.y * 0.15;
    g.position.y = 1.9 + Math.sin(state.clock.elapsedTime * shared.motion * 0.7) * 0.06;
    g.children.forEach((m, i) => {
      const d = tiles[i]!;
      m.position.lerpVectors(d.away, d.home, a);
      m.rotation.set(d.spin.x * (1 - a), d.spin.y * (1 - a), d.spin.z * (1 - a));
    });
  });
  return (
    <group ref={group} position={[2.9, 1.9, -1.6]}>
      {tiles.map((d, i) => (
        <RoundedBox key={i} args={[0.5, 0.5, 0.06]} radius={0.012} smoothness={3} castShadow>
          <meshPhysicalMaterial map={d.tex} roughness={0.18} clearcoat={0.6} clearcoatRoughness={0.15} />
        </RoundedBox>
      ))}
    </group>
  );
}

/** Floating paint swatch slabs orbiting a plinth. */
function Swatches({ shared }: { shared: Shared }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * shared.motion;
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      c.position.y = 0.9 + i * 0.32 + Math.sin(t * 0.8 + i) * 0.05;
      c.rotation.y = t * 0.2 + i * 0.35;
    });
  });
  return (
    <group position={[-2.4, 0, -1.4]}>
      <mesh position-y={0.35} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.7, 48]} />
        <meshStandardMaterial color="#e3dbcf" roughness={0.5} />
      </mesh>
      <group ref={ref}>
        {PAINTS.map((c, i) => (
          <RoundedBox key={c} args={[0.9, 0.06, 0.55]} radius={0.02} castShadow>
            <meshStandardMaterial color={c} roughness={0.55} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

function Floor() {
  const tex = useMemo(() => {
    const t = makeTileTexture();
    t.repeat.set(4, 4);
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -2]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshPhysicalMaterial map={tex} roughness={0.22} clearcoat={0.4} clearcoatRoughness={0.2} />
    </mesh>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 3) onReady();
  });
  return null;
}

export default function Scene({ onReady }: { onReady: () => void }) {
  const shared = useMemo<Shared>(() => ({ pointer: new THREE.Vector2(), scroll: 0, motion: 1 }), []);
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    shared.motion = mq.matches ? 0 : 1;
    const move = (e: PointerEvent) => {
      shared.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    const scroll = () => {
      shared.scroll = Math.min(window.scrollY / window.innerHeight, 1);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
    };
  }, [shared]);

  return (
    <Canvas
      shadows
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 1.7, 7.2], fov: mobile ? 55 : 40 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
    >
      <color attach="background" args={["#1b1714"]} />
      <fog attach="fog" args={["#1b1714", 9, 18]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={2.2}
        color="#ffe2c0"
        castShadow
        shadow-mapSize={[mobile ? 1024 : 2048, mobile ? 1024 : 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 4.2, -3]} intensity={8} distance={8} color="#ffcf94" />
      <Environment resolution={256}>
        <Lightformer intensity={1.6} position={[0, 5, -2]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} color="#fff1dd" />
        <Lightformer intensity={0.8} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} color="#ffd8b0" />
        <Lightformer intensity={0.5} position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} color="#c9d4dc" />
      </Environment>
      <Rig shared={shared} mobile={mobile} />
      <Ceiling />
      <Medallion shared={shared} />
      <PaintWall shared={shared} />
      <FlutedWall />
      <Floor />
      <TileAssembly shared={shared} />
      <Swatches shared={shared} />
      <ContactShadows position={[0, 0.01, -2]} opacity={0.45} scale={14} blur={2.4} far={4} />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
