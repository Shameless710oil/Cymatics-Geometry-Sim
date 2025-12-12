import React from 'react';

const COLORS = [
  '#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#ffff00', '#bfff00',
  '#80ff00', '#40ff00', '#00ff00', '#00ff40', '#00ff80', '#00ffbf',
  '#00ffff', '#00bfff', '#0080ff', '#0040ff', '#0000ff', '#4000ff',
  '#8000ff', '#bf00ff', '#ff00ff', '#ff00bf', '#ff0080', '#ff0040',
  '#ffffff', '#e0e0e0', '#b0b0b0', '#808080', '#404040', '#000000'
];

interface HoneycombPickerProps {
  selectedColors: string[];
  onToggleColor: (color: string) => void;
}

const HoneycombPicker: React.FC<HoneycombPickerProps> = ({ selectedColors, onToggleColor }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto p-4">
      {COLORS.map((color) => {
        const isSelected = selectedColors.includes(color);
        const isDisabled = !isSelected && selectedColors.length >= 5;

        return (
          <button
            key={color}
            onClick={() => !isDisabled && onToggleColor(color)}
            disabled={isDisabled}
            className={`
              relative w-12 h-14 md:w-16 md:h-20 
              flex items-center justify-center 
              transition-all duration-200 
              focus:outline-none
              ${isDisabled ? 'opacity-20 cursor-not-allowed grayscale' : 'hover:scale-110 cursor-pointer'}
            `}
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              backgroundColor: color,
              boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.8)' : 'none',
              transform: isSelected ? 'scale(1.15)' : 'scale(1)',
              zIndex: isSelected ? 10 : 1
            }}
          >
            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-md border border-gray-500" />
              </div>
            )}
            
            {/* Dark border overlay for better definition */}
            <div 
              className="absolute inset-0 pointer-events-none border-black/20"
              style={{
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(0,0,0,0.1))'
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default HoneycombPicker;