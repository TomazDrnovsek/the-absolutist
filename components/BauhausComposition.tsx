import React, { useMemo } from 'react';

// ─────────────────────────────────────────────────────────
// Canvas constants
// ─────────────────────────────────────────────────────────

const CW = 240;
const CH = 320;
const G = 18; // Standard Grid Unit

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'split-complementary'
  | 'triadic'
  | 'square';

type Trajectory = 'rising' | 'falling' | 'stable' | 'volatile';

interface SessionIdentity {
  primaryHue: number;
  secondaryHue: number;
  accentHue: number;
  dominantHarmony: HarmonyType;
  resonance: number;
  trajectory: Trajectory;
  seed: number;
  archetypeIndex: number; // 0-9
  sequenceId: number;
}

export interface BauhausCompositionProps {
  levels: any[];
  progress: (number | null | undefined)[];
  sessionId: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────

function col(h: number, s = 82, l = 46): string {
  return `hsl(${Math.round(((h % 360) + 360) % 360)}, ${s}%, ${l}%)`;
}

// Deterministic Random (Park-Miller)
function srandom(seed: number) {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Helper to get a random range based on seed
function rngRange(seed: number, min: number, max: number) {
    return min + srandom(seed) * (max - min);
}

// Fisher-Yates Shuffle (Deterministic)
// We shuffle the "Deck of 10 Archetypes" differently for every "Decade" of sessions
function getDeckForDecade(decade: number): number[] {
    // 1. Create a fresh deck [0, 1, 2... 9]
    const deck = Array.from({ length: 10 }, (_, i) => i);
    
    // 2. Shuffle it using the Decade ID as the seed base
    // This ensures Sessions 1-10 get one shuffle, and 11-20 get a TOTALLY DIFFERENT shuffle.
    let m = deck.length;
    let seed = decade * 1000; // Unique seed per decade

    while (m) {
        const r = srandom(seed + m); // vary seed by step
        const i = Math.floor(r * m--);
        const t = deck[m];
        deck[m] = deck[i];
        deck[i] = t;
    }
    return deck;
}

// ─────────────────────────────────────────────────────────
// Data Extraction
// ─────────────────────────────────────────────────────────

const HARMONY_CYCLE: HarmonyType[] = [
  'complementary', 'analogous', 'split-complementary', 'triadic', 'square',
  'complementary', 'analogous', 'split-complementary', 'triadic', 'square',
  'complementary', 'analogous', 'split-complementary', 'triadic', 'square',
  'complementary', 'analogous', 'split-complementary', 'triadic', 'square',
];

function deriveIdentity(levels: any[], progress: any[], sessionId: number): SessionIdentity {
  const raw: { h: number; acc: number; type: HarmonyType }[] = [];
  
  for (let i = 0; i < 20; i++) {
    const lvl = levels[i];
    const score = typeof progress[i] === 'number' ? progress[i] : 0;
    const h = lvl?.rootColor?.h ?? ((sessionId * 137.5) + i * 47) % 360;
    
    const typeStr = (lvl?.harmonyType ?? '').toLowerCase();
    let type: HarmonyType = HARMONY_CYCLE[i];
    if (typeStr.includes('split')) type = 'split-complementary';
    else if (typeStr.includes('comp')) type = 'complementary';
    else if (typeStr.includes('anal')) type = 'analogous';
    else if (typeStr.includes('tri')) type = 'triadic';
    else if (typeStr.includes('sq')) type = 'square';

    raw.push({ h, acc: score, type });
  }

  const validScores = raw.filter(r => r.acc > 0);
  const resonance = validScores.length > 0 
    ? Math.round(validScores.reduce((a,b) => a + b.acc, 0) / validScores.length) 
    : 0;

  const firstHalf = raw.slice(0, 10).reduce((a, b) => a + b.acc, 0);
  const secondHalf = raw.slice(10, 20).reduce((a, b) => a + b.acc, 0);
  const variance = raw.reduce((a, b) => a + Math.abs(b.acc - resonance), 0) / 20;
  
  let trajectory: Trajectory = 'stable';
  if (variance > 18) trajectory = 'volatile';
  else if (secondHalf > firstHalf + 40) trajectory = 'rising';
  else if (firstHalf > secondHalf + 40) trajectory = 'falling';

  const sorted = [...raw].sort((a,b) => b.acc - a.acc);
  const palette: number[] = [];
  for (const item of sorted) {
    if (palette.every(p => Math.abs(p - item.h) > 30)) palette.push(item.h);
    if (palette.length >= 3) break;
  }
  while (palette.length < 3) palette.push((palette[0] + 120 * palette.length) % 360);

  const counts: Record<string, number> = {};
  raw.forEach(r => counts[r.type] = (counts[r.type] || 0) + 1);
  const dominantHarmony = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as HarmonyType;

  // ─── THE SHUFFLED DECK LOGIC ───
  // 1. Identify which "Decade" we are in (0 for 1-10, 1 for 11-20)
  const decade = Math.floor((sessionId - 1) / 10);
  
  // 2. Identify our position in this decade (0-9)
  const positionInDecade = (sessionId - 1) % 10;
  
  // 3. Generate the shuffled deck unique to this decade
  const deck = getDeckForDecade(decade);
  
  // 4. Pick our card
  const archetypeIndex = deck[positionInDecade];

  const seed = sessionId * 1337 + resonance;

  return {
    primaryHue: palette[0],
    secondaryHue: palette[1],
    accentHue: palette[2],
    dominantHarmony,
    resonance,
    trajectory,
    seed,
    archetypeIndex,
    sequenceId: sessionId
  };
}

// ─────────────────────────────────────────────────────────
// GENERATIVE MODULES (The "Ink")
// ─────────────────────────────────────────────────────────

const PatternStripe: React.FC<{ x: number, y: number, w: number, h: number, color: string, vertical?: boolean, density?: number }> = ({ x, y, w, h, color, vertical, density = 4 }) => {
  const elements = [];
  if (vertical) {
      const count = Math.floor(w / density);
      for(let i=0; i<count; i+=2) elements.push(<rect key={i} x={x + i*density} y={y} width={density/2} height={h} fill={color} />);
  } else {
      const count = Math.floor(h / density);
      for(let i=0; i<count; i+=2) elements.push(<rect key={i} x={x} y={y + i*density} width={w} height={density/2} fill={color} />);
  }
  return <g>{elements}</g>;
};

const PatternGrid: React.FC<{ x: number, y: number, w: number, h: number, color: string, density?: number }> = ({ x, y, w, h, color, density = 12 }) => {
  const elements = [];
  const cols = Math.floor(w/density);
  const rows = Math.floor(h/density);
  for(let r=0; r<rows; r++) {
      for(let c=0; c<cols; c++) {
          if ((r+c)%2 === 0) elements.push(<circle key={`${r}-${c}`} cx={x + c*density + density/2} cy={y + r*density + density/2} r={1.5} fill={color} />);
      }
  }
  return <g>{elements}</g>;
};

const SwissRule: React.FC<{ x1: number, y1: number, x2: number, y2: number }> = (props) => (
  <line {...props} stroke="#121212" strokeWidth={0.5} />
);

// ─────────────────────────────────────────────────────────
// PARAMETRIC ARCHETYPES (Classics 1-5)
// ─────────────────────────────────────────────────────────

// 1. COMPLEMENTARY (Parametric Split)
const ArchComplementary = (id: SessionIdentity) => {
  const { primaryHue: pH, secondaryHue: sH, accentHue: aH, seed } = id;
  const isVertical = srandom(seed) > 0.5;
  const ratio = rngRange(seed + 1, 0.4, 0.7);
  const m = rngRange(seed + 2, G, G * 2);

  if (isVertical) {
      const splitX = CW * ratio;
      return <>
        <rect x={m} y={m} width={splitX - m - 2} height={CH - m*2} fill={col(pH)} />
        <rect x={splitX + 2} y={m} width={CW - splitX - m - 2} height={CH - m*2} fill={col(sH)} />
        <rect x={splitX - G} y={CH - m - G*2} width={G*2} height={G*2} fill={col(aH)} />
        <SwissRule x1={m} y1={CH - m/2} x2={CW - m} y2={CH - m/2} />
      </>;
  } else {
      const splitY = CH * ratio;
      return <>
        <rect x={m} y={m} width={CW - m*2} height={splitY - m - 2} fill={col(pH)} />
        <rect x={m} y={splitY + 2} width={CW - m*2} height={CH - splitY - m - 2} fill={col(sH)} />
        <rect x={CW - m - G*2} y={splitY - G} width={G*2} height={G*2} fill={col(aH)} />
        <SwissRule x1={m/2} y1={splitY} x2={CW - m/2} y2={splitY} />
      </>;
  }
};

// 2. ANALOGOUS (Parametric Bands)
const ArchAnalogous = (id: SessionIdentity) => {
  const { primaryHue: pH, secondaryHue: sH, accentHue: aH, seed } = id;
  const m = rngRange(seed, G, G*3); 
  const w = CW - m*2;
  const hTotal = CH * rngRange(seed+1, 0.5, 0.75); 
  const yStart = (CH - hTotal)/2;
  
  const r1 = rngRange(seed+2, 0.2, 0.5);
  const r2 = rngRange(seed+3, 0.2, 0.4);
  const h1 = hTotal * r1;
  const h2 = hTotal * r2;
  const h3 = hTotal - h1 - h2;

  const colors = [pH, sH, aH].sort(() => srandom(seed+4) - 0.5);

  return <>
    <rect x={m} y={yStart} width={w} height={h1} fill={col(colors[0])} />
    <rect x={m} y={yStart + h1} width={w} height={h2} fill={col(colors[1])} />
    <rect x={m} y={yStart + h1 + h2} width={w} height={h3} fill={col(colors[2])} />
    <rect x={m} y={yStart} width={w} height={hTotal} fill="none" stroke="#121212" strokeWidth={1} />
    {srandom(seed+5) > 0.5 ? (
        <SwissRule x1={m} y1={yStart + h1} x2={CW - m} y2={yStart + h1} />
    ) : (
        <SwissRule x1={CW/2} y1={G} x2={CW/2} y2={CH-G} />
    )}
  </>;
};

// 3. SPLIT (Parametric T-Layout)
const ArchSplit = (id: SessionIdentity) => {
  const { primaryHue: pH, secondaryHue: sH, accentHue: aH, seed } = id;
  const m = G * 1.5;
  const flip = srandom(seed) > 0.5;
  const bigW = CW * rngRange(seed+1, 0.4, 0.6);
  
  const xBig = flip ? CW - m - bigW : m;
  const xSmall = flip ? m : m + bigW + 2;
  const wSmall = CW - m*2 - bigW - 2;
  
  const hTotal = CH - m*3;
  const splitY = m + hTotal * rngRange(seed+2, 0.3, 0.7);

  return <>
    <rect x={xBig} y={m} width={bigW} height={hTotal} fill={col(pH)} />
    <rect x={xSmall} y={m} width={wSmall} height={splitY - m - 1} fill={col(sH)} />
    {srandom(seed+3) > 0.7 ? (
        <PatternStripe x={xSmall} y={splitY + 1} w={wSmall} h={hTotal + m - splitY - 1} color={col(aH)} density={3} />
    ) : (
        <rect x={xSmall} y={splitY + 1} width={wSmall} height={hTotal + m - splitY - 1} fill={col(aH)} />
    )}
    <SwissRule x1={0} y1={splitY} x2={CW} y2={splitY} />
  </>;
};

// 4. TRIADIC (Parametric Geometry)
const ArchTriadic = (id: SessionIdentity) => {
  const { primaryHue: pH, secondaryHue: sH, accentHue: aH, seed } = id;
  const fieldH = CH * rngRange(seed, 0.4, 0.7);
  const isTop = srandom(seed+1) > 0.5;
  const fieldY = isTop ? 0 : CH - fieldH;
  
  const shapeSize = CW * rngRange(seed+2, 0.4, 0.6);
  const cx = CW * rngRange(seed+3, 0.3, 0.7); 
  const cy = isTop ? fieldH + (CH-fieldH)/2 : (CH-fieldH)/2;
  
  const isTriangle = srandom(seed+4) > 0.3;

  return <>
    <rect x={0} y={fieldY} width={CW} height={fieldH} fill={col(pH)} />
    {isTriangle ? (
        <polygon points={`${cx},${cy - shapeSize/2} ${cx - shapeSize/2},${cy + shapeSize/2} ${cx + shapeSize/2},${cy + shapeSize/2}`} fill={col(sH)} />
    ) : (
        <circle cx={cx} cy={cy} r={shapeSize/2} fill={col(sH)} />
    )}
    <circle cx={isTop ? CW - G : G} cy={isTop ? CH - G : G} r={G/1.5} fill={col(aH)} />
    <SwissRule x1={0} y1={isTop ? fieldH : CH-fieldH} x2={CW} y2={isTop ? fieldH : CH-fieldH} />
  </>;
};

// 5. SQUARE (Parametric Grid)
const ArchSquare = (id: SessionIdentity) => {
  const { primaryHue: pH, secondaryHue: sH, accentHue: aH, seed } = id;
  const size = CW * rngRange(seed, 0.4, 0.7);
  const cx = CW/2 - size/2;
  const cy = CH/2 - size/2;
  const half = size/2;
  
  const palette = [pH, sH, aH, (aH + 40)];
  const shuf = palette.sort(() => srandom(seed+1) - 0.5);
  const offX = rngRange(seed+2, -20, 20);
  const offY = rngRange(seed+3, -20, 20);

  return <>
    <g transform={`translate(${offX}, ${offY})`}>
        <rect x={cx} y={cy} width={half} height={half} fill={col(shuf[0])} />
        <rect x={cx + half} y={cy} width={half} height={half} fill={col(shuf[1])} />
        <rect x={cx} y={cy + half} width={half} height={half} fill={col(shuf[2])} />
        <rect x={cx + half} y={cy + half} width={half} height={half} fill={col(shuf[3])} />
        <rect x={cx} y={cy} width={size} height={size} fill="none" stroke="#121212" strokeWidth={1} />
    </g>
    <SwissRule x1={cx + half + offX} y1={0} x2={cx + half + offX} y2={CH} />
    <SwissRule x1={0} y1={cy + half + offY} x2={CW} y2={cy + half + offY} />
  </>;
};

// ─────────────────────────────────────────────────────────
// GENERATIVE ARCHETYPES (The New Wave 6-10)
// ─────────────────────────────────────────────────────────

// 6. THE TOTEM (Generative Stack)
const ArchTotem = (id: SessionIdentity) => {
  const { primaryHue, secondaryHue, accentHue, seed } = id;
  const w = CW * rngRange(seed, 0.3, 0.5);
  const x = (CW - w) / 2;
  const startY = G * 2;
  const totalH = CH - G * 4;
  
  const parts = Math.floor(rngRange(seed+1, 3, 6));
  const blocks = [];
  let curY = startY;
  const heights = Array.from({length: parts}, (_, i) => rngRange(seed+i, 1, 3));
  const totalWeight = heights.reduce((a,b)=>a+b, 0);
  const unit = totalH / totalWeight;

  for(let i=0; i<parts; i++) {
      const h = Math.floor(heights[i] * unit);
      const c = [primaryHue, secondaryHue, accentHue][i % 3];
      const type = srandom(seed + i + 10);
      
      if (type > 0.6) {
          blocks.push(<rect key={i} x={x} y={curY} width={w} height={h-2} fill={col(c)} />);
      } else if (type > 0.3) {
          blocks.push(<PatternStripe key={i} x={x} y={curY} w={w} h={h-2} color={col(c)} density={3} />);
      } else {
          const size = Math.min(w, h-2);
          const cx = x + w/2;
          const cy = curY + (h-2)/2;
          if (srandom(seed+i+20) > 0.5)
             blocks.push(<circle key={i} cx={cx} cy={cy} r={size/2} fill={col(c)} />);
          else 
             blocks.push(<rect key={i} x={cx-size/2} y={cy-size/2} width={size} height={size} fill={col(c)} transform={`rotate(45 ${cx} ${cy})`} />);
      }
      curY += h;
  }

  return <>
      {blocks}
      <SwissRule x1={CW/2} y1={0} x2={CW/2} y2={CH} />
  </>;
};

// 7. THE ORBITAL (Generative Radial)
const ArchOrbital = (id: SessionIdentity) => {
  const { primaryHue, secondaryHue, accentHue, seed } = id;
  const cx = CW / 2;
  const cy = CH / 2;
  
  const r1 = CW * rngRange(seed, 0.15, 0.35); 
  const orbitR = r1 + rngRange(seed+1, 20, 50);
  const satSize = rngRange(seed+2, 10, 30);
  const angle = rngRange(seed+3, 0, Math.PI * 2);
  
  const sx = cx + Math.cos(angle) * orbitR;
  const sy = cy + Math.sin(angle) * orbitR;
  
  return <>
      <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke={col(secondaryHue)} strokeWidth={1} strokeDasharray="4 4" />
      <circle cx={cx} cy={cy} r={r1} fill={col(primaryHue)} />
      {srandom(seed+4) > 0.5 ? (
          <circle cx={sx} cy={sy} r={satSize} fill={col(accentHue)} />
      ) : (
          <rect x={sx-satSize} y={sy-satSize} width={satSize*2} height={satSize*2} fill={col(accentHue)} />
      )}
      <SwissRule x1={cx - r1*2} y1={cy} x2={cx + r1*2} y2={cy} />
      <SwissRule x1={cx} y1={cy - r1*2} x2={cx} y2={cy + r1*2} />
  </>;
};

// 8. THE GRIDNIK (Generative Grid Fill)
const ArchGridnik = (id: SessionIdentity) => {
  const { primaryHue, secondaryHue, accentHue, seed } = id;
  const cols = Math.floor(rngRange(seed, 3, 5));
  const rows = Math.floor(rngRange(seed+1, 4, 6));
  
  const margin = G * 2;
  const cellW = (CW - margin*2) / cols;
  const cellH = (CH - margin*2) / rows;
  
  const cells = [];
  for(let r=0; r<rows; r++) {
      for(let c=0; c<cols; c++) {
          const val = srandom(seed + r*10 + c);
          const cx = margin + c*cellW;
          const cy = margin + r*cellH;
          const w = cellW - 2;
          const h = cellH - 2;
          
          if (val > 0.85) {
              cells.push(<rect key={`${r}${c}`} x={cx} y={cy} width={w} height={h} fill={col(primaryHue)} />);
          } else if (val > 0.7) {
              cells.push(<PatternGrid key={`${r}${c}`} x={cx} y={cy} w={w} h={h} color={col(secondaryHue)} density={6} />);
          } else if (val > 0.6) {
              cells.push(<circle key={`${r}${c}`} cx={cx + w/2} cy={cy + h/2} r={Math.min(w,h)/3} fill={col(accentHue)} />);
          } else if (val < 0.2) {
              cells.push(<rect key={`${r}${c}`} x={cx} y={cy} width={w} height={h} fill="none" stroke="#e5e5e5" strokeWidth={1} />);
          }
      }
  }
  return <>{cells}</>;
};

// 9. THE CANTILEVER (Generative Asymmetry)
const ArchCantilever = (id: SessionIdentity) => {
  const { primaryHue, secondaryHue, accentHue, seed } = id;
  const topH = CH * rngRange(seed, 0.5, 0.7);
  const botH = CH - topH - G*2;
  
  const anchorW = CW - G*4;
  const anchorX = G*2;
  const anchorY = topH;
  const floatSize = G * rngRange(seed+1, 3, 5);
  const floatX = anchorX + (anchorW * srandom(seed+2));
  const floatY = topH - floatSize - G;

  return <>
      <rect x={anchorX} y={anchorY} width={anchorW} height={botH} fill={col(primaryHue)} />
      <rect x={anchorX} y={anchorY + G} width={anchorW} height={G} fill={col(secondaryHue)} />
      {srandom(seed+3) > 0.5 ? (
          <circle cx={floatX} cy={floatY + floatSize/2} r={floatSize/2} fill={col(accentHue)} />
      ) : (
          <rect x={floatX - floatSize/2} y={floatY} width={floatSize} height={floatSize} fill={col(accentHue)} />
      )}
      <SwissRule x1={anchorX} y1={anchorY} x2={anchorX + anchorW} y2={anchorY} />
      <SwissRule x1={floatX} y1={G} x2={floatX} y2={CH-G} />
  </>;
};

// 10. THE CONSTRUCTIVIST (Generative Angles)
const ArchConstructivist = (id: SessionIdentity) => {
  const { primaryHue, secondaryHue, accentHue, seed } = id;
  const y1 = CH * rngRange(seed, 0.2, 0.5);
  const y2 = CH * rngRange(seed+1, 0.6, 0.9);
  const p1 = `${0},${y1} ${CW},${y2} ${CW},${CH} ${0},${CH}`;
  const beamAngle = rngRange(seed+2, -30, 30);
  const beamX = CW * rngRange(seed+3, 0.2, 0.8);
  const beamW = rngRange(seed+4, 20, 50);

  return <>
      <polygon points={p1} fill={col(primaryHue)} />
      <g transform={`rotate(${beamAngle}, ${beamX}, ${CH/2})`}>
          <rect x={beamX} y={-50} width={beamW} height={CH+100} fill={col(secondaryHue)} opacity="0.9" />
          <PatternStripe x={beamX + 5} y={-50} w={beamW/2} h={CH+100} color={col(accentHue)} vertical={true} density={3} />
      </g>
      <circle cx={CW*rngRange(seed+5, 0.2, 0.8)} cy={CH*rngRange(seed+6, 0.2, 0.8)} r={G*2} fill={col(accentHue)} />
  </>;
};

// ─────────────────────────────────────────────────────────
// Director & Main Component
// ─────────────────────────────────────────────────────────

const ARCHETYPES = [
  ArchComplementary, // 0
  ArchAnalogous,     // 1
  ArchSplit,         // 2
  ArchTriadic,       // 3
  ArchSquare,        // 4
  ArchTotem,         // 5
  ArchOrbital,       // 6
  ArchGridnik,       // 7
  ArchCantilever,    // 8
  ArchConstructivist // 9
];

const GenerativePoster: React.FC<{ identity: SessionIdentity }> = ({ identity }) => {
  const Template = ARCHETYPES[identity.archetypeIndex % ARCHETYPES.length];
  
  return (
      <>
          <Template {...identity} />
          {/* No Footer Text - Pure Visuals */}
      </>
  );
};

const BauhausComposition: React.FC<BauhausCompositionProps> = ({
  levels,
  progress,
  sessionId,
  className = '',
}) => {
  const { identity, isComplete } = useMemo(() => {
    const completed = (progress ?? []).filter(p => typeof p === 'number' && (p as number) > 0);
    const isComplete = completed.length >= 20;
    const identity = isComplete ? deriveIdentity(levels ?? [], progress ?? [], sessionId) : null;
    return { identity, isComplete };
  }, [levels, progress, sessionId]);

  const renderInProgress = () => (
      <PatternGrid x={G} y={G} w={CW - G*2} h={CH - G*2} color="#e5e5e5" density={20} />
  );

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ display: 'block', width: '100%', backgroundColor: '#ffffff' }}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
    >
      <rect x={0} y={0} width={CW} height={CH} fill="#ffffff" />
      {isComplete && identity ? <GenerativePoster identity={identity} /> : renderInProgress()}
      <text
        x={8}
        y={313}
        fontFamily="'Jost', sans-serif"
        fontWeight="900"
        fontSize="7"
        letterSpacing="0"
        fill="#121212"
      >
        the absolutist.
      </text>
      <rect x={0} y={0} width={CW} height={CH} fill="none" stroke="#121212" strokeWidth={2} />
    </svg>
  );
};

export default BauhausComposition;