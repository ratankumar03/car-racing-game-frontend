/**
 * Mobile Touch Controls Hook
 * Handles touch-based controls for mobile devices
 * Top of screen = accelerate
 * Left side = turn left
 * Right side = turn right
 */
import { useEffect } from 'react';
import useGameStore from '../store/gameStore';

const useMobileTouchControls = () => {
  const { updateControls, pauseGame, resumeGame, gamePaused, gameStarted } = useGameStore();
  const touchStartX = { current: 0 };
  const touchStartY = { current: 0 };
  const lastTouchX = { current: 0 };

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

      e.preventDefault();
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      lastTouchX.current = touch.clientX;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Top half = accelerate/forward (always accelerate on touch start)
      if (touch.clientY < screenHeight / 2) {
        updateControls('forward', true);
      }

      // Left third = turn left
      if (touch.clientX < screenWidth / 3) {
        updateControls('left', true);
      }

      // Right third = turn right
      if (touch.clientX > (screenWidth * 2) / 3) {
        updateControls('right', true);
      }
    };

    const handleTouchMove = (e) => {
      if (!gameStarted || gamePaused) return;

      e.preventDefault();
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const currentX = touch.clientX;
      const currentY = touch.clientY;

      // Always reset on move
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);

      // Top 60% of screen = accelerate
      if (currentY < screenHeight * 0.6) {
        updateControls('forward', true);
      }

      // Left 35% = turn left
      if (currentX < screenWidth * 0.35) {
        updateControls('left', true);
      }
      // Right 35% = turn right
      else if (currentX > screenWidth * 0.65) {
        updateControls('right', true);
      }
    };

    const handleTouchEnd = (e) => {
      if (!gameStarted || gamePaused) return;

      e.preventDefault();

      // Release all controls
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);
      updateControls('brake', true); // Apply brake when released
      
      // Release brake after short delay
      setTimeout(() => {
        updateControls('brake', false);
      }, 150);
    };

    // Add touch event listeners with passive: false to allow preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart, false);
      window.removeEventListener('touchmove', handleTouchMove, false);
      window.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [gameStarted, gamePaused, updateControls]);
};

export default useMobileTouchControls;
