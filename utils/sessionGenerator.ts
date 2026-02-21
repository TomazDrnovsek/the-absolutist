import { SessionData, LevelData, HarmonyNode } from '../types';
import { generateHarmonyTargets, getHarmonyDifficulty } from './harmony';
import { generateRandomColor } from './color';

// --- Seed System (Deck of Cards) ---
const HUE_BUCKETS = 20; 

const generateHueDeck = (): number[] => {
  const deck: number[] = [];
  const step = 360 / HUE_BUCKETS;
  
  for (let i = 0; i < HUE_BUCKETS; i++) {
    // Add some jitter so it's not robotic
    const jitter = Math.floor(Math.random() * 10) - 5;
    let hue = (i * step) + jitter;
    if (hue < 0) hue += 360;
    if (hue > 360) hue -= 360;
    deck.push(hue);
  }
  
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
};

// --- Level Generator ---

const generateLevel = (index: number, rootHue: number): LevelData => {
  const levelNum = index + 1;
  const harmonyType = getHarmonyDifficulty(levelNum);
  
  // 1. Define Root Color (The Anchor)
  // High saturation/medium lightness is best for training hue perception
  const rootColor = { 
    h: rootHue, 
    s: 60 + Math.floor(Math.random() * 30), 
    l: 45 + Math.floor(Math.random() * 15) 
  };

  // 2. Calculate Targets
  const satellites = generateHarmonyTargets(rootColor, harmonyType);

  // 3. Build Nodes
  const nodes: HarmonyNode[] = [];

  // Node 0: The Anchor (Locked)
  nodes.push({
    id: 0,
    isLocked: true,
    targetColor: rootColor,
    userColor: rootColor
  });

  // Node 1..n: The Satellites (Unlocked, randomized start)
  satellites.forEach((sat, idx) => {
    // Start with a randomized color 
    const randomStart = generateRandomColor();
    
    nodes.push({
      id: idx + 1,
      isLocked: false,
      targetColor: sat,
      userColor: randomStart 
    });
  });

  return {
    levelNumber: levelNum,
    rootColor,
    harmonyType,
    nodes
  };
};

// --- Session Generator ---

const ADJECTIVES = ['Absolute', 'Pure', 'Resonant', 'Vital', 'Static', 'Linear', 'Radial', 'Chromatic'];
const NOUNS = ['Form', 'Void', 'Grid', 'Ratio', 'System', 'Logic', 'Prism', 'Cycle'];

const generateSessionName = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

export const getNextSession = (id: number): SessionData => {
  const deck = generateHueDeck();
  const levels: LevelData[] = [];

  for (let i = 0; i < 20; i++) {
    levels.push(generateLevel(i, deck[i]));
  }

  return {
    id,
    name: generateSessionName(),
    mood: 'NEUTRAL',
    levels,
    progress: new Array(20).fill(null),
    isComplete: false
  };
};