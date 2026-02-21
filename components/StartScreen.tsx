import React from 'react';
import Logo from './Logo';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div 
      onClick={onStart}
      className="fixed inset-0 z-[100] bg-[#F5F2EB] flex flex-col items-center justify-center cursor-pointer select-none animate-in fade-in duration-700 font-sans"
    >
      <div className="transform scale-125 origin-center mb-2">
        <Logo />
      </div>

      {/* Calibration Heartbeat */}
      <div className="my-12 flex flex-col items-center gap-6 h-24 justify-center">
        {/* The Shape - Rotating SVG */}
        <div className="w-16 h-16">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 300 300"
                className="w-full h-full animate-[spin_10s_linear_infinite]"
                style={{ overflow: 'visible' }}
            >
              <line x1="149.5" y1="79.3" x2="61.9" y2="220.7" fill="none" stroke="#1d1d1b" strokeMiterlimit="10" strokeWidth="2.2"/>
              <line x1="149.5" y1="79.3" x2="238.1" y2="220.7" fill="none" stroke="#1d1d1b" strokeMiterlimit="10" strokeWidth="2.2"/>
              <line x1="54.5" y1="220.7" x2="246.3" y2="220.7" fill="none" stroke="#1d1d1b" strokeMiterlimit="10" strokeWidth="2.2"/>
              <circle cx="149.5" cy="79.3" r="50.3" fill="#1313ec" stroke="#1d1d1b" strokeMiterlimit="10" strokeWidth="2.2"/>
              <circle cx="238.1" cy="220.7" r="50.3" fill="#ecec13" stroke="#1d1d1b" strokeMiterlimit="10" strokeWidth="2.2"/>
              <circle cx="61.9" cy="220.7" r="50.3" fill="#ec1313" stroke="#1d1d1b" strokeMiterlimit="10" strokeWidth="2.2"/>
            </svg>
        </div>
        
        {/* FIXED: Changed "SYSTEM_READY" to "TAP TO INITIALIZE"
           FIXED: Removed 'animate-pulse' for a steady, confident Swiss look.
        */}
        <div className="text-[9px] font-mono font-medium uppercase tracking-[0.25em] text-neutral-400 tabular-nums">
             TAP TO INITIALIZE
        </div>
      </div>
      
      <div className="text-[10px] font-bold tracking-[0.3em] text-[#121212] uppercase opacity-60">
        ALIGN YOUR PERCEPTION
      </div>
    </div>
  );
};

export default StartScreen;