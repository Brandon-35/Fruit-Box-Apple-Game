import { motion } from 'motion/react';
import { Zap, Clock } from 'lucide-react';
import { CONSTANTS } from '../data/gameData';

const { COMBO_MAX, FEVER_DURATION } = CONSTANTS;

interface ComboGaugeProps {
  comboCount: number;
  isFeverMode: boolean;
  feverTimeLeft: number;
  timeFrozenLeft: number;
}

export function ComboGauge({ comboCount, isFeverMode, feverTimeLeft, timeFrozenLeft }: ComboGaugeProps) {
  return (
    <div className="w-full max-w-[1100px] mb-8">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isFeverMode ? 'text-orange-500' : 'text-[#A0AEC0]'}`}>
            {isFeverMode ? 'Năng lượng Fever' : 'Thanh Combo'}
          </span>
          {timeFrozenLeft > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <Clock size={10} /> ĐÓNG BĂNG {Math.ceil(timeFrozenLeft)}s
            </motion.div>
          )}
          {comboCount > 0 && !isFeverMode && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full"
            >
              {comboCount} COMBO
            </motion.span>
          )}
        </div>
        {isFeverMode && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-orange-500 font-black text-xs tracking-widest uppercase flex items-center gap-2"
          >
            <Zap size={14} fill="currentColor" /> Chế độ Fever đang bật! Nhân 3 điểm
          </motion.div>
        )}
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
        <motion.div
          className={`h-full rounded-full transition-all duration-300 ${isFeverMode ? 'bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-[length:200%_100%]' : 'bg-orange-500'}`}
          animate={isFeverMode ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
          transition={isFeverMode ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
          style={{ width: isFeverMode ? `${(feverTimeLeft / FEVER_DURATION) * 100}%` : `${(comboCount / COMBO_MAX) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest">
          {isFeverMode ? 'Thời gian Fever còn lại' : 'Tiến trình Combo'}
        </span>
        <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest">
          {isFeverMode ? `${Math.ceil(feverTimeLeft)}s` : `${comboCount}/${COMBO_MAX} để đạt Fever`}
        </span>
      </div>
    </div>
  );
}
