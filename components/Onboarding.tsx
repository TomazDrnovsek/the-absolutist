
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
  const [userColor, setUserColor] = useState<HSL>({ h: 200, s: 50, l: 40 }); 
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Label sequence state ---
  const [showTune, setShowTune] = useState(true);
  const [showComplementary, setShowComplementary] = useState(false);

  useEffect(() => {
    // Fade out TUNE THE HARMONY at 4s
    const outTimer = setTimeout(() => setShowTune(false), 4000);
    // Fade in COMPLEMENTARY after fade-out completes (500ms gap)
    const inTimer  = setTimeout(() => setShowComplementary(true), 4500);
    return () => { clearTimeout(outTimer); clearTimeout(inTimer); };
  }, []);

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
      
      if (currentScore >= 80) {
          setIsSuccess(true);
          audio.playSuccess();
          audio.triggerHaptic([10, 50, 10, 50]);

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
        
        {/* --- 1. TOP SECTION: HARMONY VIEW --- */}
        <div className="flex-1 w-full relative z-10 flex items-center justify-center p-4 touch-none">
            <div className="relative aspect-square w-full max-h-[50vh] max-w-[50vh] flex items-center justify-center">
                 <HarmonyView 
                    level={tutorialLevel} 
                    activeNodeId={2} 
                    onSelectNode={() => {}} 
                    onNodeDoubleClick={() => {}} 
                    isBauhausMode={false}
                    isRevealed={false}
                    isWin={false}
                    showLabel={false}
                 />
                 
                 {/* Label sequence — hidden on success */}
                 {!isSuccess && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center justify-center">

                     {/* Wrapper handles fade — inner span handles pulse. No opacity conflict. */}
                     <div
                       className="absolute"
                       style={{ opacity: showTune ? 1 : 0, transition: 'opacity 500ms ease-in-out' }}
                     >
                       <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#121212] text-center whitespace-nowrap animate-pulse">
                         TUNE THE HARMONY
                       </span>
                     </div>

                     <div
                       className="absolute"
                       style={{ opacity: showComplementary ? 1 : 0, transition: 'opacity 500ms ease-in-out' }}
                     >
                       <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#121212] text-center whitespace-nowrap animate-pulse">
                         {tutorialLevel.harmonyType}
                       </span>
                     </div>

                   </div>
                 )}
            </div>
        </div>

        {/* --- 2. BOTTOM SECTION: SLIDERS --- */}
        <div className="h-[45%] shrink-0 bg-[#F5F2EB] flex flex-col px-6 pb-safe-bottom z-30">
             <div className="flex-1 flex flex-col h-full justify-center">
                 <div className="flex flex-col gap-6">
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

        {/* --- 3. SUCCESS OVERLAY --- */}
        {isSuccess && (
          <div className="fixed inset-0 z-50 bg-[#F5F2EB] flex flex-col font-sans text-[#121212] animate-in fade-in duration-500">
              
              <div className="flex-1 w-full relative z-10 flex items-center justify-center p-4 pointer-events-none">
                  <div className="relative aspect-square w-full max-h-[50vh] max-w-[50vh] flex items-center justify-center">
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

              <div className="h-[45%] shrink-0 flex flex-col px-6 pt-8 pb-safe-bottom relative z-30 pointer-events-none">
                   <div className="flex-1 flex flex-col h-full">
                       <div className="flex flex-col items-center justify-center gap-3 pt-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
                          <div className="text-6xl font-medium tabular-nums text-[#121212]">
                              RESONANCE
                          </div>
                          <div className="flex gap-4 mb-1 opacity-80">
                              <span className="text-xs font-bold text-neutral-500 uppercase tracking-[0.25em]">
                                  EYE CALIBRATED — ASSIGNMENTS BEGIN
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
