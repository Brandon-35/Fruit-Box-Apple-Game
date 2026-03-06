import type { GameData, DifficultyConfig, GameModeConfig, FruitConfig, DifficultyKey, GameModeKey } from '../types';
import config from './game.json';

export const DIFFICULTIES = config.difficulties as Record<DifficultyKey, DifficultyConfig>;
export const GAME_MODES = config.gameModes as Record<GameModeKey, GameModeConfig>;
export const FRUITS = config.fruits as FruitConfig[];
export const SOUNDS = config.sounds;
export const CONSTANTS = config.constants;

const DATA_FILE_KEY = 'fruit-box-game-data';

const DEFAULT_DATA: GameData = {
  highScores: {},
  settings: {
    isMuted: false,
    lastDifficulty: 'MEDIUM',
    lastGameMode: 'TIME_ATTACK',
    lastFruitId: 'apple',
  },
};

export function loadGameData(): GameData {
  try {
    const raw = localStorage.getItem(DATA_FILE_KEY);
    if (raw) {
      return { ...DEFAULT_DATA, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_DATA };
}

export function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(DATA_FILE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getHighScore(difficulty: DifficultyKey, gameMode: GameModeKey): number {
  const data = loadGameData();
  return data.highScores[`${difficulty}_${gameMode}`] || 0;
}

export function setHighScore(difficulty: DifficultyKey, gameMode: GameModeKey, score: number): void {
  const data = loadGameData();
  const key = `${difficulty}_${gameMode}`;
  if (score > (data.highScores[key] || 0)) {
    data.highScores[key] = score;
    saveGameData(data);
  }
}

export function saveSettings(settings: Partial<GameData['settings']>): void {
  const data = loadGameData();
  data.settings = { ...data.settings, ...settings };
  saveGameData(data);
}
