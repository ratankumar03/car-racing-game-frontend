/**
 * Mobile Touch Controls Hook
 * Handles touch-based controls for mobile devices
 */
import { useEffect } from 'react';
import useGameStore from '../store/gameStore';

const useMobileTouchControls = () => {
  const { updateControls, pauseGame, resumeGame, gamePaused, gameStarted } = useGameStore();
  const touchStartX = { current: 0 };
  const touchStartY = { current: 0 };

  useEffect(() => {
    // Check if mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    if (!isMobileDevice()) return;

    const handleTouchStart = (e) => {
      if (!gameStarted) return;
      if (gamePaused) return;

      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Top half = accelerate/forward
      if (touch.clientY < screenHeight / 2) {
        updateControls('forward', true);
      }

      // Left side = turn left
      if (touch.clientX < screenWidth / 3) {
        updateControls('left', true);
      }

      // Right side = turn right
      if (touch.clientX > (screenWidth * 2) / 3) {
        updateControls('right', true);
      }
    };

    const handleTouchMove = (e) => {
      if (!gameStarted || gamePaused) return;

      const touch = e.touches[0];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Reset all controls
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);

      // Top half = accelerate
      if (touch.clientY < screenHeight / 2) {
        updateControls('forward', true);
      }

      // Left side = turn left
      if (touch.clientX < screenWidth / 3) {
        updateControls('left', true);
      }

      // Right side = turn right
      if (touch.clientX > (screenWidth * 2) / 3) {
        updateControls('right', true);
      }
    };

    const handleTouchEnd = (e) => {
      if (!gameStarted || gamePaused) return;

      // Release all controls
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);
      updateControls('brake', true); // Apply brake when released
      
      // Release brake after short delay
      setTimeout(() => {
        updateControls('brake', false);
      }, 100);
    };

    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchmove', handleTouchMove, false);
    window.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, false);
      window.removeEventListener('touchmove', handleTouchMove, false);
      window.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [gameStarted, gamePaused, updateControls]);
};

export default useMobileTouchControls;
