/**
 * Mobile Touch Controls Hook - FULLY OPTIMIZED
 * Touch top = accelerate (car starts & speeds up)
 * Release touch = car slows down & stops
 * Touch left = turn left
 * Touch right = turn right
 * Motion follows finger on screen
 */
import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

const useMobileTouchControls = () => {
  const { updateControls, gameStarted, gamePaused } = useGameStore();
  const activeTouch = useRef(false);
  const currentX = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    // Check if mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    if (!isMobileDevice()) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const handleTouchStart = (e) => {
      if (!gameStarted || gamePaused) return;
      
      activeTouch.current = true;
      const touch = e.touches[0];
      currentX.current = touch.clientX;
      currentY.current = touch.clientY;

      updateTouchControls(touch.clientX, touch.clientY, screenWidth, screenHeight);
    };

    const handleTouchMove = (e) => {
      if (!gameStarted || gamePaused || !activeTouch.current) return;
      
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        currentX.current = touch.clientX;
        currentY.current = touch.clientY;

        updateTouchControls(touch.clientX, touch.clientY, screenWidth, screenHeight);
      }
    };

    const handleTouchEnd = (e) => {
      if (!gameStarted || gamePaused) return;
      
      activeTouch.current = false;

      // Release ALL controls immediately
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);
      
      // Apply strong brake
      updateControls('brake', true);
      
      // Release brake quickly
      setTimeout(() => {
        if (!activeTouch.current) {
          updateControls('brake', false);
        }
      }, 100);
    };

    const updateTouchControls = (x, y, width, height) => {
      // Clear all previous controls
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);
      updateControls('brake', false);

      // TOP 50% OF SCREEN = ACCELERATE
      if (y < height * 0.5) {
        updateControls('forward', true);
      } else {
        // BOTTOM 50% = BRAKE
        updateControls('brake', true);
      }

      // LEFT 40% = TURN LEFT
      if (x < width * 0.4) {
        updateControls('left', true);
      }
      // RIGHT 40% = TURN RIGHT
      else if (x > width * 0.6) {
        updateControls('right', true);
      }
    };

    // Add listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchmove', handleTouchMove, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [gameStarted, gamePaused, updateControls]);
};

export default useMobileTouchControls;
