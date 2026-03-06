import React, { useState, useCallback } from 'react';
import type { Mission, MissionType, RewardType, AppleData, GameModeKey, DifficultyConfig, FruitConfig } from '../types';
import { CONSTANTS, SOUNDS } from '../data/gameData';

const { MISSION_REWARD_POINTS, MISSION_FREEZE_DURATION } = CONSTANTS;

export function useMission(
  gameMode: GameModeKey,
  config: DifficultyConfig,
  selectedFruit: FruitConfig,
  playSound: (url: string) => void,
  setScore: React.Dispatch<React.SetStateAction<number>>,
  setGrid: React.Dispatch<React.SetStateAction<AppleData[][]>>,
  setTimeFrozenLeft: React.Dispatch<React.SetStateAction<number>>,
) {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [missionChainProgress, setMissionChainProgress] = useState(0);
  const [lastMissionTime, setLastMissionTime] = useState(0);

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
  }, [config.rows, config.cols, playSound, setScore, setGrid, setTimeFrozenLeft]);

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
      rewardType,
    };

    setCurrentMission(newMission);
    setMissionChainProgress(0);
    setLastMissionTime(Date.now());
  }, [selectedFruit.label, gameMode]);

  const checkMission = useCallback((selectedApples: AppleData[]) => {
    if (!currentMission) return;

    let success = false;
    let progressIncrement = 0;

    if (currentMission.type === 'QUANTITY') {
      progressIncrement = selectedApples.filter(a => a.value === currentMission.targetValue).length;
    } else if (currentMission.type === 'COUNT') {
      if (selectedApples.length === currentMission.targetCount) {
        success = true;
      }
    } else if (currentMission.type === 'CHAIN') {
      if (selectedApples.length === 2) {
        progressIncrement = 1;
      } else {
        setMissionChainProgress(0);
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

  const resetMission = useCallback(() => {
    setCurrentMission(null);
    setMissionChainProgress(0);
    setLastMissionTime(Date.now());
  }, []);

  const tickMission = useCallback(() => {
    if (currentMission) {
      setCurrentMission(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 0.1) return null;
        return { ...prev, timeLeft: prev.timeLeft - 0.1 };
      });
    } else if (Date.now() - lastMissionTime > CONSTANTS.MISSION_INTERVAL) {
      generateMission();
    }
  }, [currentMission, lastMissionTime, generateMission]);

  return {
    currentMission,
    missionChainProgress,
    checkMission,
    resetMission,
    tickMission,
  };
}
