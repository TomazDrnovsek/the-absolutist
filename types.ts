export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export type HarmonyType = 
  | 'complementary'        
  | 'analogous'            
  | 'split-complementary' 
  | 'triadic'              
  | 'tetradic'             
  | 'square'               
  | 'monochromatic';

export interface HarmonyRule {
  type: HarmonyType;
  label: string;
  offsets: number[]; // Degrees relative to Root Hue
  description: string;
}

// Represents a single color dot on the screen
export interface HarmonyNode {
  id: number;
  isLocked: boolean; // True for the Base/Root color (The Anchor)
  targetColor: HSL;  // The calculated "Correct" color
  userColor: HSL;    // The player's current input
}

// A single level (Assignment)
export interface LevelData {
  levelNumber: number;
  rootColor: HSL;
  // CHANGED: string allows "COMPLEMENTARY" (uppercase display label)
  harmonyType: string; 
  nodes: HarmonyNode[]; // The puzzle state
}

// The full Session container
export interface SessionData {
  id: number;
  name: string;
  mood: string;          
  levels: LevelData[];   
  progress: (number | null)[]; // Scores for each level (0-100)
  isComplete: boolean;
}

export type BauhausShapeType = 
  | 'square' 
  | 'trapezoid' 
  | 'triangle' 
  | 'l-beam' 
  | 'semi-circle' 
  | 'circle' 
  | 'capsule' 
  | 'rhombus' 
  | 'cross';