import { Canvas } from '@react-three/fiber';
import { Float, Box, MeshWobbleMaterial, OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function InteractiveCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <Box 
        args={[1, 1, 1]} 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshWobbleMaterial 
          color={hovered ? "#ff4e00" : "#3b82f6"} 
          factor={0.5} 
          speed={2} 
          metalness={0.9}
          roughness={0.1}
        />
      </Box>
    </Float>
  );
}

export default function SmallScene() {
  return (
    <div className="w-full h-48">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <InteractiveCube />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
