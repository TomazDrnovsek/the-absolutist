
import React, { useState, useEffect, useRef } from 'react';
import { SessionData } from '../types';
import BauhausComposition from './BauhausComposition';
import MechanicalButton from './MechanicalButton';
import WinEffect from './WinEffect';
import { audio } from '../utils/audio';
import { exportArtifact } from '../utils/exportArtifact';

interface ArtifactViewProps {
  session: SessionData;
  onArchive: () => void;
}

const ArtifactView: React.FC<ArtifactViewProps> = ({ session, onArchive }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const artifactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => { audio.playSuccess(); }, 300);
  }, []);

  const handleArchive = () => {
    audio.playTap();
    setIsExiting(true);
    setTimeout(() => { onArchive(); }, 500);
  };

  const avgResonance = Math.round(
    session.progress.reduce((a: number, b) => a + (b || 0), 0) / 20
  );

  const handleExport = async () => {
    if (isExporting || !artifactRef.current) return;
    setIsExporting(true);
    audio.playClick();

    try {
      await exportArtifact({
        element: artifactRef.current,
        sessionId: session.id,
        resonance: avgResonance,
        pixelRatio: 2,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Export failed', error);
      }
    } finally {
      setIsExporting(false);
    }
  };

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

        <div className="flex-1" />

        {/* ── ARTIFACT CARD ── */}
        <div ref={artifactRef} className="
          flex-none w-full bg-white border border-neutral-200
          animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200
        ">
          {/* Poster */}
          <div className="p-4">
            <BauhausComposition
              levels={session.levels}
              progress={session.progress}
              sessionId={session.id}
              className="w-full h-auto"
            />
          </div>

          {/* Hairline rule */}
          <div className="mx-4 border-t" style={{ borderColor: '#e8e5de' }} />

          {/* Info strip */}
          <div className="px-4 py-3.5 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-neutral-400 mb-0.5">
                RESONANCE
              </p>
              <p className="text-[26px] font-black tracking-[-0.03em] leading-none text-[#121212]">
                {avgResonance}<span className="text-base font-bold ml-0.5">%</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-neutral-400 mb-0.5">
                SESSION
              </p>
              <p className="text-[26px] font-black tracking-[-0.03em] leading-none text-[#121212]">
                {session.id.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

      </div>

      {/* Actions — pb-8 (2rem) + env(safe-area-inset-bottom) via inline calc */}
      <div
        className={`
          flex-none w-full flex flex-col gap-3 relative z-10
          transition-all duration-500 delay-100
          ${isExiting ? 'translate-y-20 opacity-0' : 'animate-in slide-in-from-bottom-full fade-in duration-700 delay-700'}
        `}
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <MechanicalButton
          onTrigger={handleExport}
          disabled={isExporting}
          className="w-full h-12 flex items-center justify-center text-[#121212] font-normal uppercase tracking-widest text-xs hover:opacity-60 border border-transparent disabled:opacity-40"
        >
          {isExporting ? 'GENERATING…' : 'EXPORT ARTIFACT'}
        </MechanicalButton>
        <MechanicalButton
          onTrigger={handleArchive}
          className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center"
        >
          ARCHIVE SESSION
        </MechanicalButton>
      </div>

    </div>
  );
};

export default ArtifactView;
