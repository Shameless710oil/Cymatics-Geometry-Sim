import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Helper to create empty color array
const emptyColors = new Array(5).fill(new THREE.Color(0, 0, 0));

const OpalMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uAudioTexture: new THREE.DataTexture(new Uint8Array(256), 256, 1, THREE.RedFormat),
    uColors: emptyColors, // Array of 5 colors
    uColorCount: 1,       // How many colors are actually used
    uSensitivity: 1.5,
    uBrightness: 1.0,     // New brightness uniform
    uZoom: 1.0,
    uBeat: 0.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uAudioTexture;
    uniform vec3 uColors[5];
    uniform int uColorCount;
    uniform float uSensitivity;
    uniform float uBrightness;
    uniform float uZoom;
    uniform float uBeat;

    varying vec2 vUv;

    #define PI 3.14159265359

    float getAudio(float x) {
        return texture2D(uAudioTexture, vec2(x, 0.0)).r;
    }

    // Dynamic Gradient Palette
    vec3 palette(float t) {
        if (uColorCount <= 1) return uColors[0];
        
        // Wrap t
        float x = fract(t);
        
        // Map 0-1 to 0-(count-1)
        float segment = x * float(uColorCount);
        int index = int(segment);
        float f = fract(segment);
        
        // Manual array access for WebGL1/compatibility safety
        vec3 c1 = vec3(0.0);
        vec3 c2 = vec3(0.0);
        
        if (index == 0) { c1 = uColors[0]; c2 = uColors[1]; }
        else if (index == 1) { c1 = uColors[1]; c2 = uColors[2]; }
        else if (index == 2) { c1 = uColors[2]; c2 = uColors[3]; }
        else if (index == 3) { c1 = uColors[3]; c2 = uColors[4]; }
        else { c1 = uColors[4]; c2 = uColors[0]; } // Loop back to start
        
        // Handle edge case where index might be last element
        if (index >= uColorCount - 1) {
             c1 = uColors[uColorCount - 1];
             c2 = uColors[0];
        }

        return mix(c1, c2, f);
    }

    mat2 rot(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
    }

    void main() {
        vec2 uv = (vUv - 0.5) * 2.0;
        if (uResolution.x > uResolution.y) {
             uv.x *= uResolution.x / uResolution.y;
        } else {
             uv.y *= uResolution.y / uResolution.x;
        }
        
        vec2 uv0 = uv;

        // Audio Inputs
        float s = uSensitivity;
        float bass = getAudio(0.05) * s; 
        float mid = getAudio(0.4) * s;
        float treble = getAudio(0.7) * s;
        float beatKick = uBeat * s;

        vec3 finalColor = vec3(0.0);
        
        // Reactive Zoom
        uv *= 1.0 - (beatKick * 0.1); 

        for (float i = 0.0; i < 3.0; i++) {
            
            float symmetry = 6.0 + floor(bass * 2.5) * 2.0; 
            
            float r = length(uv);
            float a = atan(uv.y, uv.x);
            
            a = mod(a, 2.0 * PI / symmetry);
            a = abs(a - PI / symmetry);
            
            uv = r * vec2(cos(a), sin(a));
            
            float rotSpeed = uTime * 0.1 + (mid * 0.2);
            uv = uv * rot(rotSpeed + i);
            
            // Domain distortion driven by bass/beat
            uv += sin(uv.yx * (4.0 + beatKick * 3.0) + uTime) * (bass * 0.1);

            float freq = 4.0 + i * 2.0 + mid * 8.0; 
            float wave = sin(uv.x * freq + uTime) * sin(uv.y * freq + uTime);
            float d = abs(wave);
            
            // Neon Glow Logic - ADJUSTED FOR SHARPNESS & REDUCED BRIGHTNESS
            // Reduced base glow factor (numerator) and increased exponent (1.2 -> 1.5) for sharper falloff
            float glowSharpness = 0.005 + (0.015 * (1.0 - treble * 0.5));
            d = pow(glowSharpness / max(d, 0.0001), 1.5); 
            d = clamp(d, 0.0, 3.0); // Reduced clamp max

            // Coloring
            float colorPhase = length(uv0) + i * 0.4 + uTime * 0.2 + beatKick;
            vec3 col = palette(colorPhase);
            
            float sparkle = fract(sin(dot(uv0, vec2(12.9898, 78.233))) * 43758.5453);
            float sparkleVis = step(0.98 - (treble * 0.3), sparkle) * treble * 2.0;
            col += vec3(sparkleVis);

            // Accumulate - Reduced multiplier from 0.6/0.8 to 0.4/0.5
            finalColor += col * d * (0.3 + mid * 0.5);
        }

        float len = length(uv0);
        finalColor *= smoothstep(1.8, 0.5, len);
        
        // Background tint using primary color - Reduced intensity
        finalColor += uColors[0] * (beatKick * 0.08);

        // Apply Master Brightness
        finalColor *= uBrightness;

        gl_FragColor = vec4(finalColor, 1.0);
        gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2)); 
    }
  `
);

extend({ OpalMaterial });

export { OpalMaterial };