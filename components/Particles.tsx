import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioController } from '../services/audioService';
import { OpalTheme } from '../types';

interface ParticlesProps {
  count?: number;
  theme: OpalTheme;
  sensitivity: number;
}

const Particles: React.FC<ParticlesProps> = ({ count = 400, theme, sensitivity }) => {
  const mesh = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Starfield sphere distribution
      const r = 15 + Math.random() * 20; // Outside the mandala
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  // Use first selected color for particles, or white default
  const color = useMemo(() => {
     return new THREE.Color(theme.colors[0] || '#ffffff');
  }, [theme.colors]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    const audioData = audioController.getAnalysis();
    const energy = audioData.average;
    
    // Only rotate if there is sound
    if (energy > 0.02) {
      // Slowly rotate background starfield
      mesh.current.rotation.y += delta * 0.02;
      mesh.current.rotation.z += delta * 0.01;
    }

    const material = mesh.current.material as THREE.PointsMaterial;
    // Pulse opacity with bass
    material.opacity = 0.3 + audioData.bass * 0.5;
    material.color.lerp(color, 0.1); // Smooth transition if colors change
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={theme.colors[0] || '#ffffff'}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;