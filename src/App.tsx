/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import type { DifficultyKey, GameModeKey, FruitConfig } from './types';
import { DIFFICULTIES, FRUITS, SOUNDS, loadGameData, saveSettings } from './data/gameData';
import { useSound } from './hooks/useSound';
import { useSelection } from './hooks/useSelection';
import { useMission } from './hooks/useMission';
import { useGameState } from './hooks/useGameState';
import { HomeScreen } from './components/HomeScreen';
import { GameHeader } from './components/GameHeader';
import { MissionPanel } from './components/MissionPanel';
import { ComboGauge } from './components/ComboGauge';
import { GameGrid } from './components/GameGrid';
import { ActionFeedbackToast } from './components/ActionFeedbackToast';
import { GameOverOverlay } from './components/GameOverOverlay';
import { PauseOverlay } from './components/PauseOverlay';
import { InfoCards } from './components/InfoCards';

export default function App() {
  const savedData = loadGameData();

  const [difficulty, setDifficulty] = useState<DifficultyKey>(savedData.settings.lastDifficulty);
  const [gameMode, setGameMode] = useState<GameModeKey>(savedData.settings.lastGameMode);
  const [selectedFruit, setSelectedFruit] = useState<FruitConfig>(
    FRUITS.find(f => f.id === savedData.settings.lastFruitId) || FRUITS[0]
  );
  const [isMuted, setIsMuted] = useState(savedData.settings.isMuted);

  const gridRef = useRef<HTMLDivElement>(null);
  const config = DIFFICULTIES[difficulty];
  const playSound = useSound(isMuted);

  const mission = useMission(
    gameMode, config, selectedFruit, playSound,
    (fn) => game.setScore(fn),
    (fn) => game.setGrid(fn),
    (fn) => game.setTimeFrozenLeft(fn),
  );

  const game = useGameState(
    difficulty, gameMode, selectedFruit, playSound,
    mission.checkMission, mission.resetMission, mission.tickMission,
  );

  const sel = useSelection(game.grid, config, gridRef);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sel.isDragging || !sel.selection.start || !sel.selection.end) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    if (game.gameState === 'playing') {
      game.handleSelectionEnd(sel.selection.start, sel.selection.end, clientX, clientY);
    }
    sel.resetSelection();
  }, [sel, game]);

  const handleStartWrapped = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (game.gameState !== 'playing') return;
    sel.handleStart(e);
  }, [game.gameState, sel]);

  const handleMoveWrapped = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (game.gameState !== 'playing') return;
    sel.handleMove(e);
  }, [game.gameState, sel]);

  const handleSetDifficulty = useCallback((key: DifficultyKey) => {
    setDifficulty(key);
    saveSettings({ lastDifficulty: key });
    playSound(SOUNDS.CLICK);
  }, [playSound]);

  const handleSetGameMode = useCallback((key: GameModeKey) => {
    setGameMode(key);
    saveSettings({ lastGameMode: key });
    playSound(SOUNDS.CLICK);
  }, [playSound]);

  const handleSetFruit = useCallback((fruit: FruitConfig) => {
    setSelectedFruit(fruit);
    saveSettings({ lastFruitId: fruit.id });
    playSound(SOUNDS.CLICK);
  }, [playSound]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      saveSettings({ isMuted: !prev });
      return !prev;
    });
  }, []);

  const goHome = useCallback(() => game.setGameState('home'), [game]);
  const startGame = useCallback(() => game.initGrid(difficulty, gameMode), [game, difficulty, gameMode]);
  const togglePause = useCallback(() => {
    game.setGameState(game.gameState === 'playing' ? 'paused' : 'playing');
  }, [game]);

  if (game.gameState === 'home') {
    return (
      <HomeScreen
        difficulty={difficulty}
        gameMode={gameMode}
        selectedFruit={selectedFruit}
        highScore={game.highScore}
        onSetDifficulty={handleSetDifficulty}
        onSetGameMode={handleSetGameMode}
        onSetFruit={handleSetFruit}
        onStartGame={startGame}
        playSound={playSound}
      />
    );
  }

  return (
    <div className="min-h-screen bg-game-bg font-body text-game-text selection:bg-indigo-100 overflow-x-hidden">
      <GameHeader
        difficulty={difficulty}
        gameMode={gameMode}
        selectedFruit={selectedFruit}
        gameState={game.gameState}
        timeLeft={game.timeLeft}
        score={game.score}
        isMuted={isMuted}
        isFeverMode={game.isFeverMode}
        onGoHome={goHome}
        onToggleMute={handleToggleMute}
        onPauseResume={togglePause}
        onRestart={startGame}
        playSound={playSound}
      />

      <main className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col items-center">
        <MissionPanel
          currentMission={mission.currentMission}
          missionChainProgress={mission.missionChainProgress}
        />

        <ComboGauge
          comboCount={game.comboCount}
          isFeverMode={game.isFeverMode}
          feverTimeLeft={game.feverTimeLeft}
          timeFrozenLeft={game.timeFrozenLeft}
        />

        <div className="relative">
          <GameGrid
            grid={game.grid}
            config={config}
            selectedFruit={selectedFruit}
            selection={sel.selection}
            isDragging={sel.isDragging}
            currentSelectionSum={sel.currentSelectionSum}
            isFeverMode={game.isFeverMode}
            isShaking={game.isShaking}
            gameState={game.gameState}
            gridRef={gridRef}
            onMouseDown={handleStartWrapped as (e: React.MouseEvent) => void}
            onMouseMove={handleMoveWrapped as (e: React.MouseEvent) => void}
            onMouseUp={handleEnd as (e: React.MouseEvent) => void}
            onMouseLeave={handleEnd as (e: React.MouseEvent) => void}
            onTouchStart={handleStartWrapped as (e: React.TouchEvent) => void}
            onTouchMove={handleMoveWrapped as (e: React.TouchEvent) => void}
            onTouchEnd={handleEnd as (e: React.TouchEvent) => void}
          />

          <ActionFeedbackToast lastAction={game.lastAction} />

          <GameOverOverlay
            show={game.gameState === 'gameover'}
            grid={game.grid}
            score={game.score}
            highScore={game.highScore}
            selectedFruit={selectedFruit}
            onRestart={startGame}
            onGoHome={goHome}
          />
        </div>

        <InfoCards
          gameMode={gameMode}
        />
      </main>

      <PauseOverlay
        show={game.gameState === 'paused'}
        selectedFruit={selectedFruit}
        onResume={() => game.setGameState('playing')}
        onGoHome={goHome}
        playSound={playSound}
      />

      <footer className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-game-border" />
          <span className="text-game-text-muted text-xs font-semibold uppercase tracking-[0.4em]">Fruit Box Pro</span>
          <div className="h-px w-12 bg-game-border" />
        </div>
        <p className="text-game-text-muted/70 text-xs font-medium uppercase tracking-widest">
          Multi-Fruit Engine v4.0
        </p>
      </footer>
    </div>
  );
}
