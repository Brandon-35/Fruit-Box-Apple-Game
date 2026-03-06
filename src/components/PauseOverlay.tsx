import { m, AnimatePresence } from 'motion/react';
import { Pause, Home } from 'lucide-react';
import type { FruitConfig } from '../types';
import { SOUNDS } from '../data/gameData';

interface PauseOverlayProps {
  show: boolean;
  selectedFruit: FruitConfig;
  onResume: () => void;
  onGoHome: () => void;
  playSound: (url: string) => void;
}

export function PauseOverlay({ show, selectedFruit, onResume, onGoHome, playSound }: PauseOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-game-bg/70 backdrop-blur-2xl"
        >
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-game-surface p-12 md:p-16 rounded-card-lg shadow-[0_16px_64px_-16px_rgba(78,69,229,0.2)] text-center border border-game-border max-w-md w-full mx-4"
          >
            <div className={`w-20 h-20 ${selectedFruit.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg ${selectedFruit.shadow}`}>
              <Pause size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-heading font-extrabold text-game-text mb-8 tracking-tight">Đã Tạm Dừng</h2>
            <div className="flex flex-col gap-3">
              <m.button
                onClick={() => {
                  onResume();
                  playSound(SOUNDS.CLICK);
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-12 py-5 ${selectedFruit.color} text-white rounded-card font-heading font-bold text-xl shadow-lg ${selectedFruit.shadow} hover:brightness-110 transition-all cursor-pointer`}
              >
                Tiếp tục
              </m.button>
              <button
                onClick={onGoHome}
                className="w-full px-12 py-4 bg-game-surface-alt text-game-text-muted rounded-card font-bold text-base hover:text-game-text hover:bg-game-border/50 transition-all flex items-center justify-center gap-2 cursor-pointer border border-game-border"
              >
                <Home size={20} /> Thoát ra Trang chủ
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
