import React from 'react';
import { OpalTheme, AudioSourceType } from '../types';

interface ControlsProps {
  currentTheme: OpalTheme;
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioSourceType: AudioSourceType;
  showParticles: boolean;
  onToggleParticles: () => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  speed: number;
  onSpeedChange: (val: number) => void;
  onBack: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentTheme,
  isPlaying,
  onTogglePlay,
  audioSourceType,
  showParticles,
  onToggleParticles,
  sensitivity,
  onSensitivityChange,
  brightness,
  onBrightnessChange,
  speed,
  onSpeedChange,
  onBack,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-16">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
        
        {/* Left: Playback & Source Info */}
        <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-start">
          {audioSourceType === AudioSourceType.FILE && (
            <button
              onClick={onTogglePlay}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shadow-lg shadow-white/20"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          )}
          
          <div>
            <h3 className="text-white font-bold text-lg leading-tight flex gap-2 items-center justify-center xl:justify-start">
              Palette
              <div className="flex -space-x-1">
                 {currentTheme.colors.map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border border-white/50" style={{backgroundColor: c}} />
                 ))}
              </div>
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center xl:justify-start">
               <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
               {audioSourceType === AudioSourceType.MICROPHONE ? 'Live Input Active' : 'Now Playing'}
            </div>
          </div>
        </div>

        {/* Center: Sliders */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          
          {/* Sensitivity Slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 flex justify-between font-mono">
              <span>Sensitivity</span>
              <span>{(sensitivity * 100).toFixed(0)}%</span>
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="3.0" 
              step="0.1" 
              value={sensitivity} 
              onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300 transition-all"
            />
          </div>

          {/* Brightness Slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 flex justify-between font-mono">
              <span>Brightness</span>
              <span>{(brightness * 100).toFixed(0)}%</span>
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="2.0" 
              step="0.1" 
              value={brightness} 
              onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300 transition-all"
            />
          </div>

          {/* Speed Slider */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 flex justify-between font-mono">
              <span>Shift Speed</span>
              <span>{(speed * 100).toFixed(0)}%</span>
            </label>
            <input 
              type="range" 
              min="0.0" 
              max="3.0" 
              step="0.1" 
              value={speed} 
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 transition-all"
            />
          </div>

        </div>

        {/* Right: Actions */}
        <div className="flex gap-4 items-center justify-center xl:justify-end w-full xl:w-auto">
          <button 
            onClick={onToggleParticles}
            className={`px-3 py-1.5 rounded text-xs border transition-colors ${
              showParticles ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'border-gray-600 text-gray-500 hover:border-gray-400'
            }`}
          >
            Particles {showParticles ? 'ON' : 'OFF'}
          </button>

          <button 
            onClick={onBack}
            className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-200 rounded text-xs transition-colors border border-red-500/20 whitespace-nowrap"
          >
            Change Colors
          </button>
        </div>

      </div>
    </div>
  );
};

export default Controls;