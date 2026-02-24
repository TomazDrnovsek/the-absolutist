
import React, { useState, useRef } from 'react';
import { SessionData } from '../types';
import BauhausComposition from './BauhausComposition';
import MechanicalButton from './MechanicalButton';
import { audio } from '../utils/audio';
import { exportArtifact } from '../utils/exportArtifact';

interface SessionDetailViewProps {
  session: SessionData;
  onClose: () => void;
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ session, onClose }) => {
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const avgResonance = Math.round(
    session.progress.reduce((a: number, b) => a + (b || 0), 0) / 20
  );

  const handleShare = async () => {
    if (isSharing || !cardRef.current) return;
    setIsSharing(true);
    audio.playShutter();

    try {
      await exportArtifact({
        element: cardRef.current,
        sessionId: session.id,
        resonance: avgResonance,
        pixelRatio: 3,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Export failed', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F2EB] z-[70] flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">

      <div className="shrink-0 pt-safe-top z-50">
        <div className="w-full px-6 py-4 flex justify-end">
          <MechanicalButton
            onTrigger={() => { audio.playClick(); onClose(); }}
            scaleActive={0.85}
            className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors text-sm bg-[#F5F2EB]"
          >
            ✕
          </MechanicalButton>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-10 relative z-10">

        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-neutral-400 mb-5">
          THE ABSOLUTIST
        </p>

        <div
          ref={cardRef}
          className="w-full max-w-[280px] bg-white border border-neutral-200"
        >

          <div className="p-4">
            <BauhausComposition
              levels={session.levels}
              progress={session.progress}
              sessionId={session.id}
              className="w-full h-auto"
            />
          </div>

          <div className="mx-4 border-t border-neutral-150" style={{ borderColor: '#e8e5de' }} />

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

      </div>

      <div className="flex-none w-full px-6 pb-8 relative z-10">
        <MechanicalButton
          onTrigger={handleShare}
          disabled={isSharing}
          className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs border border-[#121212] flex items-center justify-center disabled:opacity-50"
        >
          {isSharing ? 'GENERATING…' : 'EXPORT ARTIFACT'}
        </MechanicalButton>
      </div>

    </div>
  );
};

export default SessionDetailView;
