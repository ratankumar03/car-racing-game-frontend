/**
 * Keyboard Controls Hook
 */
import { useEffect } from 'react';
import useGameStore from '../store/gameStore';

const useKeyboardControls = () => {
  const { updateControls, pauseGame, resumeGame, gamePaused, gameStarted } = useGameStore();
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return;
      
      // Pause toggle
      if (e.key === 'Escape') {
        if (gamePaused) {
          resumeGame();
        } else {
          pauseGame();
        }
        return;
      }
      
      if (gamePaused) return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          updateControls('forward', true);
          e.preventDefault();
          break;
        case 's':
        case 'arrowdown':
          updateControls('backward', true);
          e.preventDefault();
          break;
        case 'a':
        case 'arrowleft':
          updateControls('left', true);
          e.preventDefault();
          break;
        case 'd':
        case 'arrowright':
          updateControls('right', true);
          e.preventDefault();
          break;
        case ' ':
          updateControls('nitro', true);
          e.preventDefault();
          break;
        case 'shift':
          updateControls('brake', true);
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      if (!gameStarted || gamePaused) return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          updateControls('forward', false);
          break;
        case 's':
        case 'arrowdown':
          updateControls('backward', false);
          break;
        case 'a':
        case 'arrowleft':
          updateControls('left', false);
          break;
        case 'd':
        case 'arrowright':
          updateControls('right', false);
          break;
        case ' ':
          updateControls('nitro', false);
          break;
        case 'shift':
          updateControls('brake', false);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gamePaused, updateControls, pauseGame, resumeGame]);
};

export default useKeyboardControls;
