import { OrbitControls, MeshDistortMaterial, Float, Sphere, MeshWobbleMaterial, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function AbstractSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
      
      // Gentle pulsing when hovered
      if (hovered) {
        const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
        meshRef.current.scale.set(s, s, s);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
        scale={1}
      >
        <MeshDistortMaterial
          color={clicked ? "#ffffff" : hovered ? "#60a5fa" : "#3b82f6"}
          speed={4}
          distort={0.4}
          radius={1}
          metalness={0.8}
          roughness={0.1}
        />
      </Sphere>
    </Float>
  );
}

function Grid() {
  return (
    <gridHelper
      args={[20, 20, "#2d2d33", "#111114"]}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function Scene() {
  return (
    <div id="scene-container" className="w-full h-full absolute top-0 left-0 -z-10 bg-bg-main">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <AbstractSphere />
        <Grid />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
