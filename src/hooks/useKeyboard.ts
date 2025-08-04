import { useEffect, useCallback, useState } from 'react';

// export interface KeyboardState {
//   left: boolean;
//   right: boolean;
// }
type KeyboardState = any;

export const useKeyboard = (enabled: boolean = true) => {
  const [keyState, setKeyState] = useState<KeyboardState>({
    left: false,
    right: false,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setKeyState((prev: KeyboardState) => ({ ...prev, left: true }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setKeyState((prev: KeyboardState) => ({ ...prev, right: true }));
        break;
    }
  }, [enabled]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setKeyState((prev: KeyboardState) => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setKeyState((prev: KeyboardState) => ({ ...prev, right: false }));
        break;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, enabled]);

  return keyState;
}; 