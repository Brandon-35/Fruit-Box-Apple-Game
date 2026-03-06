import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import type { Mission } from '../types';

interface MissionPanelProps {
  currentMission: Mission | null;
  missionChainProgress: number;
}

export function MissionPanel({ currentMission, missionChainProgress }: MissionPanelProps) {
  return (
    <AnimatePresence>
      {currentMission && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="w-full max-w-[1100px] mb-6 bg-white rounded-3xl p-4 border border-blue-100 shadow-sm flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              currentMission.rewardType === 'POINTS' ? 'bg-yellow-500' :
              currentMission.rewardType === 'FREEZE' ? 'bg-blue-500' : 'bg-orange-500'
            }`}>
              {currentMission.type === 'QUANTITY' ? <CheckCircle2 size={24} /> :
               currentMission.type === 'COUNT' ? <RotateCcw size={24} /> : <Zap size={24} />}
            </div>
            <div>
              <h4 className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest mb-1">Nhiệm vụ hiện tại</h4>
              <p className="text-sm font-black text-[#1A1A1A]">{currentMission.description}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest">Tiến độ</span>
              <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest">
                {currentMission.type === 'CHAIN' ? missionChainProgress : currentMission.currentProgress}/{currentMission.targetCount}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                animate={{ width: `${((currentMission.type === 'CHAIN' ? missionChainProgress : currentMission.currentProgress) / currentMission.targetCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest mb-1">Hết hạn sau</span>
            <div className="flex items-center gap-2 text-red-500 font-mono font-black">
              <Timer size={14} />
              {Math.ceil(currentMission.timeLeft)}s
            </div>
          </div>

          <div className="h-10 w-[1px] bg-gray-100" />

          <div className="text-right">
            <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest mb-1">Phần thưởng</span>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">
              {currentMission.rewardType === 'POINTS' ? '+500 Điểm' :
               currentMission.rewardType === 'FREEZE' ? 'Đóng băng 3s' : '3 Táo Vàng'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
