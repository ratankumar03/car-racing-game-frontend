/**
 * Mobile Touch Controls Hook - FIXED & FULLY WORKING
 * Touch top = accelerate (car starts & speeds up)
 * Release touch = car slows down & stops
 * Touch left = turn left
 * Touch right = turn right
 * Motion follows finger on screen
 */
import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

const useMobileTouchControls = () => {
  const gameStarted = useGameStore((state) => state.gameStarted);
  const gamePaused = useGameStore((state) => state.gamePaused);
  const updateControls = useGameStore((state) => state.updateControls);
  
  const activeTouch = useRef(false);

  useEffect(() => {
    // Check if mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    if (!isMobileDevice()) {
      console.log('Not a mobile device - skipping touch controls');
      return;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const updateTouchControls = (x, y) => {
      if (!gameStarted || gamePaused) {
        // Clear all controls when game not started
        updateControls('forward', false);
        updateControls('left', false);
        updateControls('right', false);
        updateControls('brake', false);
        return;
      }

      // Clear all first
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);
      updateControls('brake', false);

      // TOP 50% OF SCREEN = ACCELERATE
      if (y < screenHeight * 0.5) {
        updateControls('forward', true);
      } else {
        // BOTTOM 50% = BRAKE
        updateControls('brake', true);
      }

      // LEFT 40% = TURN LEFT
      if (x < screenWidth * 0.4) {
        updateControls('left', true);
      }
      // RIGHT 40% = TURN RIGHT
      else if (x > screenWidth * 0.6) {
        updateControls('right', true);
      }

      console.log(`Touch - X: ${x.toFixed(0)}, Y: ${y.toFixed(0)}, Forward: ${y < screenHeight * 0.5}`);
    };

    const handleTouchStart = (e) => {
      if (!gameStarted || gamePaused) return;

      activeTouch.current = true;
      const touch = e.touches[0];
      updateTouchControls(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
      if (!gameStarted || gamePaused || !activeTouch.current) return;

      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateTouchControls(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = (e) => {
      activeTouch.current = false;

      // Clear ALL controls
      updateControls('forward', false);
      updateControls('left', false);
      updateControls('right', false);
      updateControls('brake', false);

      console.log('Touch ended - all controls cleared');
    };

    // Use capturing phase for better responsiveness
    document.addEventListener('touchstart', handleTouchStart, true);
    document.addEventListener('touchmove', handleTouchMove, true);
    document.addEventListener('touchend', handleTouchEnd, true);

    console.log('Mobile touch controls initialized');

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchmove', handleTouchMove, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
      console.log('Mobile touch controls removed');
    };
  }, [gameStarted, gamePaused, updateControls]);
};

export default useMobileTouchControls;
