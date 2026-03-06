import { useCallback } from 'react';

export function useSound(isMuted: boolean) {
  const playSound = useCallback((soundUrl: string) => {
    if (isMuted) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [isMuted]);

  return playSound;
}
