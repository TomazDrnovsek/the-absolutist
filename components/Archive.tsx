import React from 'react';
import { SessionData } from '../types';
import BauhausComposition from './BauhausComposition';
import MechanicalButton from './MechanicalButton';
import { audio } from '../utils/audio';

interface ArchiveProps {
  currentSession: SessionData | null;
  currentLevel: number;
  sessions: SessionData[];
  onClose: () => void;
  onSessionClick?: (session: SessionData) => void;
}

const Archive: React.FC<ArchiveProps> = ({ currentSession, currentLevel, sessions, onClose, onSessionClick }) => {

  const renderInProgressCard = () => {
    if (!currentSession) return null;

    const completedAssignments = currentSession.progress.filter(p => p !== null);
    const sum = completedAssignments.reduce((a, b) => a + (b as number), 0);
    const avgResonance = completedAssignments.length > 0 ? Math.round(sum / completedAssignments.length) : null;

    return (
      <div className="border border-neutral-200 bg-white p-4">
        
        {/* Header row */}
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-neutral-400">
              IN PROGRESS
            </span>
            <span className="text-base font-black text-[#121212]">
              {currentSession.id.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress info */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              ASSIGNMENT
            </span>
            <span className="text-lg font-black tracking-tight text-[#121212]">
              {currentLevel.toString().padStart(2, '0')}
            </span>
            <span className="text-sm font-mono text-neutral-400">/ 20</span>
          </div>

          {/* Simple progress bar */}
          <div className="h-1 bg-neutral-100 relative overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-[#121212] transition-all duration-300"
              style={{ width: `${(currentLevel / 20) * 100}%` }}
            />
          </div>

          {/* Status label */}
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400">
            AVG RESONANCE {avgResonance !== null ? `${avgResonance}%` : '—'}
          </p>
        </div>

      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#F5F2EB] flex flex-col animate-in slide-in-from-bottom duration-300 font-sans text-[#121212]">

      {/* HEADER: Match App.tsx header exact layout 
         - Changed py-6 to py-4 to match main screen
         - Added pt-safe-top to handle notch
      */}
      <div className="shrink-0 pt-safe-top bg-[#F5F2EB] border-b border-[#eae7e0] z-20">
         <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-4xl font-bold lowercase tracking-[-0.04em] text-[#121212]">sessions.</h2>
            <MechanicalButton
              onTrigger={() => { audio.playClick(); onClose(); }}
              scaleActive={0.85}
              // FIXED: Increased touch target to 48px (w-12 h-12)
              className="w-12 h-12 flex items-center justify-center border-2 border-[#121212] hover:bg-[#121212] hover:text-white transition-colors text-sm"
            >
              ✕
            </MechanicalButton>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-safe-bottom">
        <div className="flex flex-col gap-6 pb-12">

          {/* ── IN PROGRESS ── */}
          {renderInProgressCard()}

          {/* ── COMPLETED SESSIONS GRID ── */}
          {sessions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {sessions.map((session) => {
                const avgResonance = Math.round(
                  session.progress.reduce((a: number, b) => a + (b || 0), 0) / 20
                );
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      audio.playClick();
                      if (onSessionClick) onSessionClick(session);
                    }}
                    className="block w-full text-left hover:opacity-80 transition-opacity"
                  >
                    {/* Card: everything inside the border. FIXED: Removed hover:border-neutral-300 for flatness consistency */}
                    <div className="border border-neutral-200 bg-white transition-colors">
                      
                      {/* Poster with padding */}
                      <div className="p-2">
                        <BauhausComposition
                          levels={session.levels}
                          progress={session.progress}
                          sessionId={session.id}
                          className="w-full h-auto"
                        />
                      </div>

                      {/* Divider */}
                      <div className="mx-2 border-t border-neutral-150" style={{ borderColor: '#e8e5de' }} />

                      {/* Metadata strip */}
                      <div className="px-2.5 py-2.5 flex items-center justify-between">
                        <div>
                          {/* FIXED: Bumped text-[7px] -> text-[9px] */}
                          <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-1">
                            SESSION
                          </p>
                          <p className="text-xl font-black tracking-tight text-[#121212]">
                            {session.id.toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div className="text-right">
                          {/* FIXED: Bumped text-[7px] -> text-[9px] */}
                          <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-neutral-400 mb-1">
                            RESONANCE
                          </p>
                          <p className="text-xl font-black tracking-tight text-[#121212]">
                            {avgResonance}<span className="text-xs font-bold ml-0.5">%</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 opacity-40">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em]">NO SESSIONS ON RECORD</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Archive;
