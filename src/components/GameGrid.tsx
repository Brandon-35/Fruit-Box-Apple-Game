import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bomb, Clock, Sparkles, Trophy, Zap } from 'lucide-react';
import type { AppleData, Selection, FruitConfig, DifficultyConfig } from '../types';
import { CONSTANTS } from '../data/gameData';

const { TARGET_SUM } = CONSTANTS;

interface GameGridProps {
  grid: AppleData[][];
  config: DifficultyConfig;
  selectedFruit: FruitConfig;
  selection: Selection;
  isDragging: boolean;
  currentSelectionSum: number;
  isFeverMode: boolean;
  isShaking: boolean;
  gameState: string;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function GameGrid({
  grid, config, selectedFruit, selection, isDragging, currentSelectionSum,
  isFeverMode, isShaking, gameState, gridRef,
  onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
  onTouchStart, onTouchMove, onTouchEnd,
}: GameGridProps) {
  return (
    <div className="relative">
      {/* Fever Mode Background Glow */}
      <AnimatePresence>
        {isFeverMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-8 bg-orange-400/10 blur-[80px] rounded-full z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Grid Container */}
      <motion.div
        ref={gridRef}
        animate={isShaking ? {
          x: [-2, 2, -2, 2, 0],
          transition: { duration: 0.4 }
        } : {}}
        className={`relative bg-game-surface p-1.5 md:p-3 rounded-card-lg shadow-[0_8px_32px_-8px_rgba(78,69,229,0.1)] border-2 border-game-border transition-all duration-500 ${gameState !== 'playing' ? 'blur-md grayscale-[0.3]' : ''} ${isFeverMode ? 'border-orange-200 shadow-[0_8px_40px_-8px_rgba(249,115,22,0.2)]' : ''} cursor-crosshair touch-none select-none overflow-hidden z-10`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            width: 'min(96vw, 1100px)',
            aspectRatio: `${config.cols}/${config.rows}`,
            gap: '2px'
          }}
        >
          {grid.map((row, r) =>
            row.map((apple, c) => {
              const isSelected = selection.start && selection.end &&
                r >= Math.min(selection.start.r, selection.end.r) &&
                r <= Math.max(selection.start.r, selection.end.r) &&
                c >= Math.min(selection.start.c, selection.end.c) &&
                c <= Math.max(selection.start.c, selection.end.c);

              return (
                <AppleCell
                  key={apple.id}
                  apple={apple}
                  isSelected={!!isSelected}
                  isFeverMode={isFeverMode}
                  selectedFruit={selectedFruit}
                />
              );
            })
          )}
        </div>

        {/* Selection Overlay */}
        {isDragging && selection.start && selection.end && (
          <>
            <div
              className={`absolute rounded-xl pointer-events-none z-20 transition-colors duration-150 border-2 ${
                currentSelectionSum === TARGET_SUM ? 'border-emerald-400 bg-emerald-400/8' :
                currentSelectionSum > TARGET_SUM ? 'border-red-400 bg-red-400/8' :
                'border-indigo-400 bg-indigo-400/8'
              }`}
              style={{
                left: `${Math.min(selection.start.c, selection.end.c) * (100 / config.cols)}%`,
                top: `${Math.min(selection.start.r, selection.end.r) * (100 / config.rows)}%`,
                width: `${(Math.abs(selection.start.c - selection.end.c) + 1) * (100 / config.cols)}%`,
                height: `${(Math.abs(selection.start.r - selection.end.r) + 1) * (100 / config.rows)}%`,
              }}
            />
            {/* Sum Indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute pointer-events-none z-30 px-3.5 py-1.5 rounded-full text-sm font-bold text-white shadow-lg transition-colors duration-200 flex items-center gap-1.5 ${
                currentSelectionSum === 10 ? 'bg-emerald-500' : currentSelectionSum > 10 ? 'bg-red-500' : 'bg-game-primary'
              }`}
              style={{
                left: `${Math.max(selection.start.c, selection.end.c) * (100 / config.cols)}%`,
                top: `${Math.min(selection.start.r, selection.end.r) * (100 / config.rows)}%`,
                transform: 'translate(-50%, -140%)'
              }}
            >
              {currentSelectionSum === 10 && <Zap size={13} fill="currentColor" />}
              Tổng: {currentSelectionSum}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

interface AppleCellProps {
  apple: AppleData;
  isSelected: boolean;
  isFeverMode: boolean;
  selectedFruit: FruitConfig;
}

const AppleCell: React.FC<AppleCellProps> = ({ apple, isSelected, isFeverMode, selectedFruit }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: apple.isCleared ? 0 : (isSelected ? 1.15 : 1),
        opacity: apple.isCleared ? 0 : 1,
        rotate: apple.isCleared ? 45 : (isSelected && apple.type === 'clock' ? 360 : 0),
        x: (isFeverMode && !apple.isCleared) ? [0, -1, 1, -1, 1, 0] : 0,
        y: (isFeverMode && !apple.isCleared) ? [0, 1, -1, 1, -1, 0] : (apple.type === 'golden' && !apple.isCleared && !isSelected ? [0, -4, 0] : 0),
      }}
      whileHover={!apple.isCleared ? { scale: 1.08 } : {}}
      transition={{
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 15,
          repeat: (apple.type !== 'normal' && !apple.isCleared && !isSelected) ? Infinity : 0,
          duration: 2
        },
        rotate: {
          repeat: (isSelected && apple.type === 'clock') ? Infinity : 0,
          duration: 1,
          ease: "linear"
        },
        y: {
          repeat: (apple.type === 'golden' && !apple.isCleared && !isSelected) ? Infinity : 0,
          duration: 2,
          ease: "easeInOut"
        },
        opacity: { duration: 0.2 }
      }}
      className={`relative flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer ${
        apple.isCleared ? 'pointer-events-none' : 'opacity-100'
      } ${isSelected ? `${selectedFruit.lightColor} z-10` : 'bg-transparent'}`}
    >
      {!apple.isCleared && (
        <div className="relative w-full h-full flex items-center justify-center group">
          {/* Special Apple Glows */}
          {apple.type !== 'normal' && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                repeat: Infinity,
                duration: apple.type === 'bomb' ? 1 : 2,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 blur-md rounded-full ${
                apple.type === 'bomb' ? 'bg-red-500' :
                apple.type === 'clock' ? 'bg-blue-400' :
                apple.type === 'wildcard' ? 'bg-purple-400' :
                'bg-yellow-400'
              }`}
            />
          )}

          {/* Fruit Background */}
          <div className={`absolute inset-1 rounded-full transition-all duration-300 ${
            isSelected
              ? `${
                  apple.type === 'bomb' ? 'bg-gradient-to-br from-gray-800 to-black' :
                  apple.type === 'clock' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                  apple.type === 'wildcard' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                  apple.type === 'golden' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  selectedFruit.color
                } scale-110 shadow-lg ${selectedFruit.shadow}`
              : `${
                  apple.type === 'bomb' ? 'bg-gradient-to-br from-gray-700 to-gray-900' :
                  apple.type === 'clock' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                  apple.type === 'wildcard' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                  apple.type === 'golden' ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' :
                  selectedFruit.lightColor
                } group-hover:brightness-95`
          }`} />

          {/* Shine Effect for Special Apples */}
          {apple.type !== 'normal' && (
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: Math.random() * 2 }}
                className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12"
              />
            </div>
          )}

          <span className={`relative z-10 font-mono font-extrabold text-lg md:text-2xl transition-all duration-300 ${isSelected ? 'text-white scale-125' : apple.type !== 'normal' ? 'text-white' : 'text-game-text/70'}`}>
            {apple.type === 'bomb' ? (
              <motion.div
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: isSelected ? Infinity : 0, duration: 0.5 }}
              >
                <Bomb size={22} strokeWidth={3} className="drop-shadow-md" />
              </motion.div>
            ) :
             apple.type === 'clock' ? (
              <motion.div
                animate={isSelected ? { rotate: 360 } : {}}
                transition={{ repeat: isSelected ? Infinity : 0, duration: 2, ease: "linear" }}
              >
                <Clock size={22} strokeWidth={3} className="drop-shadow-md" />
              </motion.div>
             ) :
             apple.type === 'wildcard' ? (
              <motion.div
                animate={isSelected ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ repeat: isSelected ? Infinity : 0, duration: 0.6 }}
              >
                <Sparkles size={22} strokeWidth={3} className="drop-shadow-md" />
              </motion.div>
             ) :
             apple.type === 'golden' ? (
              <motion.div
                animate={isSelected ? { y: [0, -5, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: isSelected ? Infinity : 0, duration: 1 }}
              >
                <Trophy size={22} strokeWidth={3} className="drop-shadow-md" />
              </motion.div>
             ) :
             apple.value}
          </span>

          {/* Fruit Icon Decor */}
          <div className={`absolute top-1 right-1/2 translate-x-1/2 -translate-y-1/2 text-[10px] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-20'}`}>
            {apple.type === 'normal' ? selectedFruit.icon : null}
          </div>
        </div>
      )}
    </motion.div>
  );
};
