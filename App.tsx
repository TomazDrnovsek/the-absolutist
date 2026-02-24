
import React, { useState, useEffect } from 'react';
import { HSL, SessionData, HarmonyType, HarmonyNode } from './types';
import { 
  hslToString, 
  calculateMatchScore 
} from './utils/color';
import { HARMONY_RULES } from './utils/harmony';
import { getNextSession } from './utils/sessionGenerator';
import { audio } from './utils/audio';
import Slider from './components/Slider';
import Logo from './components/Logo';
import Menu from './components/Menu';
import MechanicalButton from './components/MechanicalButton';
import StartScreen from './components/StartScreen';
import Onboarding from './components/Onboarding';
import Archive from './components/Archive';
import ArtifactView from './components/ArtifactView';
import SessionDetailView from './components/SessionDetailView';
import HarmonyView from './components/HarmonyView';
import WinEffect from './components/WinEffect';

const App: React.FC = () => {
  // --- State ---
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  const [levelIndex, setLevelIndex] = useState<number>(0); 
  const [sessionCount, setSessionCount] = useState<number>(1);
  
  // Data
  const [session, setSession] = useState<SessionData | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<number>(1);
  const [archivedSessions, setArchivedSessions] = useState<SessionData[]>([]); 
  
  // UI Flow
  const [isDeveloped, setIsDeveloped] = useState(false); 
  const [score, setScore] = useState<number | null>(null);
  
  const [analysisDeltas, setAnalysisDeltas] = useState<{h: number, s: number, l: number} | null>(null);

  const [showArtifact, setShowArtifact] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  
  // Settings
  const [isBauhausMode, setIsBauhausMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Sync audio mute state
  useEffect(() => {
      audio.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  // --- Initialization ---
  useEffect(() => {
    const savedBauhaus = localStorage.getItem('absolutist_bauhaus');
    if (savedBauhaus) setIsBauhausMode(savedBauhaus === 'true');

    const savedSound = localStorage.getItem('absolutist_sound');
    if (savedSound !== null) {
       const enabled = savedSound === 'true';
       setIsSoundEnabled(enabled);
    }
    
    const savedOnboarding = localStorage.getItem('absolutist_onboarding_complete');
    if (savedOnboarding === 'true') {
        setHasCompletedOnboarding(true);
    }
    
    // Load Archive
    const savedArchive = localStorage.getItem('absolutist_archive_v1');
    if (savedArchive) {
        try {
            setArchivedSessions(JSON.parse(savedArchive));
        } catch (e) {
            console.error("Failed to parse archive", e);
        }
    }

    // Load Session
    const savedSessionData = localStorage.getItem('absolutist_current_session_v2');
    const savedLevel = localStorage.getItem('absolutist_level_index_v2');
    const parsedLevelIndex = savedLevel ? parseInt(savedLevel, 10) : 0;
    
    if (savedSessionData) {
        const parsedSession = JSON.parse(savedSessionData);
        setSession(parsedSession);
        setLevelIndex(parsedLevelIndex);

        // Ensure we start on an UNLOCKED node
        const currentLvl = parsedSession.levels[parsedLevelIndex];
        if (currentLvl) {
            const firstUnlocked = currentLvl.nodes.find((n: HarmonyNode) => !n.isLocked);
            if (firstUnlocked) {
                 setActiveNodeId(firstUnlocked.id);
            }
        }
    } else {
        const newSession = getNextSession(1);
        setSession(newSession);
        localStorage.setItem('absolutist_current_session_v2', JSON.stringify(newSession));
        setActiveNodeId(1);
    }

  }, []);

  const currentLevel = session?.levels[levelIndex];
  const activeNode = currentLevel?.nodes.find(n => n.id === activeNodeId);
  const isWin = score !== null && score >= 80;

  const handleStart = async () => {
      await audio.resume();
      audio.playClick();
      setHasStarted(true);
  };
  
  // --- DEV: GENERATE 10 SESSIONS ---
  const handleDevGenerate = () => {
    const newArchive = [...archivedSessions];
    // FIXED: Start from the current ID to avoid off-by-one error and gaps
    let startId = session ? session.id : 1;

    for (let i = 0; i < 10; i++) {
        const id = startId + i;
        const s = getNextSession(id);
        
        // Mock Progress: Random scores between 60 and 100
        const variance = Math.random(); 
        s.progress = Array.from({ length: 20 }, () => {
            if (variance > 0.8) return Math.floor(Math.random() * 100); 
            if (variance > 0.5) return 80 + Math.floor(Math.random() * 20); 
            return 60 + Math.floor(Math.random() * 40); 
        });
        
        s.isComplete = true;
        newArchive.unshift(s);
    }

    setArchivedSessions(newArchive);
    localStorage.setItem('absolutist_archive_v1', JSON.stringify(newArchive));
    
    const nextGameId = startId + 10;
    setSessionCount(nextGameId);
    const nextSession = getNextSession(nextGameId);
    setSession(nextSession);
    setLevelIndex(0);
    setActiveNodeId(1);
    localStorage.setItem('absolutist_current_session_v2', JSON.stringify(nextSession));
    
    audio.playSuccess(); 
  };
  
  const handleClearData = () => {
    localStorage.removeItem('absolutist_archive_v1');
    localStorage.removeItem('absolutist_current_session_v2');
    localStorage.removeItem('absolutist_level_index_v2');
    localStorage.removeItem('absolutist_onboarding_complete');

    setArchivedSessions([]);
    const newSession = getNextSession(1);
    setSession(newSession);
    setLevelIndex(0);
    setActiveNodeId(1);
    setSessionCount(1);
    setHasCompletedOnboarding(false);
    setShowMenu(false);
    audio.playClick();
  };

  const handleUpdateColor = (key: keyof HSL, val: number) => {
      if (isDeveloped || !session || !currentLevel || !activeNode || activeNode.isLocked) return;
      
      const newLevels = [...session.levels];
      const level = newLevels[levelIndex];
      const nodeIndex = level.nodes.findIndex(n => n.id === activeNodeId);
      
      if (nodeIndex === -1) return;

      level.nodes[nodeIndex] = {
          ...level.nodes[nodeIndex],
          userColor: { ...level.nodes[nodeIndex].userColor, [key]: val }
      };
      
      const newSession = { ...session, levels: newLevels };
      setSession(newSession);
  };

  const handleDevWin = (id: number) => {
      if (!session || !currentLevel) return;
      const newLevels = [...session.levels];
      const level = newLevels[levelIndex];
      level.nodes.forEach(node => {
          if (!node.isLocked) node.userColor = { ...node.targetColor };
      });
      setSession({ ...session, levels: newLevels });
      setActiveNodeId(id);
      setScore(100);
      setAnalysisDeltas({ h: 0, s: 0, l: 0 }); // Perfect score
      setIsDeveloped(true);
      audio.playSuccess();
      audio.triggerHaptic([10, 50, 10, 50]);
  };

  const handleAnalysis = () => {
    if (!currentLevel) return;
    const satellites = currentLevel.nodes.filter(n => !n.isLocked);
    let totalScore = 0;
    
    // Accumulators for error calculation
    let totalHDiff = 0;
    let totalSDiff = 0;
    let totalLDiff = 0;

    satellites.forEach(node => {
        // 1. Calculate Score
        totalScore += calculateMatchScore(node.targetColor, node.userColor);

        // 2. Calculate Raw Deltas (Abs Error)
        let hDiff = Math.abs(node.targetColor.h - node.userColor.h);
        if (hDiff > 180) hDiff = 360 - hDiff; // Circular logic
        
        const sDiff = Math.abs(node.targetColor.s - node.userColor.s);
        const lDiff = Math.abs(node.targetColor.l - node.userColor.l);

        totalHDiff += hDiff;
        totalSDiff += sDiff;
        totalLDiff += lDiff;
    });

    const finalScore = Math.round(totalScore / satellites.length);
    
    // Calculate Average Deltas
    setAnalysisDeltas({
        h: Math.round(totalHDiff / satellites.length),
        s: Math.round(totalSDiff / satellites.length),
        l: Math.round(totalLDiff / satellites.length)
    });

    setScore(finalScore);
    setIsDeveloped(true);
    
    if (finalScore >= 80) {
        audio.playSuccess();
        audio.triggerHaptic([10, 50, 10, 50]);
    } else {
        audio.playDissonance();
        audio.triggerHaptic([30, 30]);
    }
  };

  const handleNextLevel = () => {
    if (!session) return;
    audio.playAdvance();
    const newProgress = [...session.progress];
    newProgress[levelIndex] = score;
    const updatedSession = { ...session, progress: newProgress };
    
    if (levelIndex >= 19) {
        const completeSession = { ...updatedSession, isComplete: true };
        setSession(completeSession);
        localStorage.setItem('absolutist_current_session_v2', JSON.stringify(completeSession));
        setShowArtifact(true);
    } else {
        const nextLevelIndex = levelIndex + 1;
        setSession(updatedSession);
        localStorage.setItem('absolutist_current_session_v2', JSON.stringify(updatedSession));
        
        setLevelIndex(nextLevelIndex);
        localStorage.setItem('absolutist_level_index_v2', nextLevelIndex.toString());
        
        setIsDeveloped(false);
        setScore(null);
        setAnalysisDeltas(null); // Reset deltas
        
        const nextLevel = session.levels[nextLevelIndex];
        const firstUnlocked = nextLevel?.nodes.find(n => !n.isLocked);
        setActiveNodeId(firstUnlocked ? firstUnlocked.id : 1);
    }
  };

  const handleRetry = () => {
    audio.playClick();
    setIsDeveloped(false);
    setScore(null);
    setAnalysisDeltas(null); // Reset deltas
  };

  if (!hasStarted) return <StartScreen onStart={handleStart} />;
  if (!hasCompletedOnboarding) return <Onboarding onComplete={() => {
      setHasCompletedOnboarding(true);
      localStorage.setItem('absolutist_onboarding_complete', 'true');
  }} />;

  if (showArtifact && session) {
      return <ArtifactView session={session} onArchive={() => {
         const updatedArchive = [session, ...archivedSessions];
         setArchivedSessions(updatedArchive);
         localStorage.setItem('absolutist_archive_v1', JSON.stringify(updatedArchive));

         const nextId = session.id + 1;
         const nextSession = getNextSession(nextId);
         setSession(nextSession);
         setSessionCount(nextId);
         setLevelIndex(0);
         setActiveNodeId(1);
         
         setShowArtifact(false);
         setIsDeveloped(false);
         setShowArchive(true); 

         localStorage.setItem('absolutist_current_session_v2', JSON.stringify(nextSession));
         localStorage.setItem('absolutist_level_index_v2', '0');
      }} />;
  }

  if (!currentLevel || !activeNode) return null;

  const hueGradient = 'linear-gradient(to right, #F00 0%, #FF0 17%, #0F0 33%, #0FF 50%, #00F 67%, #F0F 83%, #F00 100%)';
  const satGradient = `linear-gradient(to right, ${hslToString({h: activeNode.userColor.h, s: 0, l: activeNode.userColor.l})}, ${hslToString({h: activeNode.userColor.h, s: 100, l: activeNode.userColor.l})})`;
  const lightGradient = `linear-gradient(to right, #121212, ${hslToString({h: activeNode.userColor.h, s: activeNode.userColor.s, l: 50})}, #FFF)`;

  const harmonyLabel = currentLevel 
      ? (HARMONY_RULES[currentLevel.harmonyType as HarmonyType]?.label || currentLevel.harmonyType.toUpperCase()) 
      : '';

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5F2EB] font-sans overflow-hidden select-none text-[#121212]">
        
        {/* --- 1. HEADER --- */}
        <div className="shrink-0 relative flex flex-col pt-safe-top z-20 border-b border-[#eae7e0] bg-[#F5F2EB]">
             <header className="w-full px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center relative z-30 shrink-0">
                <MechanicalButton 
                  onTrigger={() => setShowMenu(true)}
                  className="justify-self-start w-12 h-12 flex items-center justify-start group hover:opacity-60"
                  scaleActive={0.8}
                >
                    <div className="flex flex-col gap-2 w-6">
                        <span className="w-full h-[2px] bg-[#121212]"></span>
                        <span className="w-full h-[2px] bg-[#121212]"></span>
                        <span className="w-full h-[2px] bg-[#121212]"></span>
                    </div>
                </MechanicalButton>

                <div className="justify-self-center">
                  <Logo />
                </div>

                <div 
                    className="justify-self-end flex flex-col items-end justify-center leading-tight cursor-pointer group select-none"
                    onClick={() => {
                        audio.playClick();
                        setShowArchive(true);
                    }}
                >
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#121212] transition-colors">S.</span>
                       <span className="text-sm font-bold tabular-nums text-[#121212] tracking-tight">
                           {session.id.toString().padStart(2, '0')}
                       </span>
                   </div>
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#121212] transition-colors">A.</span>
                       <span className="text-sm font-bold tabular-nums text-[#121212] tracking-tight">
                           {(levelIndex + 1).toString().padStart(2, '0')}
                       </span>
                   </div>
                </div>
             </header>
        </div>

        {/* --- 2. MAIN STAGE --- */}
        <div className="flex-1 w-full min-h-0 relative z-10 border-b border-[#eae7e0] flex items-center justify-center bg-[#F5F2EB] p-4 touch-none">
            <div 
                className="relative flex items-center justify-center"
                style={{
                    width: 'min(50vh, 85vw)',
                    height: 'min(50vh, 85vw)',
                }}
            >
                 <HarmonyView 
                    key={levelIndex}
                    level={currentLevel} 
                    activeNodeId={activeNodeId} 
                    onSelectNode={(id) => {
                        audio.playTap();
                        setActiveNodeId(id);
                    }}
                    onNodeDoubleClick={handleDevWin}
                    isBauhausMode={isBauhausMode}
                    isRevealed={false}
                    isWin={false}
                 />
            </div>
        </div>

        {/* --- 3. CONTROLS --- */}
        <div className="h-[45%] shrink-0 bg-[#F5F2EB] flex flex-col px-6 pt-8 pb-safe-bottom relative z-30">
             <div className="flex-1 flex flex-col h-full">
                 <div className="flex flex-col gap-6">
                      <Slider label="H" value={activeNode.userColor.h} min={0} max={360} onChange={(v) => handleUpdateColor('h', v)} gradient={hueGradient} disabled={isDeveloped || activeNode.isLocked} />
                      <Slider label="S" value={activeNode.userColor.s} min={0} max={100} onChange={(v) => handleUpdateColor('s', v)} gradient={satGradient} disabled={isDeveloped || activeNode.isLocked} />
                      <Slider label="L" value={activeNode.userColor.l} min={0} max={100} onChange={(v) => handleUpdateColor('l', v)} gradient={lightGradient} disabled={isDeveloped || activeNode.isLocked} />
                 </div>

                 <div className="flex-1 flex items-end justify-center pb-8 min-h-0">
                     <MechanicalButton 
                         onTrigger={handleAnalysis}
                         disabled={isDeveloped}
                         className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs flex items-center justify-center disabled:opacity-50 border border-[#121212]"
                     >
                         ANALYZE HARMONY
                     </MechanicalButton>
                 </div>
             </div>
        </div>

        {/* --- WINNING SCREEN OVERLAY --- */}
        {isDeveloped && (
            <div className="fixed inset-0 z-50 bg-[#F5F2EB] flex flex-col font-sans text-[#121212]">
                
                {/* 0. CELEBRATION (BAUHAUS MODE ONLY) */}
                {/* CHANGED: originY={0.33} aligns burst with the Main Stage center (color circle) */}
                {isWin && isBauhausMode && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <WinEffect isBauhausMode={true} originY={0.33} />
                    </div>
                )}

                {/* 1. INVISIBLE HEADER SPACER */}
                <div className="shrink-0 relative flex flex-col pt-safe-top z-20 border-b border-transparent opacity-0 pointer-events-none">
                     <header className="w-full px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center relative z-30 shrink-0">
                        <div className="h-12 w-12" /> 
                        <Logo /> 
                        <div className="h-12" />
                     </header>
                </div>

                {/* 2. MAIN STAGE (Color Wheel - Aligned) */}
                <div className="flex-1 w-full min-h-0 relative z-10 flex items-center justify-center p-4 pointer-events-none">
                    <div 
                        className="relative flex items-center justify-center"
                        style={{
                            width: 'min(50vh, 85vw)',
                            height: 'min(50vh, 85vw)',
                        }}
                    >
                         <HarmonyView 
                            key={`win-${levelIndex}`}
                            level={currentLevel}
                            activeNodeId={-1} 
                            onSelectNode={() => {}} 
                            isBauhausMode={isBauhausMode}
                            isRevealed={true}
                            isWin={isWin}
                            showLabel={false}
                         />
                    </div>
                </div>

                {/* 3. CONTROLS SECTION (Score + Button) */}
                <div className="h-[45%] shrink-0 flex flex-col px-6 pt-8 pb-safe-bottom relative z-30 pointer-events-none">
                     <div className="flex-1 flex flex-col h-full">
                         
                         {/* SCORE & TEXT */}
                         <div className="flex flex-col items-center justify-center gap-3 pt-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="text-6xl font-medium tabular-nums text-[#121212]">
                                {score}%
                            </div>
                            
                            {analysisDeltas && (
                                <>
                                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-neutral-400 opacity-60">DEVIATION</span>
                                <div className="flex gap-4 mb-1 opacity-80">
                                    <div className="flex gap-1 items-baseline">
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">ΔH</span>
                                        <span className="text-xs font-bold tabular-nums text-[#121212]">{analysisDeltas.h}°</span>
                                    </div>
                                    <div className="flex gap-1 items-baseline">
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">ΔS</span>
                                        <span className="text-xs font-bold tabular-nums text-[#121212]">{analysisDeltas.s}<span className="text-[9px]">pp</span></span>
                                    </div>
                                    <div className="flex gap-1 items-baseline">
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">ΔL</span>
                                        <span className="text-xs font-bold tabular-nums text-[#121212]">{analysisDeltas.l}<span className="text-[9px]">pp</span></span>
                                    </div>
                                </div>
                                </>
                            )}

                            <div className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500 text-center">
                                {isWin ? `${harmonyLabel} RESONANCE ACHIEVED` : "DISSONANCE DETECTED"}
                            </div>
                         </div>

                         {/* Button */}
                         <div className="flex-1 flex items-end justify-center pb-8 min-h-0 pointer-events-auto">
                            {isWin ? (
                                <MechanicalButton 
                                   onTrigger={handleNextLevel}
                                   className="w-full h-14 bg-[#121212] text-white font-normal uppercase tracking-widest text-xs flex items-center justify-center"
                                >
                                   {levelIndex >= 19 ? "AUTHENTICATE SESSION" : "NEXT ASSIGNMENT"}
                                </MechanicalButton>
                            ) : (
                                <MechanicalButton 
                                   onTrigger={handleRetry}
                                   className="w-full h-14 border border-[#121212] text-[#121212] font-normal uppercase tracking-widest text-xs flex items-center justify-center"
                                >
                                   RECALIBRATE
                                </MechanicalButton>
                            )}
                         </div>
                     </div>
                </div>
            </div>
        )}

        {showMenu && (
            <Menu 
                onClose={() => setShowMenu(false)}
                onOpenArchive={() => { setShowMenu(false); setShowArchive(true); }}
                isBauhausMode={isBauhausMode}
                toggleBauhausMode={() => {
                    setIsBauhausMode(!isBauhausMode);
                    localStorage.setItem('absolutist_bauhaus', (!isBauhausMode).toString());
                }}
                isSoundEnabled={isSoundEnabled}
                toggleSound={() => {
                    setIsSoundEnabled(!isSoundEnabled);
                    localStorage.setItem('absolutist_sound', (!isSoundEnabled).toString());
                }}
                onRestartOnboarding={() => {
                    setHasCompletedOnboarding(false);
                    setShowMenu(false);
                }}
                onDevGenerate={handleDevGenerate} 
                onClearData={handleClearData}
            />
        )}
        
        {showArchive && (
            <Archive 
                currentSession={session}
                currentLevel={levelIndex + 1}
                sessions={archivedSessions} 
                onClose={() => setShowArchive(false)}
                onSessionClick={(s) => setSelectedSession(s)}
            />
        )}

        {selectedSession && (
            <SessionDetailView 
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
            />
        )}

    </div>
  );
};

export default App;
