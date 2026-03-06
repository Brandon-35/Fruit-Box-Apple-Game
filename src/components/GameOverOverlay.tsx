import { motion, AnimatePresence } from 'motion/react';
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-2xl rounded-[3rem]"
        >
          <div className="text-center p-16 bg-white rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-8 border-red-50">
            <div className="text-8xl mb-8">{selectedFruit.icon}</div>
            <h2 className="text-6xl font-black text-[#1A1A1A] mb-4 tracking-tighter">
              {isBoardCleared ? 'Đã Xóa Sạch!' : "Hết Giờ!"}
            </h2>
            <div className="flex flex-col gap-3 mb-12">
              <p className="text-4xl font-mono font-black text-red-500">Điểm: {score}</p>
              <p className="text-sm font-black text-[#A0AEC0] uppercase tracking-[0.5em]">Kỷ lục: {highScore}</p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={onRestart}
                className={`w-full px-12 py-7 ${selectedFruit.color} text-white rounded-[2.5rem] font-black text-2xl shadow-2xl ${selectedFruit.shadow} hover:brightness-110 transition-all hover:-translate-y-2 active:translate-y-0 flex items-center justify-center gap-4 cursor-pointer`}
              >
                <RotateCcw size={32} strokeWidth={3} /> Chơi lại
              </button>
              <button
                onClick={onGoHome}
                className="w-full px-12 py-5 bg-[#F8F9FA] text-[#A0AEC0] rounded-[2rem] font-black text-lg hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Home size={24} /> Quay lại Trang chủ
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
