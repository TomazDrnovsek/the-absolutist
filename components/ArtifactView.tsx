
import React, { useState, useEffect } from 'react';
import { SessionData } from '../types';
import BauhausComposition from './BauhausComposition';
import MechanicalButton from './MechanicalButton';
import WinEffect from './WinEffect';
import { audio } from '../utils/audio';

interface ArtifactViewProps {
  session: SessionData;
  onArchive: () => void;
}

const ArtifactView: React.FC<ArtifactViewProps> = ({ session, onArchive }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => { audio.playSuccess(); }, 300);
  }, []);

  const handleArchive = () => {
    audio.playTap();
    setIsExiting(true);
    setTimeout(() => { onArchive(); }, 500);
  };

  const handleShare = () => {
    alert('Session Composition copied to clipboard.');
    audio.playClick();
  };

  const avgResonance = Math.round(
    session.progress.reduce((a: number, b) => a + (b || 0), 0) / 20
  );

  return (
    <div className="fixed inset-0 bg-[#F5F2EB] z-[60] flex flex-col justify-between font-sans overflow-hidden px-6">

      {/* Subtle background win effect */}
      <div className={`absolute inset-0 z-0 opacity-20 scale-[1.75] transition-opacity duration-500 ${isExiting ? 'opacity-0' : ''}`}>
        <WinEffect isBauhausMode={true} />
      </div>

      {/* Content */}
      <div className={`
        flex-1 flex flex-col items-stretch w-full relative z-10
        transition-all duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]
        ${isExiting ? 'translate-y-[100vh] opacity-0' : 'translate-y-0 opacity-100'}
      `}>

        <div className="flex-[2]" />

        <p className="text-center text-[9px] font-mono uppercase tracking-[0.28em] text-neutral-400 mb-5 animate-in slide-in-from-top-4 fade-in duration-700 delay-100">
          THE ABSOLUTIST
        </p>

        {/* ── ARTIFACT CARD ── */}
        <div className="
          flex-none w-full bg-white border border-neutral-200
          animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200
        ">
          {/* Poster — 16px breathing room on all sides */}
          <div className="p-4">
            <BauhausComposition
              levels={session.levels}
              progress={session.progress}
              sessionId={session.id}
              className="w-full h-auto"
            />
          </div>

          {/* Hairline rule */}
          <div className="mx-4 border-t border-neutral-150" style={{ borderColor: '#e8e5de' }} />

          {/* Info strip — two-column Swiss layout, balanced */}
          <div className="px-4 py-3.5 flex items-end justify-between">
            <div>
              <p className="text-[7px] font-mono uppercase tracking-[0.24em] text-neutral-400 mb-0.5">
                Resonance
              </p>
              <p className="text-[26px] font-black tracking-[-0.03em] leading-none text-[#121212]">
                {avgResonance}<span className="text-base font-bold ml-0.5">%</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-mono uppercase tracking-[0.24em] text-neutral-400 mb-0.5">
                Session
              </p>
              <p className="text-[26px] font-black tracking-[-0.03em] leading-none text-[#121212]">
                {session.id.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

      </div>

      {/* Actions */}
      <div className={`
        flex-none w-full pb-8 flex flex-col gap-3 relative z-10
        transition-all duration-500 delay-100
        ${isExiting ? 'translate-y-20 opacity-0' : 'animate-in slide-in-from-bottom-full fade-in duration-700 delay-700'}
      `}>
        <MechanicalButton
          onTrigger={handleShare}
          className="w-full h-12 flex items-center justify-center text-[#121212] font-normal uppercase tracking-widest text-xs hover:opacity-60 border border-transparent"
        >
          SHARE IDENTITY
        </MechanicalButton>
        <MechanicalButton
          onTrigger={handleArchive}
          className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center"
        >
          ARCHIVE TO COLLECTION
        </MechanicalButton>
      </div>

    </div>
  );
};

export default ArtifactView;
