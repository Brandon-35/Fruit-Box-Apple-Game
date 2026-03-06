import { m, AnimatePresence } from 'motion/react';
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
        <m.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="w-full max-w-[1100px] mb-5 bg-game-surface rounded-card p-4 border border-game-border shadow-sm flex flex-wrap items-center justify-between gap-3 md:gap-6"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              currentMission.rewardType === 'POINTS' ? 'bg-yellow-500' :
              currentMission.rewardType === 'FREEZE' ? 'bg-blue-500' : 'bg-game-accent'
            }`}>
              {currentMission.type === 'QUANTITY' ? <CheckCircle2 size={20} /> :
               currentMission.type === 'COUNT' ? <RotateCcw size={20} /> : <Zap size={20} />}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-game-text-muted uppercase tracking-wider mb-0.5">Nhiệm vụ</h4>
              <p className="text-sm font-bold text-game-text">{currentMission.description}</p>
            </div>
          </div>

          <div className="flex-1 min-w-[120px] max-w-xs">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-medium text-game-text-muted uppercase tracking-wider">Tiến độ</span>
              <span className="text-xs font-semibold text-game-text-muted uppercase tracking-wider">
                {currentMission.type === 'CHAIN' ? missionChainProgress : currentMission.currentProgress}/{currentMission.targetCount}
              </span>
            </div>
            <div className="h-2 w-full bg-game-surface-alt rounded-full overflow-hidden border border-game-border">
              <m.div
                className="h-full bg-game-primary rounded-full"
                animate={{ width: `${((currentMission.type === 'CHAIN' ? missionChainProgress : currentMission.currentProgress) / currentMission.targetCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-game-text-muted uppercase tracking-wider mb-0.5">Hết hạn</span>
            <div className="flex items-center gap-1.5 text-game-danger font-mono font-bold text-sm">
              <Timer size={12} />
              {Math.ceil(currentMission.timeLeft)}s
            </div>
          </div>

          <div className="h-8 w-px bg-game-border hidden md:block" />

          <div className="text-right hidden md:block">
            <span className="text-xs font-medium text-game-text-muted uppercase tracking-wider">Thưởng</span>
            <div className="text-xs font-bold text-game-success uppercase tracking-wider">
              {currentMission.rewardType === 'POINTS' ? '+500 Điểm' :
               currentMission.rewardType === 'FREEZE' ? 'Đóng băng 3s' : '3 Táo Vàng'}
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
