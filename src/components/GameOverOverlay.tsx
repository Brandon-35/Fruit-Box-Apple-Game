import { m, AnimatePresence } from 'motion/react';
import { RotateCcw, Home } from 'lucide-react';
import type { AppleData, FruitConfig } from '../types';

interface GameOverOverlayProps {
  show: boolean;
  grid: AppleData[][];
  score: number;
  highScore: number;
  selectedFruit: FruitConfig;
  onRestart: () => void;
  onGoHome: () => void;
}

export function GameOverOverlay({ show, grid, score, highScore, selectedFruit, onRestart, onGoHome }: GameOverOverlayProps) {
  const isBoardCleared = grid.length > 0 && grid.every(row => row.every(apple => apple.isCleared));

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-2xl rounded-card-lg"
        >
          <div className="text-center p-10 md:p-14 bg-game-surface rounded-card-lg shadow-[0_16px_64px_-16px_rgba(78,69,229,0.2)] border border-game-border max-w-md w-full mx-4">
            <div className="text-7xl mb-6">{selectedFruit.icon}</div>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-game-text mb-3 tracking-tight">
              {isBoardCleared ? 'Đã Xóa Sạch!' : "Hết Giờ!"}
            </h2>
            <div className="flex flex-col gap-2 mb-10">
              <p className="text-3xl font-mono font-extrabold text-game-primary">Điểm: {score}</p>
              <p className="text-sm font-semibold text-game-text-faint uppercase tracking-wider">Kỷ lục: {highScore}</p>
            </div>
            <div className="flex flex-col gap-3">
              <m.button
                onClick={onRestart}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-8 py-5 ${selectedFruit.color} text-white rounded-card font-heading font-bold text-xl shadow-lg ${selectedFruit.shadow} hover:brightness-110 transition-all flex items-center justify-center gap-3 cursor-pointer`}
              >
                <RotateCcw size={24} strokeWidth={2.5} /> Chơi lại
              </m.button>
              <button
                onClick={onGoHome}
                className="w-full px-8 py-4 bg-game-surface-alt text-game-text-muted rounded-card font-bold text-base hover:text-game-text hover:bg-game-border/50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-game-border"
              >
                <Home size={20} /> Trang chủ
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
