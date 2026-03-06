import React, { useState, useMemo, useCallback, type RefObject } from 'react';
import type { AppleData, Selection, DifficultyConfig } from '../types';
import { CONSTANTS } from '../data/gameData';

const { TARGET_SUM } = CONSTANTS;

export function useSelection(grid: AppleData[][], config: DifficultyConfig, gridRef: RefObject<HTMLDivElement | null>) {
  const [selection, setSelection] = useState<Selection>({ start: null, end: null });
  const [isDragging, setIsDragging] = useState(false);

  const getCoordsFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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
  }, [gridRef, config.cols, config.rows]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordsFromEvent(e);
    if (coords) {
      setSelection({ start: coords, end: coords });
      setIsDragging(true);
    }
  }, [getCoordsFromEvent]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const coords = getCoordsFromEvent(e);
    if (coords) {
      setSelection((prev) => ({ ...prev, end: coords }));
    }
  }, [isDragging, getCoordsFromEvent]);

  const resetSelection = useCallback(() => {
    setIsDragging(false);
    setSelection({ start: null, end: null });
  }, []);

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
        const apple = grid[r]?.[c];
        if (apple && !apple.isCleared) {
          if (apple.type === 'wildcard') hasWildcard = true;
          else sum += apple.value;
        }
      }
    }
    return hasWildcard && sum < TARGET_SUM ? TARGET_SUM : sum;
  }, [selection, grid]);

  return {
    selection,
    isDragging,
    currentSelectionSum,
    handleStart,
    handleMove,
    resetSelection,
  };
}
