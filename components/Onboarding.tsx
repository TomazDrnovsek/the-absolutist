
import React, { useState, useEffect } from 'react';
import { HSL, LevelData } from '../types';
import { calculateMatchScore, hslToString } from '../utils/color';
import HarmonyView from './HarmonyView';
import Slider from './Slider';
import { audio } from '../utils/audio';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  // --- State ---
  // Start with an off-target color to require interaction
  const [userColor, setUserColor] = useState<HSL>({ h: 200, s: 50, l: 40 }); 
  const [isSuccess, setIsSuccess] = useState(false);
  
  // --- Tutorial Level Data ---
  const rootColor: HSL = { h: 350, s: 85, l: 50 }; 
  const targetColor: HSL = { h: 170, s: 85, l: 50 }; 

  const tutorialLevel: LevelData = {
      levelNumber: 0,
      harmonyType: 'complementary',
      rootColor: rootColor,
      nodes: [
          { id: 1, isLocked: true, targetColor: rootColor, userColor: rootColor },
          { id: 2, isLocked: false, targetColor: targetColor, userColor: userColor }
      ]
  };

  // --- Logic ---
  const handleUpdateColor = (key: keyof HSL, val: number) => {
      if (isSuccess) return;
      setUserColor(prev => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
      if (isSuccess) return;

      const currentScore = calculateMatchScore(targetColor, userColor);
      
      // Threshold: 80% 
      if (currentScore >= 80) {
          setIsSuccess(true);
          audio.playSuccess();
          audio.triggerHaptic([10, 50, 10, 50]);

          // AUTO-PROGRESS: Wait exactly 3 seconds (3000ms), then proceed
          setTimeout(() => {
              onComplete();
          }, 3000);
      }
  }, [userColor, targetColor, isSuccess, onComplete]);

  const hueGradient = 'linear-gradient(to right, #F00 0%, #FF0 17%, #0F0 33%, #0FF 50%, #00F 67%, #F0F 83%, #F00 100%)';
  const satGradient = `linear-gradient(to right, ${hslToString({h: userColor.h, s: 0, l: userColor.l})}, ${hslToString({h: userColor.h, s: 100, l: userColor.l})})`;
  const lightGradient = `linear-gradient(to right, #121212, ${hslToString({h: userColor.h, s: userColor.s, l: 50})}, #FFF)`;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5F2EB] font-sans overflow-hidden select-none text-[#121212]">
        
        {/* --- 1. TOP SECTION: HARMONY VIEW (No Header) --- */}
        <div className="flex-1 w-full relative z-10 flex items-center justify-center p-4 touch-none">
            <div className="relative aspect-square h-[50vh] max-h-full max-w-full flex items-center justify-center">
                 <HarmonyView 
                    level={tutorialLevel} 
                    activeNodeId={2} 
                    onSelectNode={() => {}} 
                    onNodeDoubleClick={() => {}} 
                    isBauhausMode={false}
                    // FIXED: Kept strictly false so the background doesn't double-animate
                    isRevealed={false}
                    isWin={false}
                    showLabel={false}
                 />
                 
                 {/* Hint Overlay */}
                 {!isSuccess && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none select-none">
                         <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2 animate-pulse whitespace-nowrap">
                             Match the harmony
                         </span>
                         <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#121212] opacity-40">
                             {tutorialLevel.harmonyType}
                         </span>
                     </div>
                 )}
            </div>
        </div>

        {/* --- 2. BOTTOM SECTION: SLIDERS --- */}
        <div className="h-[45%] shrink-0 bg-[#F5F2EB] flex flex-col px-6 pb-safe-bottom z-30">
             <div className="flex-1 flex flex-col h-full justify-center">
                 <div className="flex flex-col gap-10">
                      <Slider 
                          label="H" 
                          value={userColor.h} min={0} max={360} 
                          onChange={(v) => handleUpdateColor('h', v)} 
                          gradient={hueGradient} 
                          disabled={isSuccess}
                      />
                      <Slider 
                          label="S" 
                          value={userColor.s} min={0} max={100} 
                          onChange={(v) => handleUpdateColor('s', v)} 
                          gradient={satGradient} 
                          disabled={isSuccess}
                      />
                      <Slider 
                          label="L" 
                          value={userColor.l} min={0} max={100} 
                          onChange={(v) => handleUpdateColor('l', v)} 
                          gradient={lightGradient} 
                          disabled={isSuccess}
                      />
                 </div>
             </div>
        </div>

        {/* --- 3. SUCCESS OVERLAY (Matches main game structure) --- */}
        {isSuccess && (
          <div className="fixed inset-0 z-50 bg-[#F5F2EB] flex flex-col font-sans text-[#121212] animate-in fade-in duration-500">
              
              {/* TOP STAGE: Matches the exact height and layout of the Onboarding gameplay section */}
              <div className="flex-1 w-full relative z-10 flex items-center justify-center p-4 pointer-events-none">
                  <div className="relative aspect-square h-[50vh] max-h-full max-w-full flex items-center justify-center">
                       <HarmonyView 
                          level={tutorialLevel} 
                          activeNodeId={-1} 
                          onSelectNode={() => {}} 
                          isBauhausMode={false}
                          isRevealed={true}
                          isWin={true}
                          showLabel={false}
                       />
                  </div>
              </div>

              {/* BOTTOM STAGE: Matches the layout and padding of the main game's win screen controls */}
              <div className="h-[45%] shrink-0 flex flex-col px-6 pt-8 pb-safe-bottom relative z-30 pointer-events-none">
                   <div className="flex-1 flex flex-col h-full">
                       
                       {/* TEXT ALIGNMENT */}
                       <div className="flex flex-col items-center justify-center gap-3 pt-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
                          {/* Matches main game's "Score" font size and position */}
                          <div className="text-6xl font-medium tabular-nums text-[#121212]">
                              MATCH
                          </div>
                          
                          {/* Matches main game's "Deltas" font size, color, and position */}
                          <div className="flex gap-4 mb-1 opacity-80">
                              <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.25em]">
                                  SENSOR CALIBRATED
                              </span>
                          </div>
                       </div>

                   </div>
              </div>
          </div>
        )}

    </div>
  );
};

export default Onboarding;
