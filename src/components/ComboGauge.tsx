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
    <div className="w-full max-w-[1100px] mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${isFeverMode ? 'text-game-accent' : 'text-game-text-faint'}`}>
            {isFeverMode ? 'Fever Mode' : 'Combo'}
          </span>
          {timeFrozenLeft > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <Clock size={10} /> {Math.ceil(timeFrozenLeft)}s
            </motion.div>
          )}
          {comboCount > 0 && !isFeverMode && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-game-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              {comboCount}x
            </motion.span>
          )}
        </div>
        {isFeverMode && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="text-game-accent font-bold text-xs tracking-wider uppercase flex items-center gap-1.5"
          >
            <Zap size={13} fill="currentColor" /> x3 Điểm
          </motion.div>
        )}
      </div>
      <div className="h-2.5 w-full bg-game-surface-alt rounded-full overflow-hidden border border-game-border">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${isFeverMode ? 'bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-[length:200%_100%]' : 'bg-game-accent'}`}
          animate={isFeverMode ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
          transition={isFeverMode ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
          style={{ width: isFeverMode ? `${(feverTimeLeft / FEVER_DURATION) * 100}%` : `${(comboCount / COMBO_MAX) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] font-medium text-game-text-faint uppercase tracking-wider">
          {isFeverMode ? 'Thời gian còn lại' : 'Tiến trình'}
        </span>
        <span className="text-[9px] font-medium text-game-text-faint uppercase tracking-wider">
          {isFeverMode ? `${Math.ceil(feverTimeLeft)}s` : `${comboCount}/${COMBO_MAX}`}
        </span>
      </div>
    </div>
  );
}
