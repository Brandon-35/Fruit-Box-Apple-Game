import { m } from 'motion/react';
import { Timer, Trophy, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import type { DifficultyKey, GameModeKey, FruitConfig, GameState } from '../types';
import { DIFFICULTIES, GAME_MODES, SOUNDS } from '../data/gameData';

interface GameHeaderProps {
  difficulty: DifficultyKey;
  gameMode: GameModeKey;
  selectedFruit: FruitConfig;
  gameState: GameState;
  timeLeft: number;
  score: number;
  isMuted: boolean;
  isFeverMode: boolean;
  onGoHome: () => void;
  onToggleMute: () => void;
  playSound: (url: string) => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameHeader({
  difficulty, gameMode, selectedFruit, timeLeft, score,
  isMuted, isFeverMode, onGoHome, onToggleMute, playSound,
}: GameHeaderProps) {
  const config = DIFFICULTIES[difficulty];

  return (
    <header className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-game-border bg-game-surface/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onGoHome}
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <m.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 ${selectedFruit.color} rounded-xl flex items-center justify-center shadow-md ${selectedFruit.shadow}`}
          >
            <span className="text-white font-bold text-2xl">{selectedFruit.icon}</span>
          </m.div>
          <div className="text-left">
            <h1 className="text-2xl font-heading font-extrabold tracking-tight text-game-text group-hover:text-game-primary transition-colors">Fruit Box</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                difficulty === 'HARD' ? 'bg-red-50 text-red-500' : difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {config.label}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-game-primary">
                {GAME_MODES[gameMode].label}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-5 md:gap-10">
        {gameMode === 'TIME_ATTACK' && (
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] font-semibold text-game-text-faint uppercase tracking-wider mb-0.5">Thời gian</span>
            <div className={`flex items-center gap-2 text-2xl font-mono font-extrabold ${timeLeft < 20 ? 'text-game-danger animate-pulse' : 'text-game-text'}`}>
              <Timer size={20} strokeWidth={2.5} />
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
        {gameMode === 'ENDLESS' && (
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] font-semibold text-game-text-faint uppercase tracking-wider mb-0.5">Trạng thái</span>
            <div className="flex items-center gap-2 text-2xl font-mono font-extrabold text-emerald-500">
              <Play size={20} fill="currentColor" />
              VÔ TẬN
            </div>
          </div>
        )}
        <div className="flex flex-col items-center md:items-end">
          <span className="text-[10px] font-semibold text-game-text-faint uppercase tracking-wider mb-0.5">Điểm</span>
          <div className="flex items-center gap-2 text-2xl font-mono font-extrabold text-game-text">
            <div className="relative">
              <Trophy size={20} className={isFeverMode ? "text-game-accent" : "text-yellow-500"} strokeWidth={2.5} />
              {isFeverMode && (
                <m.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1.5 -right-1.5 bg-game-accent text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-white"
                >
                  3x
                </m.div>
              )}
            </div>
            {score.toString().padStart(4, '0')}
          </div>
        </div>

        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) playSound(SOUNDS.CLICK);
          }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isMuted ? 'bg-game-surface-alt text-game-text-faint' : 'bg-indigo-50 text-game-primary'
          }`}
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX size={20} strokeWidth={2.5} /> : <Volume2 size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </header>
  );
}
