import { useState, useEffect, useCallback } from 'react';
import type { AppleData, AppleType, DifficultyKey, GameModeKey, GameState, FruitConfig, ActionFeedback } from '../types';
import { DIFFICULTIES, SOUNDS, CONSTANTS, getHighScore, setHighScore as saveHighScore } from '../data/gameData';

const { TARGET_SUM, COMBO_WINDOW, COMBO_MAX, FEVER_DURATION } = CONSTANTS;

export function useGameState(
  difficulty: DifficultyKey,
  gameMode: GameModeKey,
  selectedFruit: FruitConfig,
  playSound: (url: string) => void,
  checkMission: (apples: AppleData[]) => void,
  resetMission: () => void,
  tickMission: () => void,
) {
  const config = DIFFICULTIES[difficulty];

  const [grid, setGrid] = useState<AppleData[][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.time);
  const [gameState, setGameState] = useState<GameState>('home');
  const [highScore, setHighScore] = useState(() => getHighScore(difficulty, gameMode));
  const [lastAction, setLastAction] = useState<ActionFeedback | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Combo & Fever
  const [comboCount, setComboCount] = useState(0);
  const [lastSuccessTime, setLastSuccessTime] = useState(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  const [feverTimeLeft, setFeverTimeLeft] = useState(0);
  const [timeFrozenLeft, setTimeFrozenLeft] = useState(0);

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
    setComboCount(0);
    setIsFeverMode(false);
    setFeverTimeLeft(0);
    setLastSuccessTime(0);
    setTimeFrozenLeft(0);
    setHighScore(getHighScore(diffKey, modeKey));
    resetMission();
  }, [difficulty, gameMode, playSound, resetMission]);

  // Combo decay, fever countdown, mission tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        const now = Date.now();

        if (!isFeverMode && comboCount > 0) {
          if (now - lastSuccessTime > COMBO_WINDOW) {
            setComboCount(0);
          }
        }

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

        tickMission();

        if (timeFrozenLeft > 0) {
          setTimeFrozenLeft(prev => Math.max(0, prev - 0.1));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, isFeverMode, comboCount, lastSuccessTime, tickMission, timeFrozenLeft]);

  // Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === 'playing' && gameMode === 'TIME_ATTACK' && timeLeft > 0) {
      timer = setInterval(() => {
        if (timeFrozenLeft > 0) return;
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

  // High score tracking
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      saveHighScore(difficulty, gameMode, score);
    }
  }, [score, highScore, difficulty, gameMode]);

  const handleSelectionEnd = useCallback((
    selectionStart: { r: number; c: number },
    selectionEnd: { r: number; c: number },
    clientX: number,
    clientY: number,
  ) => {
    const rStart = Math.min(selectionStart.r, selectionEnd.r);
    const rEnd = Math.max(selectionStart.r, selectionEnd.r);
    const cStart = Math.min(selectionStart.c, selectionEnd.c);
    const cEnd = Math.max(selectionStart.c, selectionEnd.c);

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

      const selectedAppleData = selectedApples.map(({ r, c }) => grid[r][c]);
      checkMission(selectedAppleData);

      let totalClearedThisTurn = 0;
      let goldenPoints = 0;
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
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
  }, [grid, config, isFeverMode, comboCount, lastSuccessTime, playSound, checkMission]);

  return {
    grid,
    setGrid,
    score,
    setScore,
    timeLeft,
    gameState,
    setGameState,
    highScore,
    lastAction,
    isShaking,
    comboCount,
    isFeverMode,
    feverTimeLeft,
    timeFrozenLeft,
    setTimeFrozenLeft,
    initGrid,
    handleSelectionEnd,
  };
}
