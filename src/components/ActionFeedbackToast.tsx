import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ActionFeedback } from '../types';

interface ActionFeedbackToastProps {
  lastAction: ActionFeedback | null;
}

export function ActionFeedbackToast({ lastAction }: ActionFeedbackToastProps) {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {lastAction && (
          <motion.div
            key={lastAction.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border backdrop-blur-md ${
              lastAction.type === 'success'
                ? 'bg-green-500/90 border-green-400 text-white'
                : 'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            {lastAction.type === 'success' ? (
              <>
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <CheckCircle2 size={20} strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm uppercase tracking-wider">Tuyệt vời!</span>
                  <span className="text-[10px] font-bold opacity-80">Tính toán rất tốt</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <XCircle size={20} strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm uppercase tracking-wider">Thử lại</span>
                  <span className="text-[10px] font-bold opacity-80">Tổng phải bằng đúng 10</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
