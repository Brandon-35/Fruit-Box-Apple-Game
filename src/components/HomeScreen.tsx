import { motion } from 'motion/react';
import { Info, Trophy, Timer, Zap, ChevronRight, Settings, Bomb, Clock } from 'lucide-react';
import type { DifficultyKey, GameModeKey, FruitConfig } from '../types';
import { DIFFICULTIES, GAME_MODES, FRUITS } from '../data/gameData';

interface HomeScreenProps {
  difficulty: DifficultyKey;
  gameMode: GameModeKey;
  selectedFruit: FruitConfig;
  highScore: number;
  onSetDifficulty: (key: DifficultyKey) => void;
  onSetGameMode: (key: GameModeKey) => void;
  onSetFruit: (fruit: FruitConfig) => void;
  onStartGame: () => void;
  playSound: (url: string) => void;
}

export function HomeScreen({
  difficulty, gameMode, selectedFruit, highScore,
  onSetDifficulty, onSetGameMode, onSetFruit, onStartGame, playSound,
}: HomeScreenProps) {
  const config = DIFFICULTIES[difficulty];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D3436] font-sans flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)] border border-[#F1F3F5] overflow-hidden"
      >
        <div className="p-12 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className={`w-24 h-24 ${selectedFruit.color} rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${selectedFruit.shadow}`}
          >
            <span className="text-5xl">{selectedFruit.icon}</span>
          </motion.div>

          <h1 className="text-5xl font-black tracking-tighter text-[#1A1A1A] mb-4">Fruit Box</h1>
          <p className="text-[#718096] mb-12 font-bold text-lg leading-relaxed">
            Kéo để chọn một hình chữ nhật sao cho tổng bằng <span className="text-red-500 font-black">10</span>.
          </p>

          {/* Game Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
            <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#F1F3F5]">
              <div className="flex items-center gap-3 mb-3 text-[#1A1A1A]">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Info size={18} strokeWidth={3} /></div>
                <h3 className="font-black uppercase tracking-widest text-[10px]">Mục tiêu</h3>
              </div>
              <p className="text-xs text-[#718096] leading-relaxed font-bold">
                Kéo để chọn một hình chữ nhật. Nếu tổng bằng đúng 10, các quả sẽ biến mất! Duy trì Combo để nhận thêm năng lượng.
              </p>
            </div>
            <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#F1F3F5]">
              <div className="flex items-center gap-3 mb-3 text-[#1A1A1A]">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600"><Trophy size={18} strokeWidth={3} /></div>
                <h3 className="font-black uppercase tracking-widest text-[10px]">Tính điểm</h3>
              </div>
              <p className="text-xs text-[#718096] leading-relaxed font-bold">
                1 điểm cho mỗi quả. Xóa các vùng lớn hơn để tăng điểm nhanh hơn.
              </p>
            </div>
            <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#F1F3F5]">
              <div className="flex items-center gap-3 mb-3 text-[#1A1A1A]">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600"><Zap size={18} strokeWidth={3} /></div>
                <h3 className="font-black uppercase tracking-widest text-[10px]">Chế độ Fever</h3>
              </div>
              <p className="text-xs text-[#718096] leading-relaxed font-bold">
                Thực hiện 5 nước đi nhanh để kích hoạt Chế độ Fever! Ghi điểm x3 trong 8 giây.
              </p>
            </div>
            <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#F1F3F5]">
              <div className="flex items-center gap-3 mb-3 text-[#1A1A1A]">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Settings size={18} strokeWidth={3} /></div>
                <h3 className="font-black uppercase tracking-widest text-[10px]">Vật phẩm hỗ trợ</h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-white"><Bomb size={10} /></div>
                  <p className="text-[10px] text-[#718096] font-bold">Bom: Xóa vùng 3x3</p>
                </div>
                {gameMode !== 'ENDLESS' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Clock size={10} /></div>
                    <p className="text-[10px] text-[#718096] font-bold">Đồng hồ: Thêm 5 giây</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white font-black text-[8px]">X</div>
                  <p className="text-[10px] text-[#718096] font-bold">Wildcard: Tổng bằng 10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Mode Selection */}
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.3em] mb-4">Chọn Chế Độ</h3>
            <div className="flex justify-center gap-3">
              {(Object.keys(GAME_MODES) as GameModeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onSetGameMode(key)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                    gameMode === key
                      ? 'bg-[#1A1A1A] text-white shadow-lg scale-105'
                      : 'text-[#A0AEC0] hover:text-[#1A1A1A] hover:bg-[#F8F9FA] border border-[#F1F3F5]'
                  }`}
                >
                  {GAME_MODES[key].label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#A0AEC0] mt-3 font-bold italic">
              {GAME_MODES[gameMode].description}
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.3em] mb-4">Chọn Độ Khó</h3>
            <div className="flex justify-center gap-3">
              {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onSetDifficulty(key)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                    difficulty === key
                      ? 'bg-[#1A1A1A] text-white shadow-lg scale-105'
                      : 'text-[#A0AEC0] hover:text-[#1A1A1A] hover:bg-[#F8F9FA] border border-[#F1F3F5]'
                  }`}
                >
                  {DIFFICULTIES[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Selection */}
          <div className="mb-12">
            <h3 className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.3em] mb-4">Chọn Loại Quả</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {FRUITS.map((fruit) => (
                <button
                  key={fruit.id}
                  onClick={() => onSetFruit(fruit)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 cursor-pointer ${
                    selectedFruit.id === fruit.id
                      ? `${fruit.color} shadow-lg ${fruit.shadow} scale-110`
                      : 'bg-[#F8F9FA] hover:bg-white hover:shadow-md border border-[#F1F3F5]'
                  }`}
                >
                  {fruit.icon}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onStartGame}
            className={`group relative w-full px-10 py-6 ${selectedFruit.color} text-white rounded-[2rem] font-black text-2xl shadow-2xl ${selectedFruit.shadow} hover:brightness-110 transition-all hover:-translate-y-2 active:translate-y-0 cursor-pointer`}
          >
            <span className="flex items-center justify-center gap-3">
              Chơi Ngay <ChevronRight size={28} strokeWidth={4} />
            </span>
          </button>
        </div>

        <div className="bg-[#F8F9FA] py-6 px-12 flex justify-between items-center border-t border-[#F1F3F5]">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Kỷ lục: {highScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-blue-500" />
            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
              {gameMode === 'TIME_ATTACK' ? `Giới hạn ${config.time}s` : 'Không giới hạn thời gian'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
