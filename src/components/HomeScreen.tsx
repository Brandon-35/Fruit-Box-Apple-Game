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
    <div className="min-h-screen bg-game-bg font-body text-game-text flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full bg-game-surface rounded-card-lg shadow-[0_8px_40px_-12px_rgba(78,69,229,0.15)] border border-game-border overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className={`w-20 h-20 ${selectedFruit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${selectedFruit.shadow}`}
          >
            <span className="text-4xl">{selectedFruit.icon}</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-game-text mb-3">Fruit Box</h1>
          <p className="text-game-text-muted mb-10 font-medium text-base leading-relaxed max-w-md mx-auto">
            Kéo để chọn một hình chữ nhật sao cho tổng bằng <span className="text-game-primary font-bold">10</span>.
          </p>

          {/* Game Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 text-left">
            <div className="bg-game-surface-alt p-5 rounded-card border border-game-border hover:border-indigo-200 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-indigo-100 rounded-xl text-game-primary"><Info size={16} strokeWidth={2.5} /></div>
                <h3 className="font-heading font-bold text-sm text-game-text">Mục tiêu</h3>
              </div>
              <p className="text-xs text-game-text-muted leading-relaxed">
                Kéo để chọn một hình chữ nhật. Nếu tổng bằng đúng 10, các quả sẽ biến mất! Duy trì Combo để nhận thêm năng lượng.
              </p>
            </div>
            <div className="bg-game-surface-alt p-5 rounded-card border border-game-border hover:border-yellow-200 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600"><Trophy size={16} strokeWidth={2.5} /></div>
                <h3 className="font-heading font-bold text-sm text-game-text">Tính điểm</h3>
              </div>
              <p className="text-xs text-game-text-muted leading-relaxed">
                1 điểm cho mỗi quả. Xóa các vùng lớn hơn để tăng điểm nhanh hơn.
              </p>
            </div>
            <div className="bg-game-surface-alt p-5 rounded-card border border-game-border hover:border-orange-200 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-orange-100 rounded-xl text-game-accent"><Zap size={16} strokeWidth={2.5} /></div>
                <h3 className="font-heading font-bold text-sm text-game-text">Chế độ Fever</h3>
              </div>
              <p className="text-xs text-game-text-muted leading-relaxed">
                Thực hiện 5 nước đi nhanh để kích hoạt Chế độ Fever! Ghi điểm x3 trong 8 giây.
              </p>
            </div>
            <div className="bg-game-surface-alt p-5 rounded-card border border-game-border hover:border-purple-200 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Settings size={16} strokeWidth={2.5} /></div>
                <h3 className="font-heading font-bold text-sm text-game-text">Vật phẩm hỗ trợ</h3>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white"><Bomb size={10} /></div>
                  <p className="text-[11px] text-game-text-muted font-medium">Bom: Xóa vùng 3x3</p>
                </div>
                {gameMode !== 'ENDLESS' && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Clock size={10} /></div>
                    <p className="text-[11px] text-game-text-muted font-medium">Đồng hồ: Thêm 5 giây</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-[8px]">X</div>
                  <p className="text-[11px] text-game-text-muted font-medium">Wildcard: Tổng bằng 10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Mode Selection */}
          <div className="mb-8">
            <h3 className="text-xs font-heading font-bold text-game-text-faint uppercase tracking-[0.2em] mb-3">Chọn Chế Độ</h3>
            <div className="flex justify-center gap-2">
              {(Object.keys(GAME_MODES) as GameModeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onSetGameMode(key)}
                  className={`px-5 py-2.5 rounded-button text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    gameMode === key
                      ? 'bg-game-primary text-white shadow-md shadow-indigo-200'
                      : 'text-game-text-muted hover:text-game-text hover:bg-game-surface-alt border border-game-border'
                  }`}
                >
                  {GAME_MODES[key].label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-game-text-faint mt-2 font-medium italic">
              {GAME_MODES[gameMode].description}
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <h3 className="text-xs font-heading font-bold text-game-text-faint uppercase tracking-[0.2em] mb-3">Chọn Độ Khó</h3>
            <div className="flex justify-center gap-2">
              {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onSetDifficulty(key)}
                  className={`px-5 py-2.5 rounded-button text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    difficulty === key
                      ? 'bg-game-primary text-white shadow-md shadow-indigo-200'
                      : 'text-game-text-muted hover:text-game-text hover:bg-game-surface-alt border border-game-border'
                  }`}
                >
                  {DIFFICULTIES[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* Fruit Selection */}
          <div className="mb-10">
            <h3 className="text-xs font-heading font-bold text-game-text-faint uppercase tracking-[0.2em] mb-3">Chọn Loại Quả</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {FRUITS.map((fruit) => (
                <button
                  key={fruit.id}
                  onClick={() => onSetFruit(fruit)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 cursor-pointer ${
                    selectedFruit.id === fruit.id
                      ? `${fruit.color} shadow-md ${fruit.shadow} scale-110 ring-2 ring-white`
                      : 'bg-game-surface-alt hover:bg-white hover:shadow-sm border border-game-border'
                  }`}
                >
                  {fruit.icon}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={onStartGame}
            whileHover={{ y: -3 }}
            whileTap={{ y: 0, scale: 0.98 }}
            className={`group w-full px-8 py-5 ${selectedFruit.color} text-white rounded-card font-heading font-bold text-xl shadow-lg ${selectedFruit.shadow} hover:brightness-110 transition-all cursor-pointer`}
          >
            <span className="flex items-center justify-center gap-2">
              Chơi Ngay <ChevronRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>

        <div className="bg-game-surface-alt py-4 px-8 md:px-12 flex justify-between items-center border-t border-game-border">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-yellow-500" />
            <span className="text-[11px] font-semibold text-game-text-faint uppercase tracking-wider">Kỷ lục: {highScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-game-primary" />
            <span className="text-[11px] font-semibold text-game-text-faint uppercase tracking-wider">
              {gameMode === 'TIME_ATTACK' ? `Giới hạn ${config.time}s` : 'Không giới hạn thời gian'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
