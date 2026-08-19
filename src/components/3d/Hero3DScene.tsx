import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const AbstractShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color="#7C3AED"
          emissive="#2563EB"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
};

const FloatingElements = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => (
        <Float 
          key={i} 
          speed={1.5 + i * 0.2} 
          rotationIntensity={1} 
          floatIntensity={2}
          position={[
            Math.sin((i / 5) * Math.PI * 2) * 3,
            Math.cos((i / 5) * Math.PI * 2) * 3 + Math.random(),
            (Math.random() - 0.5) * 4
          ]}
        >
          <mesh scale={0.3 + Math.random() * 0.3}>
            <octahedronGeometry />
            <meshPhysicalMaterial 
              color={i % 2 === 0 ? "#FF6B6B" : "#10B981"} 
              roughness={0.2}
              metalness={0.5}
              clearcoat={1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

export default function Hero3DScene() {
  return (
    <div className="w-full h-[600px] absolute inset-0 -z-10 opacity-70 mask-image-b">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]} // limit dpr for performance
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#FF6B6B" />
        
        <PresentationControls 
          global 
          rotation={[0, 0.3, 0]} 
          polar={[-Math.PI / 3, Math.PI / 3]} 
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <AbstractShape />
          <FloatingElements />
        </PresentationControls>
        
        <Environment preset="city" />
        <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
