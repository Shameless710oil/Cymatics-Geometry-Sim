import React, { useState, useEffect, useMemo } from 'react';
import Scene from './components/Scene';
import StartScreen from './components/StartScreen';
import Controls from './components/Controls';
import { audioController } from './services/audioService';
import { AudioSourceType, OpalTheme } from './types';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>(['#00ffff', '#ff00ff']); // Default selection
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceType, setSourceType] = useState<AudioSourceType>(AudioSourceType.NONE);
  const [showParticles, setShowParticles] = useState(true);
  
  // Audio & Visual State
  const [sensitivity, setSensitivity] = useState(1.5);
  const [brightness, setBrightness] = useState(1.0);
  const [speed, setSpeed] = useState(0.5);

  const toggleColor = (color: string) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, color];
      }
    });
  };

  // Construct dynamic theme object
  const currentTheme: OpalTheme = useMemo(() => ({
    colors: selectedColors,
    speedModifier: 1.0, // Handled by global speed state now
  }), [selectedColors]);
  
  const handleStart = async (source: AudioSourceType, file?: File) => {
    try {
      if (source === AudioSourceType.MICROPHONE) {
        await audioController.setupMicrophone();
      } else if (source === AudioSourceType.FILE && file) {
        await audioController.setupFile(file);
      }
      
      setSourceType(source);
      audioController.play();
      setIsPlaying(true);
      setHasStarted(true);

    } catch (error) {
      console.error("Failed to initialize audio:", error);
      alert("Could not access audio source. Please ensure microphone permissions are granted.");
      setHasStarted(false);
    }
  };

  const handleStop = () => {
    audioController.cleanup();
    setHasStarted(false);
    setIsPlaying(false);
    setSourceType(AudioSourceType.NONE);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioController.pause();
    } else {
      audioController.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted) return;
      if (e.code === 'Space' && sourceType === AudioSourceType.FILE) {
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isPlaying, sourceType]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      
      {/* 3D Visualizer Layer */}
      {hasStarted && (
        <div className="absolute inset-0 z-0">
          <Scene 
            theme={currentTheme} 
            showParticles={showParticles}
            sensitivity={sensitivity}
            brightness={brightness}
            speed={speed}
          />
        </div>
      )}

      {/* UI Layer */}
      {!hasStarted ? (
        <StartScreen 
          onStart={handleStart} 
          selectedColors={selectedColors}
          onToggleColor={toggleColor}
        />
      ) : (
        <Controls 
          currentTheme={currentTheme}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          audioSourceType={sourceType}
          showParticles={showParticles}
          onToggleParticles={() => setShowParticles(!showParticles)}
          sensitivity={sensitivity}
          onSensitivityChange={setSensitivity}
          brightness={brightness}
          onBrightnessChange={setBrightness}
          speed={speed}
          onSpeedChange={setSpeed}
          onBack={handleStop}
        />
      )}
    </div>
  );
};

export default App;