import { Info, Trophy, Zap, Settings, Bomb, Clock } from 'lucide-react';
import type { GameModeKey } from '../types';

interface InfoCardsProps {
  gameMode: GameModeKey;
}

export function InfoCards({ gameMode }: InfoCardsProps) {
  return (
    <div className="mt-12 w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-game-surface p-6 rounded-card border border-game-border hover:border-indigo-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-game-primary"><Info size={18} strokeWidth={2.5} /></div>
          <h3 className="font-heading font-bold text-sm text-game-text">Mục tiêu</h3>
        </div>
        <p className="text-sm text-game-text-muted leading-relaxed">
          Kéo để chọn một hình chữ nhật. Nếu tổng bằng đúng 10, các quả sẽ biến mất! Duy trì Combo để nhận thêm năng lượng.
        </p>
      </div>

      <div className="bg-game-surface p-6 rounded-card border border-game-border hover:border-yellow-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600"><Trophy size={18} strokeWidth={2.5} /></div>
          <h3 className="font-heading font-bold text-sm text-game-text">Tính điểm</h3>
        </div>
        <p className="text-sm text-game-text-muted leading-relaxed">
          1 điểm cho mỗi quả. Xóa các vùng lớn hơn để tăng điểm nhanh hơn.
        </p>
      </div>

      <div className="bg-game-surface p-6 rounded-card border border-game-border hover:border-orange-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-orange-50 rounded-xl text-game-accent"><Zap size={18} strokeWidth={2.5} /></div>
          <h3 className="font-heading font-bold text-sm text-game-text">Chế độ Fever</h3>
        </div>
        <p className="text-sm text-game-text-muted leading-relaxed">
          Thực hiện 5 nước đi nhanh để kích hoạt Chế độ Fever! Ghi điểm x3 trong 8 giây.
        </p>
      </div>

      <div className="bg-game-surface p-6 rounded-card border border-game-border hover:border-purple-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Settings size={18} strokeWidth={2.5} /></div>
          <h3 className="font-heading font-bold text-sm text-game-text">Vật phẩm</h3>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white"><Bomb size={12} /></div>
            <p className="text-xs text-game-text-muted">Bom: Xóa vùng 3x3</p>
          </div>
          {gameMode !== 'ENDLESS' && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><Clock size={12} /></div>
              <p className="text-xs text-game-text-muted">Đồng hồ: +5 giây</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">X</div>
            <p className="text-xs text-game-text-muted">Wildcard: =10</p>
          </div>
        </div>
      </div>
    </div>
  );
}
