import { Info, Trophy, Zap, Settings, Bomb, Clock, Play, Pause, RotateCcw, Home } from 'lucide-react';
import type { GameState, GameModeKey, FruitConfig } from '../types';
import { SOUNDS } from '../data/gameData';

interface InfoCardsProps {
  gameState: GameState;
  gameMode: GameModeKey;
  selectedFruit: FruitConfig;
  onPauseResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  playSound: (url: string) => void;
}

export function InfoCards({ gameState, gameMode, selectedFruit, onPauseResume, onRestart, onGoHome, playSound }: InfoCardsProps) {
  return (
    <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-4 text-[#1A1A1A]">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 shadow-sm"><Info size={20} strokeWidth={3} /></div>
          <h3 className="font-black uppercase tracking-widest text-xs">Mục tiêu</h3>
        </div>
        <p className="text-sm text-[#718096] leading-relaxed font-bold">
          Kéo để chọn một hình chữ nhật. Nếu tổng bằng đúng 10, các quả sẽ biến mất! Duy trì Combo để nhận thêm năng lượng.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-4 text-[#1A1A1A]">
          <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 shadow-sm"><Trophy size={20} strokeWidth={3} /></div>
          <h3 className="font-black uppercase tracking-widest text-xs">Tính điểm</h3>
        </div>
        <p className="text-sm text-[#718096] leading-relaxed font-bold">
          1 điểm cho mỗi quả. Xóa các vùng lớn hơn để tăng điểm nhanh hơn.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-4 text-[#1A1A1A]">
          <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shadow-sm"><Zap size={20} strokeWidth={3} /></div>
          <h3 className="font-black uppercase tracking-widest text-xs">Chế độ Fever</h3>
        </div>
        <p className="text-sm text-[#718096] leading-relaxed font-bold">
          Thực hiện 5 nước đi nhanh để kích hoạt Chế độ Fever! Ghi điểm x3 trong 8 giây.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="flex items-center gap-4 mb-4 text-[#1A1A1A]">
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-500 shadow-sm"><Settings size={20} strokeWidth={3} /></div>
          <h3 className="font-black uppercase tracking-widest text-xs">Vật phẩm hỗ trợ</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white"><Bomb size={12} /></div>
            <p className="text-xs text-[#718096] font-bold">Bom: Xóa vùng 3x3</p>
          </div>
          {gameMode !== 'ENDLESS' && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><Clock size={12} /></div>
              <p className="text-xs text-[#718096] font-bold">Đồng hồ: Thêm 5 giây</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-black text-[10px]">X</div>
            <p className="text-xs text-[#718096] font-bold">Wildcard: Tổng bằng 10</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm flex flex-col justify-center gap-4 md:col-span-4 lg:col-span-1">
        <button
          onClick={() => {
            onPauseResume();
            playSound(SOUNDS.CLICK);
          }}
          disabled={gameState === 'home' || gameState === 'gameover'}
          className="w-full py-4 px-6 rounded-2xl bg-[#1A1A1A] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-10 disabled:cursor-not-allowed cursor-pointer shadow-lg"
        >
          {gameState === 'paused' ? <><Play size={16} fill="currentColor" /> Tiếp tục</> : <><Pause size={16} fill="currentColor" /> Tạm dừng</>}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRestart}
            className="py-3 px-4 rounded-xl bg-[#F8F9FA] text-[#A0AEC0] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border border-[#F1F3F5]"
          >
            <RotateCcw size={14} strokeWidth={3} /> Đặt lại
          </button>
          <button
            onClick={onGoHome}
            className="py-3 px-4 rounded-xl bg-[#F8F9FA] text-[#A0AEC0] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer border border-[#F1F3F5]"
          >
            <Home size={14} strokeWidth={3} /> Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
