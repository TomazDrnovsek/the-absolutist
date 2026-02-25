
import React from 'react';
import { HSL } from '../types';
import { hslToString, getPerceivedBrightness } from '../utils/color';
import ShapePrimitive from './ShapePrimitive';

interface HarmonyNodeViewProps {
  id: number;
  color: HSL;
  isLocked: boolean;
  isSelected: boolean;
  isBauhausMode: boolean;
  onClick: (id: number) => void;
  onDoubleClick?: (id: number) => void;
  size?: number;
  isHintTarget?: boolean;
}

const HarmonyNodeView: React.FC<HarmonyNodeViewProps> = ({
  id,
  color,
  isLocked,
  isSelected,
  isBauhausMode,
  onClick,
  onDoubleClick,
  size = 40,
  isHintTarget = false,
}) => {
  const brightness = getPerceivedBrightness(color);
  const contrastColor = brightness > 130 ? '#121212' : '#FFFFFF';
  const isInteractive = !isLocked;

  return (
    <div
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        transition-all duration-300 ease-out
        ${isSelected ? 'z-30 scale-110' : 'z-10 scale-100'}
        ${isInteractive ? 'cursor-pointer touch-manipulation' : 'cursor-default'}
      `}
      onClick={() => isInteractive && onClick(id)}
      onDoubleClick={() => isInteractive && onDoubleClick && onDoubleClick(id)}
      style={{
        width: size,
        height: size,
      }}
    >
      {isHintTarget && (
        <div className="absolute inset-[-4px] z-0">
          <svg
            className="w-full h-full overflow-visible animate-hint-pulse"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="49"
              fill="none"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
          </svg>
        </div>
      )}

      {/* SELECTION RING
        - Bauhaus Mode: shape outline (ShapePrimitive with variant="outline")
        - Normal Mode: circle border
      */}
      <div
        className={`
          absolute transition-all duration-200 pointer-events-none
          ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          ${isBauhausMode ? 'inset-0' : 'inset-[-4px]'}
        `}
      >
        {isBauhausMode ? (
             <ShapePrimitive
                hue={color.h}
                color="transparent"
                isBauhausMode={true}
                variant="outline"
                id={`sel-${id}`}
                className="w-full h-full"
             />
        ) : (
             <div className="w-full h-full rounded-full border border-[#121212]" />
        )}
      </div>

      {/* THE SWATCH BODY
        - Removed drop-shadow to prevent visual centering offsets
      */}
      <div className="relative w-full h-full z-10">
         <ShapePrimitive
            hue={color.h}
            color={hslToString(color)}
            isBauhausMode={isBauhausMode}
            hasBorder={!isBauhausMode}
            className={`w-full h-full ${!isBauhausMode ? 'rounded-full' : ''}`}
         />

         {/* LOCKED INDICATOR */}
         {isLocked && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: contrastColor }}
                 />
             </div>
         )}
      </div>
    </div>
  );
};

export default HarmonyNodeView;
