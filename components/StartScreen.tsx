import React from 'react';
import { AudioSourceType } from '../types';
import HoneycombPicker from './HoneycombPicker';

interface StartScreenProps {
  onStart: (source: AudioSourceType, file?: File) => void;
  selectedColors: string[];
  onToggleColor: (color: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, selectedColors, onToggleColor }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onStart(AudioSourceType.FILE, e.target.files[0]);
    }
  };

  const isStartDisabled = selectedColors.length === 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-4 overflow-y-auto">
      <div className="max-w-4xl w-full text-center space-y-6 animate-fade-in py-8">
        
        <header>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-purple-300 to-orange-200 animate-pulse tracking-tight mb-2">
            Opal Odyssey
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Select up to 5 colors to forge your gem
          </p>
        </header>

        {/* Honeycomb Picker */}
        <div className="my-6">
           <HoneycombPicker selectedColors={selectedColors} onToggleColor={onToggleColor} />
           <p className="text-sm text-gray-500 mt-2 h-4">
             {selectedColors.length}/5 Selected
           </p>
        </div>

        {/* Audio Input Controls */}
        <div className={`transition-opacity duration-500 ${isStartDisabled ? 'opacity-30 pointer-events-none blur-sm' : 'opacity-100'}`}>
          <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-2xl mx-auto">
            <h2 className="text-xl font-light tracking-widest uppercase text-gray-300 mb-6">Enter the Tunnel</h2>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              
              {/* Microphone Option */}
              <button
                onClick={() => onStart(AudioSourceType.MICROPHONE)}
                className="flex flex-col items-center justify-center w-full md:w-48 h-24 rounded-xl border-2 border-dashed border-teal-500/50 hover:bg-teal-500/10 hover:border-teal-500 transition-all group"
              >
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="font-medium text-teal-200">Microphone</span>
                </div>
              </button>

              <span className="text-gray-500 font-serif italic text-sm">or</span>

              {/* File Upload Option */}
              <label className="flex flex-col items-center justify-center w-full md:w-48 h-24 rounded-xl border-2 border-dashed border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 transition-all cursor-pointer group">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="font-medium text-purple-200">Upload MP3</span>
                </div>
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>

            </div>
          </div>
        </div>
        
        {isStartDisabled && (
             <p className="text-red-400 text-sm animate-pulse">Pick at least one color to start</p>
        )}

      </div>
    </div>
  );
};

export default StartScreen;