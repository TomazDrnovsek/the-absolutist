import React, { useMemo, useState, useEffect } from 'react';
import { LevelData } from '../types';
import HarmonyNodeView from './HarmonyNodeView';

interface HarmonyViewProps {
  level: LevelData;
  activeNodeId: number;
  onSelectNode: (id: number) => void;
  onNodeDoubleClick?: (id: number) => void; 
  isBauhausMode: boolean;
  isRevealed?: boolean;
  isWin?: boolean; 
  showLabel?: boolean;
  showNodeHint?: boolean;
}

const HarmonyView: React.FC<HarmonyViewProps> = ({ 
  level, 
  activeNodeId, 
  onSelectNode,
  onNodeDoubleClick,
  isBauhausMode,
  isRevealed = false,
  isWin = false,
  showLabel = true,
  showNodeHint = false
}) => {
  // --- Geometry Constants (SVG Coordinates 0-100) ---
  const RADIUS = 36; 
  const CENTER = 50; 

  // --- Animation State for Harmony Label ---
  const [labelOpacity, setLabelOpacity] = useState(0.25);

  useEffect(() => {
    // On mount, trigger a 3-second pulse animation on the label.
    // The component is remounted on each level change via the `key` prop in `App.tsx`.
    const toBlackTimer = setTimeout(() => setLabelOpacity(1), 100);
    const toGrayTimer = setTimeout(() => setLabelOpacity(0.25), 1600); // 100ms delay + 1.5s transition

    return () => {
        clearTimeout(toBlackTimer);
        clearTimeout(toGrayTimer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  // Convert Hue (0-360) to SVG Coordinates
  const calculatePosition = (hue: number) => {
    const angleInRad = (hue - 90) * (Math.PI / 180);
    const x = CENTER + RADIUS * Math.cos(angleInRad);
    const y = CENTER + RADIUS * Math.sin(angleInRad);
    return { x, y };
  };
  
  // Sort nodes by TARGET HUE to ensure valid order for animation delays
  const sortedNodes = [...level.nodes].sort((a, b) => a.targetColor.h - b.targetColor.h);

  // Clean, static path generation
  const pathData = useMemo(() => {
    if (!isWin || level.nodes.length < 2) return '';
    
    const activeNodes = [...level.nodes].sort((a, b) => a.targetColor.h - b.targetColor.h);
    
    const commands = activeNodes.map((n, i) => {
      const pos = calculatePosition(n.targetColor.h);
      return `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
    });
    
    return commands.join(' ') + ' Z'; 
  }, [level.nodes, isWin]);

  // Get current level Saturation and Lightness to tint the wheel
  const { s, l } = level.rootColor;
  const sVal = Math.round(s);
  const lVal = Math.round(l);

  const gradientStyle = {
     background: (isRevealed && !isWin) 
        ? '#E5E5E5' 
        : `conic-gradient(
            from 0deg,
            hsl(0, ${sVal}%, ${lVal}%),
            hsl(60, ${sVal}%, ${lVal}%),
            hsl(120, ${sVal}%, ${lVal}%),
            hsl(180, ${sVal}%, ${lVal}%),
            hsl(240, ${sVal}%, ${lVal}%),
            hsl(300, ${sVal}%, ${lVal}%),
            hsl(360, ${sVal}%, ${lVal}%)
        )`,
     WebkitMaskImage: 'radial-gradient(closest-side, transparent 89%, black 90%)',
     maskImage: 'radial-gradient(closest-side, transparent 89%, black 90%)'
  };

  return (
    <div className="w-full h-full relative select-none flex items-center justify-center">
       
       {/* 1. BACKGROUND LAYERS (The Track) */}
       <div 
         className={`absolute inset-0 m-auto transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-center`}
         style={{
             width: '76%', 
             height: '76%',
             transform: isRevealed ? 'rotate(0deg) scale(1)' : 'rotate(-20deg) scale(0.8)',
             opacity: isRevealed ? 1 : 0,
         }}
       >
           {/* B. The Main Ring (Gradient or Gray) */}
           <div 
             className="w-full h-full rounded-full"
             style={gradientStyle}
           />
       </div>

       {/* 2. SVG LAYER (Geometry & Outlines) */}
       <svg 
         className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
         viewBox="0 0 100 100" 
         preserveAspectRatio="xMidYMid meet"
         style={{
             opacity: 1, 
             transition: 'opacity 1s ease'
         }}
       >
          {/* Track Circle (Visible only during gameplay) */}
          <circle 
            cx="50" 
            cy="50" 
            r="36" 
            fill="none" 
            stroke="#E5E5E5" 
            strokeWidth="1"
            className={`transition-all duration-700 ${isRevealed ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
            style={{ transformOrigin: 'center' }}
            vectorEffect="non-scaling-stroke"
          />

          {/* SCHEMATIC LINK */}
          {isRevealed && isWin && pathData && (
              <path 
                  d={pathData}
                  fill="none"
                  stroke="#dfdfdf"
                  strokeWidth="0.3" 
                  strokeLinejoin="round"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  className="animate-schematic-link"
              />
          )}
       </svg>

       {/* 3. INTERACTIVE NODES (DOM Layer) */}
       {sortedNodes.map((node, i) => {
         const pos = calculatePosition(node.targetColor.h);
         const isInteractive = !node.isLocked && !isRevealed;

         return (
           <div 
             key={node.id} 
             className={`absolute origin-center`}
             style={{ 
                 left: `${pos.x}%`, 
                 top: `${pos.y}%`,
                 transform: isRevealed ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)', 
                 animation: isRevealed ? 'popSpring 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards' : 'none',
                 animationDelay: isRevealed ? `${150 + (i * 120)}ms` : '0ms',
                 zIndex: activeNodeId === node.id ? 30 : 10
             }}
           >
             <HarmonyNodeView
               id={node.id}
               color={node.userColor}
               isLocked={node.isLocked}
               isSelected={activeNodeId === node.id}
               isBauhausMode={isBauhausMode}
               onClick={(id) => {
                   if (isInteractive) onSelectNode(id);
               }}
               onDoubleClick={isInteractive ? onNodeDoubleClick : undefined}
               size={40} 
               isHintTarget={showNodeHint && !node.isLocked && node.id !== activeNodeId}
             />
           </div>
         );
       })}
       
       {!isRevealed && showLabel && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            <span
                className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#121212] text-center absolute"
                style={{
                    opacity: showNodeHint ? 0 : labelOpacity,
                    transition: `opacity ${showNodeHint ? '0.5s' : '1.5s'} ease-in-out`
                }}
            >
                {level.harmonyType}
            </span>
            <span
                className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#121212] text-center transition-opacity duration-500 absolute"
                style={{ opacity: showNodeHint ? 0.7 : 0 }}
            >
                SELECT NODE
            </span>
        </div>
    )}
    </div>
  );
};

export default HarmonyView;
