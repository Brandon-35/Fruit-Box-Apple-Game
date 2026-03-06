import { m, AnimatePresence } from 'motion/react';
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
          <m.div
            key={lastAction.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-card shadow-lg border backdrop-blur-md ${
              lastAction.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-400/50 text-white'
                : 'bg-red-500/90 border-red-400/50 text-white'
            }`}
          >
            {lastAction.type === 'success' ? (
              <>
                <div className="bg-white/20 p-1 rounded-lg">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Tuyệt vời!</span>
                  <span className="text-[10px] font-medium opacity-80">Tính toán rất tốt</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/20 p-1 rounded-lg">
                  <XCircle size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Thử lại</span>
                  <span className="text-[10px] font-medium opacity-80">Tổng phải bằng đúng 10</span>
                </div>
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
