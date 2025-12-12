import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CymaticMandala from './OpalTunnel';
import Particles from './Particles';
import { OpalTheme } from '../types';

interface SceneProps {
  theme: OpalTheme;
  showParticles: boolean;
  sensitivity: number;
  brightness: number;
  speed: number;
}

const Scene: React.FC<SceneProps> = ({ theme, showParticles, sensitivity, brightness, speed }) => {
  return (
    <Canvas
      // Orthographic camera ensures the cymatic plane is flat and perfectly framed
      // like a scientific instrument or a 2D screen
      orthographic
      camera={{ zoom: 100, position: [0, 0, 10] }}
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={['#000000']} />
      
      {/* Lights aren't strictly necessary for the unlit shader, but kept for Particles if needed */}
      <ambientLight intensity={0.5} />
      
      <CymaticMandala 
        theme={theme} 
        sensitivity={sensitivity} 
        brightness={brightness}
        speed={speed}
      />
      
      {/* Optional starfield overlay */}
      {showParticles && (
        <Particles theme={theme} sensitivity={sensitivity} />
      )}
    </Canvas>
  );
};

export default Scene;