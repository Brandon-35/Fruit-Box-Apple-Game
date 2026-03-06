export type AppleType = 'normal' | 'bomb' | 'clock' | 'wildcard' | 'golden';

export type MissionType = 'QUANTITY' | 'COUNT' | 'CHAIN';
export type RewardType = 'POINTS' | 'FREEZE' | 'GOLDEN';

export type GameState = 'home' | 'playing' | 'paused' | 'gameover';
export type DifficultyKey = 'EASY' | 'MEDIUM' | 'HARD';
export type GameModeKey = 'TIME_ATTACK' | 'ENDLESS';

export interface DifficultyConfig {
  label: string;
  rows: number;
  cols: number;
  time: number;
  name: string;
}

export interface GameModeConfig {
  id: string;
  label: string;
  description: string;
}

export interface FruitConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  lightColor: string;
  textColor: string;
  shadow: string;
}

export interface Mission {
  id: string;
  type: MissionType;
  description: string;
  targetValue?: number;
  targetCount: number;
  currentProgress: number;
  timeLeft: number;
  totalTime: number;
  rewardType: RewardType;
}

export interface AppleData {
  id: string;
  value: number;
  isCleared: boolean;
  type: AppleType;
}

export interface Selection {
  start: { r: number; c: number } | null;
  end: { r: number; c: number } | null;
}

export interface ActionFeedback {
  type: 'success' | 'fail';
  pos: { x: number; y: number };
  id: number;
}

export interface GameData {
  highScores: Record<string, number>;
  settings: {
    isMuted: boolean;
    lastDifficulty: DifficultyKey;
    lastGameMode: GameModeKey;
    lastFruitId: string;
  };
}
