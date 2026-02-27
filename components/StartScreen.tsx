import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div
      onClick={onStart}
      className="fixed inset-0 z-[100] bg-[#F5F2EB] cursor-pointer select-none animate-in fade-in duration-700 font-sans"
    >
      {/* LOGO — ~36% from top, single line guaranteed */}
      <div className="absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
        <h1 className="text-4xl font-black lowercase tracking-tighter leading-none text-[#121212]">
          the absolutist.
        </h1>
      </div>

      {/* ANIMATION — true screen center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-20">
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
      </div>

      {/* TEXT GROUP — anchored to bottom */}
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
        <div className="animate-pulse text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#121212] whitespace-nowrap">
          TAP TO BEGIN CALIBRATION
        </div>
        <div className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase whitespace-nowrap">
          ALIGN YOUR PERCEPTION
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
