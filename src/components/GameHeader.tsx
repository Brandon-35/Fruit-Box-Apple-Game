import { motion } from 'motion/react';
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
    <header className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#F1F3F5] bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-5">
        <button
          onClick={onGoHome}
          className="group flex items-center gap-3 hover:text-red-500 transition-colors cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className={`w-14 h-14 ${selectedFruit.color} rounded-2xl flex items-center justify-center shadow-2xl ${selectedFruit.shadow}`}
          >
            <span className="text-white font-bold text-3xl">{selectedFruit.icon}</span>
          </motion.div>
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tighter text-[#1A1A1A] group-hover:text-inherit">Fruit Box</h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Cấp độ:</span>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                difficulty === 'HARD' ? 'bg-red-50 text-red-500' : difficulty === 'MEDIUM' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'
              }`}>
                {config.label}
              </span>
              <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Chế độ:</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
                {GAME_MODES[gameMode].label}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-6 md:gap-16">
        {gameMode === 'TIME_ATTACK' && (
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-1">Thời gian còn lại</span>
            <div className={`flex items-center gap-3 text-3xl font-mono font-black ${timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-[#1A1A1A]'}`}>
              <Timer size={24} strokeWidth={3} />
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
        {gameMode === 'ENDLESS' && (
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-1">Trạng thái</span>
            <div className="flex items-center gap-3 text-3xl font-mono font-black text-emerald-500">
              <Play size={24} fill="currentColor" />
              VÔ TẬN
            </div>
          </div>
        )}
        <div className="flex flex-col items-center md:items-end">
          <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-1">Tổng điểm</span>
          <div className="flex items-center gap-3 text-3xl font-mono font-black text-[#1A1A1A]">
            <div className="relative">
              <Trophy size={24} className={isFeverMode ? "text-orange-500" : "text-yellow-500"} strokeWidth={3} />
              {isFeverMode && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white"
                >
                  3x
                </motion.div>
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
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isMuted ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-500 shadow-sm'
          }`}
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX size={24} strokeWidth={3} /> : <Volume2 size={24} strokeWidth={3} />}
        </button>
      </div>
    </header>
  );
}
