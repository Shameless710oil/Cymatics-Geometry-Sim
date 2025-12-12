import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { audioController } from '../services/audioService';
import { OpalTheme } from '../types';
import './OpalShaderMaterial';

interface CymaticMandalaProps {
  theme: OpalTheme;
  sensitivity: number;
  brightness: number;
  speed: number;
}

const CymaticMandala: React.FC<CymaticMandalaProps> = ({ theme, sensitivity, brightness, speed }) => {
  const materialRef = useRef<any>(null);
  const { viewport } = useThree();
  
  const visualTime = useRef(0);
  
  // Audio Texture Setup
  const textureSize = 256;
  const dataTexture = useMemo(() => {
    const data = new Uint8Array(textureSize);
    const texture = new THREE.DataTexture(data, textureSize, 1, THREE.RedFormat);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // Convert theme hex strings to THREE.Color objects
  // We need a fixed array of 5 for the shader
  const colorUniforms = useMemo(() => {
    const colors = new Array(5).fill(new THREE.Color(0,0,0));
    theme.colors.forEach((hex, i) => {
      if (i < 5) colors[i] = new THREE.Color(hex);
    });
    // If only 1 color, fill the rest with it to avoid black mixing
    if (theme.colors.length === 1) {
        colors.fill(new THREE.Color(theme.colors[0]));
    }
    return colors;
  }, [theme.colors]);

  const smoothedBeat = useRef(0);

  useFrame((state, delta) => {
    const audioData = audioController.getAnalysis();
    
    if (audioData.raw.length > 0) {
      const sourceData = audioData.raw;
      const targetData = dataTexture.image.data;
      const usefulBinCount = Math.floor(sourceData.length * 0.75); 
      
      for (let i = 0; i < textureSize; i++) {
        const sourceIndex = Math.floor((i / textureSize) * usefulBinCount);
        const actualIndex = (sourceIndex === 0) ? 1 : sourceIndex;
        const val = sourceData[actualIndex < sourceData.length ? actualIndex : 0] || 0;
        targetData[i] = val;
      }
      
      dataTexture.needsUpdate = true;
    }

    if (audioData.beat > smoothedBeat.current) {
        smoothedBeat.current = audioData.beat;
    } else {
        smoothedBeat.current = THREE.MathUtils.lerp(smoothedBeat.current, 0, delta * 3.0);
    }

    const energy = audioData.average;
    const noiseFloor = 0.02; 
    
    // Accumulate time based on speed prop and audio energy
    // Using speed here ensures smooth acceleration/deceleration
    if (energy > noiseFloor) {
      visualTime.current += delta * speed * (0.5 + energy * 0.5);
    } else {
      // Slow movement even when silent, if speed > 0
      visualTime.current += delta * speed * 0.1;
    }

    if (materialRef.current) {
      materialRef.current.uTime = visualTime.current;
      materialRef.current.uAudioTexture = dataTexture;
      materialRef.current.uSensitivity = sensitivity;
      materialRef.current.uBrightness = brightness;
      materialRef.current.uResolution = new THREE.Vector2(viewport.width, viewport.height);
      materialRef.current.uBeat = smoothedBeat.current;
      
      // Update Color Arrays
      materialRef.current.uColors = colorUniforms;
      materialRef.current.uColorCount = theme.colors.length;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <opalMaterial
        ref={materialRef}
        transparent={false}
        uColors={colorUniforms}
        uColorCount={theme.colors.length}
      />
    </mesh>
  );
};

export default CymaticMandala;