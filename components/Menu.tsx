
import React from 'react';
import { audio } from '../utils/audio';
import MechanicalButton from './MechanicalButton';

interface MenuProps {
  onClose: () => void;
  onOpenArchive: () => void;
  isBauhausMode: boolean;
  toggleBauhausMode: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  onRestartOnboarding: () => void;
  onDevGenerate?: () => void; // Optional for safety
}

const Menu: React.FC<MenuProps> = ({ 
    onClose, 
    onOpenArchive,
    isBauhausMode, 
    toggleBauhausMode,
    isSoundEnabled,
    toggleSound,
    onRestartOnboarding,
    onDevGenerate
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col animate-in slide-in-from-left duration-300 font-sans text-[#121212]">
      
      {/* HEADER: Match App.tsx header exact layout 
         - Removed heavy border-b-[3px]
         - Changed to border-b border-[#eae7e0] (1px light gray)
         - Adjusted padding to py-4 to match main screen
         - Added pt-safe-top to handle notch
      */}
      <div className="shrink-0 relative flex flex-col pt-safe-top z-20 border-b border-[#eae7e0] bg-[#F5F2EB]">
         <div className="w-full px-6 py-4 flex justify-between items-center relative z-30 shrink-0">
            <h2 className="text-4xl font-bold lowercase tracking-[-0.04em]">menu.</h2>
            <MechanicalButton 
                onTrigger={() => {
                    audio.playClick();
                    onClose();
                }} 
                scaleActive={0.85}
                // FIXED: Increased touch target to 48px (w-12 h-12)
                className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors text-sm"
            >
                ✕
            </MechanicalButton>
         </div>
      </div>

      <nav className="flex-1 flex flex-col gap-8 overflow-y-auto overflow-x-hidden p-6 pb-safe-bottom w-full">
        {/* 01 RESUME */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onClose();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">01</span>
            <span className="flex-1 min-w-0 text-2xl font-light uppercase tracking-widest group-hover:translate-x-2 group-hover:font-bold transition-all text-[#121212] truncate">
                resume
            </span>
        </MechanicalButton>
        
        {/* 02 BAUHAUS */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                toggleBauhausMode();
            }}
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">02</span>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <span className="text-2xl font-light uppercase tracking-widest text-[#121212] truncate group-hover:translate-x-2 group-hover:font-bold transition-all">
                    bauhaus
                </span>
                
                <div className="flex items-center ml-4 shrink-0">
                    <div className={`
                        w-12 h-6 border-2 border-[#121212] p-1 relative transition-colors duration-200
                        ${isBauhausMode ? 'bg-[#121212]' : 'bg-transparent'}
                    `}>
                        <div className={`
                            h-full w-1/2 bg-[#121212] transition-all duration-300 ease-out
                            ${isBauhausMode ? 'translate-x-full bg-white' : 'translate-x-0'}
                        `} />
                    </div>
                </div>
            </div>
        </MechanicalButton>

        {/* 03 SOUND */}
        <MechanicalButton 
            onTrigger={() => {
                // Force unmute briefly to ensure the feedback click is heard when turning sound ON
                if (!isSoundEnabled) audio.setMuted(false);
                audio.playClick();
                toggleSound();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">03</span>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                <span className="text-2xl font-light uppercase tracking-widest text-[#121212] truncate group-hover:translate-x-2 group-hover:font-bold transition-all">
                    sound
                </span>
                
                <div className="flex items-center ml-4 shrink-0">
                    <div className={`
                        w-12 h-6 border-2 border-[#121212] p-1 relative transition-colors duration-200
                        ${isSoundEnabled ? 'bg-[#121212]' : 'bg-transparent'}
                    `}>
                        <div className={`
                            h-full w-1/2 bg-[#121212] transition-all duration-300 ease-out
                            ${isSoundEnabled ? 'translate-x-full bg-white' : 'translate-x-0'}
                        `} />
                    </div>
                </div>
            </div>
        </MechanicalButton>

        {/* 04 TUTORIAL */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onRestartOnboarding();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">04</span>
            <span className="flex-1 min-w-0 text-2xl font-light uppercase tracking-widest group-hover:translate-x-2 group-hover:font-bold transition-all text-[#121212] truncate">
                tutorial
            </span>
        </MechanicalButton>

        {/* 05 SESSIONS */}
        <MechanicalButton 
            onTrigger={() => {
                audio.playClick();
                onOpenArchive();
            }} 
            scaleActive={0.98}
            className="text-left group flex items-baseline gap-6 w-full max-w-full"
        >
            <span className="text-xs font-normal tabular-nums text-neutral-400/60 group-hover:text-[#121212] transition-colors shrink-0">05</span>
            <span className="flex-1 min-w-0 text-2xl font-light uppercase tracking-widest group-hover:translate-x-2 group-hover:font-bold transition-all text-[#121212] truncate">
                sessions
            </span>
        </MechanicalButton>

        <div className="mt-auto pt-12 flex flex-col items-center gap-4 opacity-30">
            {/* FIXED: Bumped min font size to 10px */}
            <span className="text-[10px] font-mono tracking-widest text-[#121212] uppercase">
                V1.2.9
            </span>

            {/* DEV BUTTON */}
            {onDevGenerate && (
                <MechanicalButton 
                    onTrigger={() => {
                        onDevGenerate();
                        onOpenArchive(); // Auto-navigate to see results
                    }}
                    // FIXED: Bumped min font size to 10px
                    className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 px-2 py-1"
                >
                    [DEV] GENERATE x10
                </MechanicalButton>
            )}
        </div>
      </nav>
    </div>
  );
};

export default Menu;
