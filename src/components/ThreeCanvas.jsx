import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Helper to smoothly interpolate values
const lerp = (start, end, factor) => start + (end - start) * factor;

// Calculate target X position for the gap based on mathematically perfect 100vh scroll waypoints (1/8th intervals)
const waypoints = [
  { s: 0.000, dir: 1 },    // Home (Gap Right)
  { s: 0.125, dir: -1 },   // About (Gap Left)
  { s: 0.250, dir: 1 },    // Skills (Gap Right)
  { s: 0.375, dir: -1 },   // Projects (Gap Left)
  { s: 0.500, dir: 1.2 },  // Experience (Gap Right, slightly further right)
  { s: 0.625, dir: 0 },    // SQL (Centered now)
  { s: 0.750, dir: 0 },    // DAX (Centered now)
  { s: 0.875, dir: 0 },    // Certs (Center Finale)
  { s: 1.000, dir: 0 }     // Contact (Center Finale)
];

const getGlobalGapX = (scroll, offsetMagnitude) => {
  for (let i = 0; i < waypoints.length - 1; i++) {
    if (scroll >= waypoints[i].s && scroll <= waypoints[i+1].s) {
       const t = (scroll - waypoints[i].s) / (waypoints[i+1].s - waypoints[i].s);
       const easeT = t * t * (3 - 2 * t);
       return lerp(waypoints[i].dir * offsetMagnitude, waypoints[i+1].dir * offsetMagnitude, easeT);
    }
  }
  return 0;
};

// Calculate depth and scale based on scroll focus plateau
const getFocusTransform = (currentScroll, plateauStart, plateauEnd) => {
  let distance = 0;
  if (currentScroll < plateauStart) distance = plateauStart - currentScroll;
  else if (currentScroll > plateauEnd) distance = currentScroll - plateauEnd;
  
  // Aggressive multiplier guarantees transitions only happen in the tiny gap between plateaus
  const normalized = Math.pow(Math.min(distance * 18, 1), 1.5); 
  let targetZ = lerp(8, -60, normalized);
  let targetScale = lerp(1.5, 0, normalized);
  
  let finaleFactor = 0;
  if (currentScroll > 0.82) {
    finaleFactor = Math.min((currentScroll - 0.82) / 0.18, 1);
    // Everything comes forward into a surrounding vortex during the finale
    targetZ = lerp(targetZ, -5, finaleFactor);
    targetScale = lerp(targetScale, 0.6, finaleFactor);
  }
  
  return { targetZ, targetScale, finaleFactor };
};

// Global mouse tracking since Canvas has pointerEvents: 'none'
const globalMouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

// Custom hook to get smoothed scroll position
function useSmoothedScroll() {
  const scrollRef = useRef(0);
  useFrame(() => {
    // Adding a tiny buffer so it reaches 1.0 at the absolute bottom
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const currentScroll = window.scrollY / maxScroll;
    scrollRef.current = lerp(scrollRef.current, currentScroll || 0, 0.05);
  });
  return scrollRef;
}

// Relational Data Network (Nodes & Relationships) - Peak: 0.25 (About, Skills)
function DataNetwork() {
  const bgGroup = useRef();
  const focalGroup = useRef();
  const scroll = useSmoothedScroll();
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#FF7A00', transparent: true, opacity: 0.15 });
  
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 180; i++) {
      temp.push(new THREE.Vector3(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40
      ));
    }
    return temp;
  }, []);

  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < 4) {
          temp.push([nodes[i], nodes[j]]);
        }
      }
    }
    return temp;
  }, [nodes]);

  const { viewport, camera, size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    // Plateau: About (0.125) to Skills (0.250), with ±0.035 buffer
    const { targetZ, targetScale, finaleFactor } = getFocusTransform(scroll.current, 0.09, 0.285);
    const currentViewport = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, targetZ));
    const targetX = getGlobalGapX(scroll.current, currentViewport.width / 4);
    
    // Background Field
    bgGroup.current.position.z = lerp(bgGroup.current.position.z, targetZ - 10, 0.05);
    bgGroup.current.scale.setScalar(lerp(bgGroup.current.scale.x, targetScale * 0.15, 0.05));
    bgGroup.current.rotation.x = lerp(bgGroup.current.rotation.x, globalMouse.y * 0.5, 0.1);
    bgGroup.current.rotation.y = state.clock.getElapsedTime() * 0.05 + scroll.current * Math.PI;
    
    // Focal Element
    focalGroup.current.position.z = lerp(focalGroup.current.position.z, targetZ, 0.05);
    focalGroup.current.scale.setScalar(lerp(focalGroup.current.scale.x, targetScale * 0.2, 0.05));
    focalGroup.current.rotation.x = Math.PI * 0.1;
    focalGroup.current.rotation.y += 0.002;

    if (finaleFactor > 0) {
      const angle = state.clock.getElapsedTime() * 0.3 + Math.PI * 0.4;
      const radius = 12;
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, Math.cos(angle) * (radius + 5), 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.sin(angle) * (radius + 5), 0.05);
      
      focalGroup.current.position.x = lerp(focalGroup.current.position.x, Math.cos(angle) * radius, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, Math.sin(angle) * radius, 0.05);
    } else {
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, globalMouse.x * 2, 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, globalMouse.y * 0.5, 0.1);
      
      focalGroup.current.position.x = lerp(focalGroup.current.position.x, targetX, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, 0, 0.05);
    }
  });

  return (
    <group>
      <group ref={bgGroup}>
        {nodes.map((pos, i) => (
          <Sphere key={i} position={pos} args={[0.08, 16, 16]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </Sphere>
        ))}
        {lines.map((points, i) => (
          <line key={i}>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...points[0].toArray(), ...points[1].toArray()])}
                itemSize={3}
              />
            </bufferGeometry>
            <primitive object={lineMaterial} attach="material" />
          </line>
        ))}
      </group>
      <group ref={focalGroup} visible={!isMobile}>
        {nodes.slice(0, 30).map((pos, i) => (
          <Sphere key={i} position={pos.clone().multiplyScalar(0.5)} args={[0.08, 16, 16]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </Sphere>
        ))}
        {lines.slice(0, 30).map((points, i) => (
          <line key={i}>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...points[0].clone().multiplyScalar(0.5).toArray(), ...points[1].clone().multiplyScalar(0.5).toArray()])}
                itemSize={3}
              />
            </bufferGeometry>
            <primitive object={lineMaterial} attach="material" />
          </line>
        ))}
      </group>
    </group>
  );
}

// Removed DataCubes per user request

// 3D Bar Chart - Peak: 0.5 (Projects, Experience)
function SingleBarChart({ config }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x += config.rotationSpeed[0];
    ref.current.rotation.y += config.rotationSpeed[1];
    ref.current.rotation.z += config.rotationSpeed[2];
  });

  return (
    <group ref={ref} position={config.position} scale={config.scale}>
      {[1, 2.5, 1.5, 3.5, 2, 4].map((h, i) => (
        <mesh key={i} position={[(i - 2.5) * 1.2, h / 2 - 1.5, 0]}>
          <boxGeometry args={[0.8, h, 0.8]} />
          <meshStandardMaterial color="#FF7A00" opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

function AnalyticsBars() {
  const bgGroup = useRef();
  const focalGroup = useRef();
  const scroll = useSmoothedScroll();

  const charts = useMemo(() => Array.from({ length: 48 }).map(() => ({
    position: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40],
    scale: Math.random() * Math.random() * 1.2 + 0.1,
    rotationSpeed: [(Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01]
  })), []);
  
  const { viewport, camera, size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    // Plateau: Projects (0.375), with ±0.035 buffer
    const { targetZ, targetScale, finaleFactor } = getFocusTransform(scroll.current, 0.34, 0.41);
    const currentViewport = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, targetZ));
    const targetX = getGlobalGapX(scroll.current, currentViewport.width / 4);

    // BG Field
    bgGroup.current.position.z = lerp(bgGroup.current.position.z, targetZ - 10, 0.05);
    bgGroup.current.scale.setScalar(lerp(bgGroup.current.scale.x, targetScale * 0.15, 0.05));
    bgGroup.current.rotation.x = lerp(bgGroup.current.rotation.x, globalMouse.y * 0.2, 0.05);
    bgGroup.current.rotation.y = lerp(bgGroup.current.rotation.y, -Math.PI / 4 + globalMouse.x * 0.5, 0.05);

    // Focal Element
    focalGroup.current.position.z = lerp(focalGroup.current.position.z, targetZ, 0.05);
    focalGroup.current.scale.setScalar(lerp(focalGroup.current.scale.x, targetScale * 0.75, 0.05));
    focalGroup.current.rotation.y += 0.005;
    focalGroup.current.rotation.x = Math.PI * 0.15;

    if (finaleFactor > 0) {
      const angle = state.clock.getElapsedTime() * 0.3 + Math.PI * 0.8;
      const radius = 12;
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, Math.cos(angle) * (radius + 5), 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.sin(angle) * (radius + 5), 0.05);

      focalGroup.current.position.x = lerp(focalGroup.current.position.x, Math.cos(angle) * radius, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, Math.sin(angle) * radius, 0.05);
    } else {
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, globalMouse.x * 2, 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.sin(state.clock.getElapsedTime() * 0.2) * 2, 0.05);

      focalGroup.current.position.x = lerp(focalGroup.current.position.x, targetX, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, 0, 0.05);
    }
  });

  return (
    <group>
      <group ref={bgGroup}>
        {charts.map((chart, i) => <SingleBarChart key={i} config={chart} />)}
      </group>
      <group ref={focalGroup} visible={!isMobile}>
        <SingleBarChart config={{ position: [0, 0, 0], scale: 1, rotationSpeed: [0, 0, 0] }} />
      </group>
    </group>
  );
}

// 3D Pie Chart - Peak: 0.05 (Home)
function SinglePie({ config }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x += config.rotationSpeed[0];
    ref.current.rotation.y += config.rotationSpeed[1];
    ref.current.rotation.z += config.rotationSpeed[2];
  });

  return (
    <group ref={ref} position={config.position} scale={config.scale}>
      <mesh>
        <cylinderGeometry args={[2, 2, 0.5, 32, 1, false, 0, Math.PI * 0.8]} />
        <meshStandardMaterial color="#FF7A00" opacity={0.8} transparent />
      </mesh>
      <mesh position={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[2, 2, 0.5, 32, 1, false, Math.PI * 0.8, Math.PI * 0.7]} />
        <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
      </mesh>
      <mesh>
        <cylinderGeometry args={[2, 2, 0.5, 32, 1, false, Math.PI * 1.5, Math.PI * 0.5]} />
        <meshStandardMaterial color="#FFB84D" opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

function PieCharts() {
  const bgGroup = useRef();
  const focalGroup = useRef();
  const scroll = useSmoothedScroll();

  const pies = useMemo(() => Array.from({ length: 60 }).map(() => ({
    position: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40],
    scale: Math.random() * Math.random() * 1.2 + 0.1,
    rotationSpeed: [(Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02]
  })), []);

  const { viewport, camera, size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    // Plateau: Home (0.000), with +0.035 buffer
    const { targetZ, targetScale, finaleFactor } = getFocusTransform(scroll.current, 0.00, 0.035);
    const currentViewport = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, targetZ));
    const targetX = getGlobalGapX(scroll.current, currentViewport.width / 4);

    // BG Field
    bgGroup.current.position.z = lerp(bgGroup.current.position.z, targetZ - 10, 0.05);
    bgGroup.current.scale.setScalar(lerp(bgGroup.current.scale.x, targetScale * 0.15, 0.05));
    bgGroup.current.rotation.x = lerp(bgGroup.current.rotation.x, Math.PI / 6 + globalMouse.y * 0.5, 0.1);
    bgGroup.current.rotation.z = lerp(bgGroup.current.rotation.z, -globalMouse.x * 0.5, 0.1);

    // Focal Element
    focalGroup.current.position.z = lerp(focalGroup.current.position.z, targetZ, 0.05);
    focalGroup.current.scale.setScalar(lerp(focalGroup.current.scale.x, targetScale * 0.75, 0.05));
    focalGroup.current.rotation.x = Math.PI / 6;
    focalGroup.current.rotation.y += 0.005;

    if (finaleFactor > 0) {
      const angle = state.clock.getElapsedTime() * 0.3 + 0;
      const radius = 12;
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, Math.cos(angle) * (radius + 5), 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.sin(angle) * (radius + 5), 0.05);

      focalGroup.current.position.x = lerp(focalGroup.current.position.x, Math.cos(angle) * radius, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, Math.sin(angle) * radius, 0.05);
    } else {
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, globalMouse.x * 2, 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.cos(state.clock.getElapsedTime() * 0.2) * 2, 0.05);

      focalGroup.current.position.x = lerp(focalGroup.current.position.x, targetX, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, 0, 0.05);
    }
  });

  return (
    <group>
      <group ref={bgGroup}>
        {pies.map((pie, i) => <SinglePie key={i} config={pie} />)}
      </group>
      <group ref={focalGroup} visible={!isMobile}>
        <SinglePie config={{ position: [0, 0, 0], scale: 1, rotationSpeed: [0, 0, 0] }} />
      </group>
    </group>
  );
}

// 3D Slicers - Peak: 0.75 (SQL, DAX)
function SingleSlicer({ config }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x += config.rotationSpeed[0];
    ref.current.rotation.y += config.rotationSpeed[1];
    ref.current.rotation.z += config.rotationSpeed[2];
  });

  return (
    <group ref={ref} position={config.position} scale={config.scale}>
      {/* Main Backplate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
      </mesh>
      {/* Header */}
      <mesh position={[0, 1.2, 0.15]}>
        <boxGeometry args={[1.6, 0.3, 0.2]} />
        <meshStandardMaterial color="#FF7A00" opacity={0.8} transparent />
      </mesh>
      {/* Filter items */}
      {[0.5, 0, -0.5, -1.0].map((yOffset, i) => (
        <mesh key={i} position={[0, yOffset, 0.15]}>
          <boxGeometry args={[1.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
        </mesh>
      ))}
      {/* Active Filter item */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[1.6, 0.3, 0.21]} />
        <meshStandardMaterial color="#FFB84D" opacity={0.9} transparent />
      </mesh>
    </group>
  );
}

function Slicers() {
  const bgGroup = useRef();
  const focalGroup = useRef();
  const scroll = useSmoothedScroll();

  const slicers = useMemo(() => Array.from({ length: 40 }).map(() => ({
    position: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40],
    scale: Math.random() * Math.random() * 1.2 + 0.1,
    rotationSpeed: [(Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02]
  })), []);

  const { viewport, camera, size } = useThree();
  const isMobile = size.width < 768;

  useFrame((state) => {
    // Plateau: Experience (0.500), with extended exit buffer
    const { targetZ, targetScale, finaleFactor } = getFocusTransform(scroll.current, 0.45, 0.58);
    const currentViewport = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, targetZ));
    const targetX = getGlobalGapX(scroll.current, currentViewport.width / 4);

    // BG Field
    bgGroup.current.position.z = lerp(bgGroup.current.position.z, targetZ - 10, 0.05);
    bgGroup.current.scale.setScalar(lerp(bgGroup.current.scale.x, targetScale * 0.15, 0.05));
    bgGroup.current.rotation.x = lerp(bgGroup.current.rotation.x, Math.PI / 6 + globalMouse.y * 0.5, 0.1);
    bgGroup.current.rotation.z = lerp(bgGroup.current.rotation.z, -globalMouse.x * 0.5, 0.1);

    // Focal Element
    focalGroup.current.position.z = lerp(focalGroup.current.position.z, targetZ, 0.05);
    focalGroup.current.scale.setScalar(lerp(focalGroup.current.scale.x, targetScale * 0.9, 0.05));
    focalGroup.current.rotation.y += 0.005;
    focalGroup.current.rotation.x = Math.PI * 0.1;

    if (finaleFactor > 0) {
      const angle = state.clock.getElapsedTime() * 0.3 + Math.PI * 1.2;
      const radius = 12;
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, Math.cos(angle) * (radius + 5), 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.sin(angle) * (radius + 5), 0.05);

      focalGroup.current.position.x = lerp(focalGroup.current.position.x, Math.cos(angle) * radius, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, Math.sin(angle) * radius, 0.05);
    } else {
      bgGroup.current.position.x = lerp(bgGroup.current.position.x, globalMouse.x * 2, 0.05);
      bgGroup.current.position.y = lerp(bgGroup.current.position.y, Math.cos(state.clock.getElapsedTime() * 0.2) * -2, 0.05);

      focalGroup.current.position.x = lerp(focalGroup.current.position.x, targetX, 0.05);
      focalGroup.current.position.y = lerp(focalGroup.current.position.y, 0, 0.05);
    }
  });

  return (
    <group>
      <group ref={bgGroup}>
        {slicers.map((slicer, i) => <SingleSlicer key={i} config={slicer} />)}
      </group>
      <group ref={focalGroup} visible={!isMobile}>
        <SingleSlicer config={{ position: [0, 0, 0], scale: 1, rotationSpeed: [0, 0, 0] }} />
      </group>
    </group>
  );
}

// Mixed Finale Field - Peak: 0.625 to 1.0 (SQL, DAX, Certs, Contact)
function MixedFinale() {
  const bgGroup = useRef();
  const scroll = useSmoothedScroll();

  const elements = useMemo(() => {
    return Array.from({ length: 150 }).map(() => ({
      type: Math.floor(Math.random() * 4), // 0: Pie, 1: Bar, 2: Slicer, 3: Node
      position: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40],
      scale: Math.random() * Math.random() * 1.2 + 0.1,
      rotationSpeed: [(Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02]
    }));
  }, []);

  useFrame((state) => {
    // Plateau: Mixed Finale (0.625 to 1.000), with -0.035 buffer
    const { targetZ, targetScale } = getFocusTransform(scroll.current, 0.59, 1.00);
    
    // Slowly drifting giant mixed field
    bgGroup.current.position.z = lerp(bgGroup.current.position.z, targetZ - 10, 0.05);
    bgGroup.current.scale.setScalar(lerp(bgGroup.current.scale.x, targetScale * 0.25, 0.05));
    bgGroup.current.rotation.x = lerp(bgGroup.current.rotation.x, globalMouse.y * 0.3, 0.05);
    bgGroup.current.rotation.y = lerp(bgGroup.current.rotation.y, state.clock.getElapsedTime() * 0.02 + globalMouse.x * 0.3, 0.05);
  });

  return (
    <group ref={bgGroup}>
      {elements.map((el, i) => {
        if (el.type === 0) return <SinglePie key={i} config={el} />;
        if (el.type === 1) return <SingleBarChart key={i} config={el} />;
        if (el.type === 2) return <SingleSlicer key={i} config={el} />;
        return (
          <Sphere key={i} position={el.position} scale={el.scale} args={[0.5, 16, 16]}>
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} emissive="#ffffff" emissiveIntensity={0.2} />
          </Sphere>
        );
      })}
    </group>
  );
}

// Camera control wrapper to subtly shift entire scene based on mouse
function CameraRig() {
  useFrame((state) => {
    state.camera.position.x = lerp(state.camera.position.x, globalMouse.x * 2, 0.05);
    state.camera.position.y = lerp(state.camera.position.y, globalMouse.y * 2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ThreeCanvas() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#050507']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#FF7A00" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <CameraRig />
        
        <DataNetwork />
        <AnalyticsBars />
        <Slicers />
        <PieCharts />
        <MixedFinale />
        
        <fog attach="fog" args={['#050507', 10, 30]} />
      </Canvas>
    </div>
  );
}
