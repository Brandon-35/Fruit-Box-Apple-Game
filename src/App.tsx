/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, RotateCcw, Play, Pause, Info, CheckCircle2, XCircle, Zap, Home, ChevronRight, Settings, Volume2, VolumeX, Bomb, Clock, Sparkles } from 'lucide-react';

// Difficulty Config
const DIFFICULTIES = {
  EASY: { label: 'Dễ', rows: 8, cols: 12, time: 180, name: 'EASY' },
  MEDIUM: { label: 'Trung bình', rows: 10, cols: 17, time: 120, name: 'MEDIUM' },
  HARD: { label: 'Khó', rows: 12, cols: 22, time: 90, name: 'HARD' },
};

type DifficultyKey = keyof typeof DIFFICULTIES;

// Game Modes
const GAME_MODES = {
  TIME_ATTACK: { id: 'TIME_ATTACK', label: 'Tính giờ', description: 'Ghi càng nhiều điểm càng tốt trong thời gian cố định.' },
  ENDLESS: { id: 'ENDLESS', label: 'Vô tận', description: 'Không giới hạn thời gian. Tập trung vào việc xóa bảng.' },
};

type GameModeKey = keyof typeof GAME_MODES;

// Fruit Config
const FRUITS = [
  { id: 'apple', label: 'Táo', icon: '🍎', color: 'bg-red-500', lightColor: 'bg-red-50', textColor: 'text-red-500', shadow: 'shadow-red-200' },
  { id: 'orange', label: 'Cam', icon: '🍊', color: 'bg-orange-500', lightColor: 'bg-orange-50', textColor: 'text-orange-500', shadow: 'shadow-orange-200' },
  { id: 'grape', label: 'Nho', icon: '🍇', color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-500', shadow: 'shadow-purple-200' },
  { id: 'strawberry', label: 'Dâu tây', icon: '🍓', color: 'bg-rose-500', lightColor: 'bg-rose-50', textColor: 'text-rose-500', shadow: 'shadow-rose-200' },
  { id: 'pear', label: 'Lê', icon: '🍐', color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-500', shadow: 'shadow-emerald-200' },
  { id: 'peach', label: 'Đào', icon: '🍑', color: 'bg-pink-400', lightColor: 'bg-pink-50', textColor: 'text-pink-400', shadow: 'shadow-pink-200' },
];

const TARGET_SUM = 10;
const COMBO_WINDOW = 2000; // 2 seconds to maintain combo
const COMBO_MAX = 5;       // 5 successful moves to trigger Fever
const FEVER_DURATION = 8;  // 8 seconds of Fever Mode
const MISSION_INTERVAL = 30000; // New mission every 30 seconds if none active
const MISSION_REWARD_POINTS = 500;
const MISSION_FREEZE_DURATION = 3;

type AppleType = 'normal' | 'bomb' | 'clock' | 'wildcard' | 'golden';

type MissionType = 'QUANTITY' | 'COUNT' | 'CHAIN';
type RewardType = 'POINTS' | 'FREEZE' | 'GOLDEN';

interface Mission {
  id: string;
  type: MissionType;
  description: string;
  targetValue?: number;
  targetCount: number;
  currentProgress: number;
  timeLeft: number;
  totalTime: number;
  rewardType: RewardType;
}

interface AppleData {
  id: string;
  value: number;
  isCleared: boolean;
  type: AppleType;
}

interface Selection {
  start: { r: number; c: number } | null;
  end: { r: number; c: number } | null;
}

// Sound URLs (Public CDN)
const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Chime
  FAIL: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',    // Buzz
  GAMEOVER: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Game over fanfare
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',   // Soft click
  FEVER_START: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Magic/Sparkle
  BOMB: 'https://assets.mixkit.co/active_storage/sfx/1440/1440-preview.mp3', // Explosion
  CLOCK: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3', // Level up/Time
};

export default function App() {
  const [difficulty, setDifficulty] = useState<DifficultyKey>('MEDIUM');
  const [gameMode, setGameMode] = useState<GameModeKey>('TIME_ATTACK');
  const [selectedFruit, setSelectedFruit] = useState(FRUITS[0]);
  const [grid, setGrid] = useState<AppleData[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTIES.MEDIUM.time);
  const [gameState, setGameState] = useState<'home' | 'playing' | 'paused' | 'gameover'>('home');
  const [selection, setSelection] = useState<Selection>({ start: null, end: null });
  const [isDragging, setIsDragging] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [lastAction, setLastAction] = useState<{ type: 'success' | 'fail'; pos: { x: number; y: number }; id: number } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Combo & Fever State
  const [comboCount, setComboCount] = useState(0);
  const [lastSuccessTime, setLastSuccessTime] = useState(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  const [feverTimeLeft, setFeverTimeLeft] = useState(0);

  // Mission State
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [missionChainProgress, setMissionChainProgress] = useState(0);
  const [timeFrozenLeft, setTimeFrozenLeft] = useState(0);
  const [lastMissionTime, setLastMissionTime] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const config = DIFFICULTIES[difficulty];

  const playSound = useCallback((soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Ignore errors if browser blocks autoplay
  }, [isMuted]);

  // Mission Rewards
  const applyMissionReward = useCallback((rewardType: RewardType) => {
    if (rewardType === 'POINTS') {
      setScore(prev => prev + MISSION_REWARD_POINTS);
    } else if (rewardType === 'FREEZE') {
      setTimeFrozenLeft(prev => prev + MISSION_FREEZE_DURATION);
    } else if (rewardType === 'GOLDEN') {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => row.map(apple => ({ ...apple })));
        const available: { r: number; c: number }[] = [];
        for (let r = 0; r < config.rows; r++) {
          for (let c = 0; c < config.cols; c++) {
            if (!newGrid[r][c].isCleared && newGrid[r][c].type === 'normal') {
              available.push({ r, c });
            }
          }
        }
        
        for (let i = 0; i < 3 && available.length > 0; i++) {
          const idx = Math.floor(Math.random() * available.length);
          const { r, c } = available.splice(idx, 1)[0];
          newGrid[r][c].type = 'golden';
        }
        return newGrid;
      });
    }
    playSound(SOUNDS.FEVER_START);
  }, [config.rows, config.cols, playSound]);

  const generateMission = useCallback(() => {
    const types: MissionType[] = ['QUANTITY', 'COUNT', 'CHAIN'];
    const rewards: RewardType[] = gameMode === 'ENDLESS' ? ['POINTS', 'GOLDEN'] : ['POINTS', 'FREEZE', 'GOLDEN'];
    const type = types[Math.floor(Math.random() * types.length)];
    const rewardType = rewards[Math.floor(Math.random() * rewards.length)];
    
    let description = '';
    let targetValue: number | undefined;
    let targetCount = 0;

    if (type === 'QUANTITY') {
      targetValue = Math.floor(Math.random() * 9) + 1;
      targetCount = 5;
      description = `Xóa ${targetCount} quả ${selectedFruit.label.toLowerCase()} số ${targetValue}`;
    } else if (type === 'COUNT') {
      targetCount = 6;
      description = `Quét một vùng chứa đúng ${targetCount} quả (tổng bằng 10)`;
    } else if (type === 'CHAIN') {
      targetCount = 3;
      description = `Thực hiện ${targetCount} lần quét liên tiếp chỉ dùng 2 quả mỗi lần`;
    }

    const newMission: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      description,
      targetValue,
      targetCount,
      currentProgress: 0,
      timeLeft: 20,
      totalTime: 20,
      rewardType
    };

    setCurrentMission(newMission);
    setMissionChainProgress(0);
    setLastMissionTime(Date.now());
  }, [selectedFruit.label]);

  const checkMission = useCallback((selectedApples: AppleData[]) => {
    if (!currentMission) return;

    let success = false;
    let progressIncrement = 0;

    if (currentMission.type === 'QUANTITY') {
      const matches = selectedApples.filter(a => a.value === currentMission.targetValue).length;
      progressIncrement = matches;
    } else if (currentMission.type === 'COUNT') {
      if (selectedApples.length === currentMission.targetCount) {
        success = true;
      }
    } else if (currentMission.type === 'CHAIN') {
      if (selectedApples.length === 2) {
        progressIncrement = 1;
      } else {
        setMissionChainProgress(0); // Break chain
      }
    }

    if (success || (currentMission.type !== 'COUNT' && (currentMission.type === 'CHAIN' ? missionChainProgress + progressIncrement : currentMission.currentProgress + progressIncrement) >= currentMission.targetCount)) {
      applyMissionReward(currentMission.rewardType);
      setCurrentMission(null);
      setMissionChainProgress(0);
    } else if (progressIncrement > 0) {
      if (currentMission.type === 'CHAIN') {
        setMissionChainProgress(prev => prev + progressIncrement);
      }
      setCurrentMission(prev => prev ? { ...prev, currentProgress: prev.currentProgress + progressIncrement } : null);
    }
  }, [currentMission, missionChainProgress, applyMissionReward]);

  // Initialize grid
  const initGrid = useCallback((diffKey: DifficultyKey = difficulty, modeKey: GameModeKey = gameMode) => {
    playSound(SOUNDS.CLICK);
    const conf = DIFFICULTIES[diffKey];
    const newGrid: AppleData[][] = [];
    for (let r = 0; r < conf.rows; r++) {
      const row: AppleData[] = [];
      for (let c = 0; c < conf.cols; c++) {
        const rand = Math.random();
        let type: AppleType = 'normal';
        if (rand < 0.02) type = 'bomb';
        else if (rand < 0.04 && modeKey !== 'ENDLESS') type = 'clock';
        else if (rand < 0.06) type = 'wildcard';

        row.push({
          id: `${r}-${c}-${Math.random()}`,
          value: type === 'wildcard' ? 0 : Math.floor(Math.random() * 9) + 1,
          isCleared: false,
          type,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setScore(0);
    setTimeLeft(modeKey === 'TIME_ATTACK' ? conf.time : 0);
    setGameState('playing');
    setSelection({ start: null, end: null });
    setComboCount(0);
    setIsFeverMode(false);
    setFeverTimeLeft(0);
    setLastSuccessTime(0);
    setCurrentMission(null);
    setMissionChainProgress(0);
    setTimeFrozenLeft(0);
    setLastMissionTime(Date.now());
  }, [difficulty, gameMode, playSound]);

  // Combo Decay & Fever Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        const now = Date.now();
        
        // Combo Decay
        if (!isFeverMode && comboCount > 0) {
          if (now - lastSuccessTime > COMBO_WINDOW) {
            setComboCount(0);
          }
        }

        // Fever Countdown
        if (isFeverMode) {
          setFeverTimeLeft((prev) => {
            if (prev <= 0.1) {
              setIsFeverMode(false);
              setComboCount(0);
              return 0;
            }
            return prev - 0.1;
          });
        }

        // Mission Logic
        if (currentMission) {
          setCurrentMission(prev => {
            if (!prev) return null;
            if (prev.timeLeft <= 0.1) {
              return null;
            }
            return { ...prev, timeLeft: prev.timeLeft - 0.1 };
          });
        } else if (now - lastMissionTime > MISSION_INTERVAL) {
          generateMission();
        }

        // Time Freeze Logic
        if (timeFrozenLeft > 0) {
          setTimeFrozenLeft(prev => Math.max(0, prev - 0.1));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, isFeverMode, comboCount, lastSuccessTime, currentMission, lastMissionTime, generateMission, timeFrozenLeft]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && gameMode === 'TIME_ATTACK' && timeLeft > 0) {
      timer = setInterval(() => {
        if (timeFrozenLeft > 0) return; // Skip countdown if frozen
        
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('gameover');
            playSound(SOUNDS.GAMEOVER);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, gameMode, playSound, timeFrozenLeft]);

  // Handle high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // Selection logic
  const getCoordsFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cellWidth = rect.width / config.cols;
    const cellHeight = rect.height / config.rows;

    const c = Math.floor(x / cellWidth);
    const r = Math.floor(y / cellHeight);

    if (r >= 0 && r < config.rows && c >= 0 && c < config.cols) {
      return { r, c };
    }
    return null;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const coords = getCoordsFromEvent(e);
    if (coords) {
      setSelection({ start: coords, end: coords });
      setIsDragging(true);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || gameState !== 'playing') return;
    const coords = getCoordsFromEvent(e);
    if (coords) {
      setSelection((prev) => ({ ...prev, end: coords }));
    }
  };

  const currentSelectionSum = useMemo(() => {
    if (!selection.start || !selection.end) return 0;
    const rStart = Math.min(selection.start.r, selection.end.r);
    const rEnd = Math.max(selection.start.r, selection.end.r);
    const cStart = Math.min(selection.start.c, selection.end.c);
    const cEnd = Math.max(selection.start.c, selection.end.c);

    let sum = 0;
    let hasWildcard = false;
    for (let r = rStart; r <= rEnd; r++) {
      for (let c = cStart; c <= cEnd; c++) {
        const apple = grid[r][c];
        if (apple && !apple.isCleared) {
          if (apple.type === 'wildcard') hasWildcard = true;
          else sum += apple.value;
        }
      }
    }
    return hasWildcard && sum < TARGET_SUM ? TARGET_SUM : sum;
  }, [selection, grid]);

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selection.start || !selection.end) return;
    setIsDragging(false);

    const rStart = Math.min(selection.start.r, selection.end.r);
    const rEnd = Math.max(selection.start.r, selection.end.r);
    const cStart = Math.min(selection.start.c, selection.end.c);
    const cEnd = Math.max(selection.start.c, selection.end.c);

    let sum = 0;
    let hasWildcard = false;
    const selectedApples: { r: number; c: number }[] = [];

    for (let r = rStart; r <= rEnd; r++) {
      for (let c = cStart; c <= cEnd; c++) {
        const apple = grid[r][c];
        if (!apple.isCleared) {
          if (apple.type === 'wildcard') hasWildcard = true;
          else sum += apple.value;
          selectedApples.push({ r, c });
        }
      }
    }

    const effectiveSum = hasWildcard && sum < TARGET_SUM ? TARGET_SUM : sum;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    if (effectiveSum === TARGET_SUM && selectedApples.length > 0) {
      const newGrid = [...grid];
      let hasBomb = false;
      let hasClock = false;
      const bombPositions: { r: number; c: number }[] = [];

      selectedApples.forEach(({ r, c }) => {
        const apple = newGrid[r][c];
        if (apple.type === 'bomb') {
          hasBomb = true;
          bombPositions.push({ r, c });
        }
        if (apple.type === 'clock') hasClock = true;
        newGrid[r][c] = { ...apple, isCleared: true };
      });

      // Process Bombs (3x3 area)
      if (hasBomb) {
        playSound(SOUNDS.BOMB);
        bombPositions.forEach(pos => {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = pos.r + dr;
              const nc = pos.c + dc;
              if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                if (!newGrid[nr][nc].isCleared) {
                  newGrid[nr][nc] = { ...newGrid[nr][nc], isCleared: true };
                  // Note: Bomb-cleared apples also give points? 
                  // Usually yes in these games.
                }
              }
            }
          }
        });
      }

      if (hasClock) {
        playSound(SOUNDS.CLOCK);
        setTimeLeft(prev => prev + 5);
      }

      setGrid(newGrid);

      // Mission Check
      const selectedAppleData = selectedApples.map(({r, c}) => grid[r][c]);
      checkMission(selectedAppleData);

      // Better way: count how many were cleared in the newGrid compared to old grid
      let totalClearedThisTurn = 0;
      let goldenPoints = 0;
      for(let r=0; r<config.rows; r++) {
        for(let c=0; c<config.cols; c++) {
          if (newGrid[r][c].isCleared && !grid[r][c].isCleared) {
            totalClearedThisTurn++;
            if (grid[r][c].type === 'golden') goldenPoints += 100;
          }
        }
      }

      const points = (totalClearedThisTurn * (isFeverMode ? 3 : 1)) + goldenPoints;
      setScore((prev) => prev + points);
      setLastAction({ type: 'success', pos: { x: clientX, y: clientY }, id: Date.now() });
      if (!hasBomb && !hasClock) playSound(SOUNDS.SUCCESS);

      // Combo Logic
      const now = Date.now();
      if (!isFeverMode) {
        if (now - lastSuccessTime < COMBO_WINDOW) {
          const newCombo = comboCount + 1;
          setComboCount(newCombo);
          if (newCombo >= COMBO_MAX) {
            setIsFeverMode(true);
            setFeverTimeLeft(FEVER_DURATION);
            playSound(SOUNDS.FEVER_START);
          }
        } else {
          setComboCount(1);
        }
      }
      setLastSuccessTime(now);

      // Check if board is cleared
      const isBoardCleared = newGrid.every(row => row.every(apple => apple.isCleared));
      if (isBoardCleared) {
        setGameState('gameover');
        playSound(SOUNDS.GAMEOVER);
      }
    } else if (selectedApples.length > 0) {
      setLastAction({ type: 'fail', pos: { x: clientX, y: clientY }, id: Date.now() });
      playSound(SOUNDS.FAIL);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }

    setTimeout(() => setLastAction(null), 1000);
    setSelection({ start: null, end: null });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (gameState === 'home') {
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

            {/* Game Guide - New Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
              <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#F1F3F5]">
                <div className="flex items-center gap-3 mb-3 text-[#1A1A1A]">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Info size={18} strokeWidth={3} /></div>
                  <h3 className="font-black uppercase tracking-widest text-[10px]">Mục tiêu</h3>
                </div>
                <p className="text-xs text-[#718096] leading-relaxed font-bold">
                  Kéo để chọn một hình chữ nhật. Nếu tổng bằng đúng 10, các quả nho sẽ biến mất! Duy trì Combo để nhận thêm năng lượng.
                </p>
              </div>
              <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#F1F3F5]">
                <div className="flex items-center gap-3 mb-3 text-[#1A1A1A]">
                  <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600"><Trophy size={18} strokeWidth={3} /></div>
                  <h3 className="font-black uppercase tracking-widest text-[10px]">Tính điểm</h3>
                </div>
                <p className="text-xs text-[#718096] leading-relaxed font-bold">
                  1 điểm cho mỗi quả nho. Xóa các vùng lớn hơn để tăng điểm nhanh hơn.
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
                    onClick={() => {
                      setGameMode(key);
                      playSound(SOUNDS.CLICK);
                    }}
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
                    onClick={() => {
                      setDifficulty(key);
                      playSound(SOUNDS.CLICK);
                    }}
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
                    onClick={() => {
                      setSelectedFruit(fruit);
                      playSound(SOUNDS.CLICK);
                    }}
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
              onClick={() => initGrid(difficulty, gameMode)}
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

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D3436] font-sans selection:bg-red-100 overflow-x-hidden">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#F1F3F5] bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setGameState('home')}
            className="group flex items-center gap-3 hover:text-red-500 transition-colors cursor-pointer"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className={`w-14 h-14 ${selectedFruit.color} rounded-2xl flex items-center justify-center shadow-2xl ${selectedFruit.shadow}`}
            >
              <span className="text-white font-bold text-3xl">{selectedFruit.icon}</span>
            </motion.div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tighter text-[#1A1A1A] group-hover:text-inherit">Fruit Box</h1>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Cấp độ:</span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${difficulty === 'HARD' ? 'bg-red-50 text-red-500' : difficulty === 'MEDIUM' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                  {config.label}
                </span>
                <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Chế độ:</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
                  {GAME_MODES[gameMode].label}
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-6 md:gap-16">
          {gameMode === 'TIME_ATTACK' && (
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-1">Thời gian còn lại</span>
              <div className={`flex items-center gap-3 text-3xl font-mono font-black ${timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-[#1A1A1A]'}`}>
                <Timer size={24} strokeWidth={3} />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
          {gameMode === 'ENDLESS' && (
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-1">Trạng thái</span>
              <div className="flex items-center gap-3 text-3xl font-mono font-black text-emerald-500">
                <Play size={24} fill="currentColor" />
                VÔ TẬN
              </div>
            </div>
          )}
          <div className="flex flex-col items-center md:items-end">
            <span className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-1">Tổng điểm</span>
            <div className="flex items-center gap-3 text-3xl font-mono font-black text-[#1A1A1A]">
              <div className="relative">
                <Trophy size={24} className={isFeverMode ? "text-orange-500" : "text-yellow-500"} strokeWidth={3} />
                {isFeverMode && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white"
                  >
                    3x
                  </motion.div>
                )}
              </div>
              {score.toString().padStart(4, '0')}
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) playSound(SOUNDS.CLICK);
            }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${isMuted ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-500 shadow-sm'}`}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX size={24} strokeWidth={3} /> : <Volume2 size={24} strokeWidth={3} />}
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-[1400px] mx-auto px-4 py-10 flex flex-col items-center">
        
        {/* Mission Panel */}
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

        {/* Combo Gauge */}
        <div className="w-full max-w-[1100px] mb-8">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isFeverMode ? 'text-orange-500' : 'text-[#A0AEC0]'}`}>
                {isFeverMode ? 'Năng lượng Fever' : 'Thanh Combo'}
              </span>
              {timeFrozenLeft > 0 && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  <Clock size={10} /> ĐÓNG BĂNG {Math.ceil(timeFrozenLeft)}s
                </motion.div>
              )}
              {comboCount > 0 && !isFeverMode && (
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full"
                >
                  {comboCount} COMBO
                </motion.span>
              )}
            </div>
            {isFeverMode && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-orange-500 font-black text-xs tracking-widest uppercase flex items-center gap-2"
              >
                <Zap size={14} fill="currentColor" /> Chế độ Fever đang bật! Nhân 3 điểm
              </motion.div>
            )}
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
            <motion.div 
              className={`h-full rounded-full transition-all duration-300 ${isFeverMode ? 'bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-[length:200%_100%]' : 'bg-orange-500'}`}
              animate={isFeverMode ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
              transition={isFeverMode ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
              style={{ width: isFeverMode ? `${(feverTimeLeft / FEVER_DURATION) * 100}%` : `${(comboCount / COMBO_MAX) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest">
              {isFeverMode ? 'Thời gian Fever còn lại' : 'Tiến trình Combo'}
            </span>
            <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest">
              {isFeverMode ? `${Math.ceil(feverTimeLeft)}s` : `${comboCount}/${COMBO_MAX} để đạt Fever`}
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Fever Mode Background Glow */}
          <AnimatePresence>
            {isFeverMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-10 bg-orange-500/10 blur-[100px] rounded-full z-0 pointer-events-none"
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
            className={`relative bg-white p-1.5 md:p-3 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border-[6px] border-white transition-all duration-700 ${gameState !== 'playing' ? 'blur-md grayscale-[0.3]' : ''} ${isFeverMode ? 'border-orange-100' : ''} cursor-crosshair touch-none select-none overflow-hidden z-10`}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
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
                    <motion.div
                      key={apple.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: apple.isCleared ? 0 : (isSelected ? 1.2 : 1),
                        opacity: apple.isCleared ? 0 : 1,
                        rotate: apple.isCleared ? 45 : (isSelected && apple.type === 'clock' ? 360 : 0),
                        x: (isFeverMode && !apple.isCleared) ? [0, -1, 1, -1, 1, 0] : 0,
                        y: (isFeverMode && !apple.isCleared) ? [0, 1, -1, 1, -1, 0] : (apple.type === 'golden' && !apple.isCleared && !isSelected ? [0, -4, 0] : 0),
                      }}
                      whileHover={!apple.isCleared ? { scale: 1.1 } : {}}
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
                      className={`relative flex items-center justify-center rounded-xl transition-all duration-500 cursor-pointer ${
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
                                opacity: [0.3, 0.6, 0.3],
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

                          <span className={`relative z-10 font-mono font-black text-lg md:text-2xl transition-all duration-300 ${isSelected ? 'text-white scale-125' : apple.type !== 'normal' ? 'text-white' : 'text-[#4A4A4A]'}`}>
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
                })
              )}
            </div>

            {/* Selection Overlay - Visual Box */}
            {isDragging && selection.start && selection.end && (
              <>
                <div
                  className={`absolute rounded-2xl pointer-events-none z-20 transition-all duration-200 border-2 ${currentSelectionSum === TARGET_SUM ? 'border-green-500 bg-green-500/5' : currentSelectionSum > TARGET_SUM ? 'border-red-500 bg-red-500/5' : 'border-blue-500 bg-blue-500/5'}`}
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
                  className={`absolute pointer-events-none z-30 px-4 py-1.5 rounded-full text-sm font-black text-white shadow-2xl transition-colors duration-300 flex items-center gap-2 ${currentSelectionSum === 10 ? 'bg-green-500' : currentSelectionSum > 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{
                    left: `${Math.max(selection.start.c, selection.end.c) * (100 / config.cols)}%`,
                    top: `${Math.min(selection.start.r, selection.end.r) * (100 / config.rows)}%`,
                    transform: 'translate(-50%, -140%)'
                  }}
                >
                  {currentSelectionSum === 10 && <Zap size={14} fill="currentColor" />}
                  Tổng: {currentSelectionSum}
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Action Feedback (Success/Fail) - Redesigned as non-intrusive Toast */}
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

          {/* Game State Overlays */}
          <AnimatePresence>
            {gameState === 'gameover' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-2xl rounded-[3rem]"
              >
                <div className="text-center p-16 bg-white rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-8 border-red-50">
                  <div className="text-8xl mb-8">{selectedFruit.icon}</div>
                  <h2 className="text-6xl font-black text-[#1A1A1A] mb-4 tracking-tighter">
                    {grid.every(row => row.every(apple => apple.isCleared)) ? 'Đã Xóa Sạch!' : "Hết Giờ!"}
                  </h2>
                  <div className="flex flex-col gap-3 mb-12">
                    <p className="text-4xl font-mono font-black text-red-500">Điểm: {score}</p>
                    <p className="text-sm font-black text-[#A0AEC0] uppercase tracking-[0.5em]">Kỷ lục phiên: {highScore}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => initGrid(difficulty, gameMode)}
                      className={`w-full px-12 py-7 ${selectedFruit.color} text-white rounded-[2.5rem] font-black text-2xl shadow-2xl ${selectedFruit.shadow} hover:brightness-110 transition-all hover:-translate-y-2 active:translate-y-0 flex items-center justify-center gap-4 cursor-pointer`}
                    >
                      <RotateCcw size={32} strokeWidth={3} /> Chơi lại
                    </button>
                    <button
                      onClick={() => setGameState('home')}
                      className="w-full px-12 py-5 bg-[#F8F9FA] text-[#A0AEC0] rounded-[2rem] font-black text-lg hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Home size={24} /> Quay lại Trang chủ
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Cards */}
        <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-4 text-[#1A1A1A]">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 shadow-sm"><Info size={20} strokeWidth={3} /></div>
              <h3 className="font-black uppercase tracking-widest text-xs">Mục tiêu</h3>
            </div>
            <p className="text-sm text-[#718096] leading-relaxed font-bold">
              Kéo để chọn một hình chữ nhật. Nếu tổng bằng đúng 10, các quả nho sẽ biến mất! Duy trì Combo để nhận thêm năng lượng.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F1F3F5] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-4 text-[#1A1A1A]">
              <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 shadow-sm"><Trophy size={20} strokeWidth={3} /></div>
              <h3 className="font-black uppercase tracking-widest text-xs">Tính điểm</h3>
            </div>
            <p className="text-sm text-[#718096] leading-relaxed font-bold">
              1 điểm cho mỗi quả nho. Xóa các vùng lớn hơn để tăng điểm nhanh hơn.
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
                  setGameState(gameState === 'playing' ? 'paused' : 'playing');
                  playSound(SOUNDS.CLICK);
                }}
                disabled={gameState === 'home' || gameState === 'gameover'}
                className="w-full py-4 px-6 rounded-2xl bg-[#1A1A1A] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-10 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {gameState === 'paused' ? <><Play size={16} fill="currentColor" /> Tiếp tục</> : <><Pause size={16} fill="currentColor" /> Tạm dừng</>}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => initGrid(difficulty, gameMode)}
                  className="py-3 px-4 rounded-xl bg-[#F8F9FA] text-[#A0AEC0] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer border border-[#F1F3F5]"
                >
                  <RotateCcw size={14} strokeWidth={3} /> Đặt lại
                </button>
                <button
                  onClick={() => setGameState('home')}
                  className="py-3 px-4 rounded-xl bg-[#F8F9FA] text-[#A0AEC0] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer border border-[#F1F3F5]"
                >
                  <Home size={14} strokeWidth={3} /> Trang chủ
                </button>
              </div>
          </div>
        </div>
      </main>

      {/* Pause Overlay */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCFB]/70 backdrop-blur-2xl"
          >
            <div className="bg-white p-20 rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.2)] text-center border border-[#F1F3F5] max-w-md w-full">
              <div className={`w-24 h-24 ${selectedFruit.color} text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${selectedFruit.shadow}`}>
                <Pause size={48} strokeWidth={3} />
              </div>
              <h2 className="text-5xl font-black text-[#1A1A1A] mb-10 tracking-tighter">Đã Tạm Dừng</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setGameState('playing');
                    playSound(SOUNDS.CLICK);
                  }}
                  className={`w-full px-16 py-6 ${selectedFruit.color} text-white rounded-[2rem] font-black text-2xl shadow-2xl ${selectedFruit.shadow} hover:brightness-110 transition-all hover:-translate-y-2 cursor-pointer`}
                >
                  Tiếp tục
                </button>
                <button
                  onClick={() => setGameState('home')}
                  className="w-full px-16 py-5 bg-[#F8F9FA] text-[#A0AEC0] rounded-[2rem] font-black text-lg hover:text-[#1A1A1A] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Home size={24} /> Thoát ra Trang chủ
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-12 bg-[#F1F3F5]" />
          <span className="text-[#A0AEC0] text-[11px] font-black uppercase tracking-[0.5em]">Phiên bản Fruit Box Pro</span>
          <div className="h-[1px] w-12 bg-[#F1F3F5]" />
        </div>
        <p className="text-[#A0AEC0] text-[10px] font-bold uppercase tracking-widest opacity-60">
          Động cơ Đa Trái Cây v4.0 &bull; Tối ưu hóa cho màn hình Retina
        </p>
      </footer>
    </div>
  );
}
