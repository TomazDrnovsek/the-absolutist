
import React, { useRef, useState } from 'react';
import { audio } from '../utils/audio';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  gradient?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, onChange, disabled, gradient }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const lastTickRef = useRef<number>(0);
  const lastValueRef = useRef<number>(value);
  
  // State to track if the user is currently interacting with this slider
  const [isActive, setIsActive] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    onChange(newVal);

    // Audio/Haptic Feedback
    const now = Date.now();
    
    if (Math.abs(newVal - lastValueRef.current) >= 1 && (now - lastTickRef.current > 50)) {
        audio.playTick();
        audio.triggerHaptic(1);
        lastTickRef.current = now;
        lastValueRef.current = newVal;
    }
  };

  return (
    <div className="flex flex-col w-full select-none touch-none">
      <div className="flex justify-between items-baseline mb-2">
        {/* TYPOGRAPHY UPDATE: Bold + Darker when active */}
        <label 
            className={`
                text-[10px] uppercase tracking-widest transition-all duration-200
                ${isActive ? 'font-bold text-[#121212]' : 'font-normal text-neutral-500'}
            `}
        >
            {label}
        </label>

        {/* Numeric Readout */}
        <span 
            className={`
                text-[10px] tabular-nums tracking-widest transition-all duration-200
                ${isActive ? 'font-bold text-[#121212]' : 'font-normal text-neutral-500'}
            `}
        >
            {Math.round(value)}
        </span>
      </div>
      
      <div className="relative h-6 w-full flex items-center group">
        {/* Track - Thin Line */}
        <div className="absolute w-full h-[2px] bg-neutral-300 pointer-events-none top-1/2 -translate-y-1/2">
           {/* Active/Gradient portion */}
           <div 
             className="h-full w-full opacity-100"
             style={{ 
               width: '100%',
               background: disabled ? '#ccc' : (gradient || '#121212'),
             }} 
           />
        </div>
        
        {/* Input - Expanded Touch Zone (48px) */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          // Interaction Handlers for Bold Effect
          onPointerDown={() => setIsActive(true)}
          onPointerUp={() => setIsActive(false)}
          onPointerLeave={() => setIsActive(false)}
          onBlur={() => setIsActive(false)}
          className="absolute h-12 opacity-0 cursor-pointer z-10 top-1/2 -translate-y-1/2 m-0"
          style={{
            width: 'calc(100% + 40px)',
            left: '-20px'
          }}
        />

        {/* Thumb - Circle */}
        <div 
            className={`
                absolute h-4 w-4 bg-[#121212] border border-[#121212] rounded-full pointer-events-none transition-transform duration-100 ease-out z-20 top-1/2 -translate-y-1/2
                ${isActive ? 'scale-125' : 'scale-100'} 
            `}
            style={{ 
                left: `calc(${percentage}% - 8px)`,
                opacity: disabled ? 0 : 1
            }}
        />
      </div>
    </div>
  );
};

export default Slider;
