import { motion, AnimatePresence } from 'motion/react';
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCFB]/70 backdrop-blur-2xl"
        >
          <div className="bg-white p-20 rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.2)] text-center border border-[#F1F3F5] max-w-md w-full">
            <div className={`w-24 h-24 ${selectedFruit.color} text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${selectedFruit.shadow}`}>
              <Pause size={48} strokeWidth={3} />
            </div>
            <h2 className="text-5xl font-black text-[#1A1A1A] mb-10 tracking-tighter">Đã Tạm Dừng</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  onResume();
                  playSound(SOUNDS.CLICK);
                }}
                className={`w-full px-16 py-6 ${selectedFruit.color} text-white rounded-[2rem] font-black text-2xl shadow-2xl ${selectedFruit.shadow} hover:brightness-110 transition-all hover:-translate-y-2 cursor-pointer`}
              >
                Tiếp tục
              </button>
              <button
                onClick={onGoHome}
                className="w-full px-16 py-5 bg-[#F8F9FA] text-[#A0AEC0] rounded-[2rem] font-black text-lg hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Home size={24} /> Thoát ra Trang chủ
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
