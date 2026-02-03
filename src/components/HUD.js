/**
 * HUD (Heads-Up Display) Component
 */
import React, { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import './HUD.css';

const HUD = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = /Android|webOS|iPhone|iPad|iPok|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = () => {
        return (
          (typeof window !== 'undefined' &&
            ('ontouchstart' in window ||
              (typeof document !== 'undefined' &&
                'ontouchstart' in document.documentElement) ||
              navigator.maxTouchPoints > 0)) ||
          false
        );
      };
      
      const isMobileDevice = userAgent || (isSmallScreen && isTouchDevice());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const {
    gameStarted,
    gamePaused,
    gameOver,
    controlsLocked,
    racePosition,
    raceScore,
    raceTime,
    raceSpeed,
    raceDistance,
    collisions,
    nitroCount,
    currentLevel,
    levels,
    updateRaceStats,
    pauseGame,
    resumeGame,
    resetGame,
    setShowMenu,
    showCrashPopup,
    crashCountdown,
    setCrashCountdown,
    setShowCrashPopup,
    startGame,
  } = useGameStore();
  
  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver || controlsLocked) return;
    
    const interval = setInterval(() => {
      updateRaceStats((state) => ({ raceTime: state.raceTime + 1 }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameStarted, gamePaused, gameOver, controlsLocked, updateRaceStats]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const levelData = levels.find((lvl) => lvl.level_number === currentLevel);
  const trackLength = levelData?.track_length || 5000;
  const progress = Math.min(1, raceDistance / trackLength);
  
  const handlePause = () => {
    if (gamePaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };
  
  const handleQuit = () => {
    resetGame();
    setShowMenu(true);
  };

  const CrashPopup = () => {
    useEffect(() => {
      if (crashCountdown <= 0) {
        setShowCrashPopup(false);
        resetGame();
        setShowMenu(true);
        return;
      }

      const timer = setInterval(() => {
        setCrashCountdown(crashCountdown - 1);
      }, 1000);

      return () => clearInterval(timer);
    }, [crashCountdown]);

    const handleTryAgain = () => {
      setShowCrashPopup(false);
      setTimeout(() => {
        resetGame();
        startGame();
      }, 300);
    };

    const handleTryAgainTouch = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTryAgain();
    };

    const handleTryAgainPointer = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTryAgain();
    };

    return (
      <div className="crash-overlay">
        <div className="crash-popup">
          <div className="crash-icon">💥</div>
          <h2 className="crash-title">Crash!</h2>
          <p className="crash-message">You collided with another car</p>

          <div className="crash-stats">
            <p>Position: <strong>{racePosition === 0 ? 'DNF' : racePosition}</strong></p>
            <p>Score: <strong>{raceScore}</strong></p>
            <p>Time: <strong>{formatTime(raceTime)}</strong></p>
            <p>Collisions: <strong>{collisions}</strong></p>
          </div>

          <div className="crash-countdown">
            <div className="countdown-circle">
              <span className="countdown-number">{crashCountdown}</span>
            </div>
            <p className="countdown-label">Returning to menu...</p>
          </div>

          <button
            onClick={handleTryAgain}
            onTouchStart={handleTryAgainTouch}
            onPointerDown={handleTryAgainPointer}
            className="crash-btn-try-again"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  };

  // Show crash popup even if game not started
  if (!gameStarted && !showCrashPopup) return null;

  return (
    <>
      {gameStarted && <div className="hud">
        <div className="hud-top">
          <div className="hud-item">
            <span className="hud-label">Level:</span>
            <span className="hud-value">{currentLevel}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Time:</span>
            <span className="hud-value">{formatTime(raceTime)}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Position:</span>
            <span className="hud-value">{racePosition || 1}</span>
          </div>
        </div>
        
        <div className="speedometer">
          <div className="speedometer-ring">
            <div className="speedometer-ticks">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={`tick-${i}`}
                  className="speedometer-tick"
                  style={{ transform: `rotate(${i * 30 - 120}deg)` }}
                />
              ))}
            </div>
            <div
              className="speedometer-needle"
              style={{ transform: `rotate(${Math.min(240, Math.max(0, (raceSpeed / 240) * 240)) - 120}deg)` }}
            />
            <div className="speedometer-center" />
          </div>
          <div className="speedometer-value">{Math.round(raceSpeed)} km/h</div>
        </div>
        
        <div className="hud-bottom">
          <div className="hud-item">
            <span className="hud-label">Score:</span>
            <span className="hud-value">{raceScore}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Collisions:</span>
            <span className="hud-value">{collisions}</span>
          </div>
          <div className="hud-item nitro">
            <span className="hud-label">Nitro:</span>
            <div className="nitro-bars">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`nitro-bar ${i < nitroCount ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mini-map">
          <div className="mini-road">
            <div className="mini-progress" style={{ height: `${progress * 100}%` }} />
            <div className="mini-player" style={{ top: `${(1 - progress) * 80}%` }} />
            <div className="mini-finish" />
            <div className="mini-start" />
          </div>
          <div className="mini-labels">
            <span>Finish</span>
            <span>Start</span>
          </div>
        </div>
        
        <div className="hud-controls">
          <button onClick={handlePause} className="hud-btn">
            {gamePaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button onClick={handleQuit} className="hud-btn hud-btn-danger">
            🚪 Quit
          </button>
        </div>
        
        {/* Controls Guide - Only show on Desktop */}
        {!isMobile && (
          <div className="controls-guide">
            <p><strong>Controls:</strong></p>
            <p>↑ / W - Accelerate | ↓ / S - Brake | ← / A - Left | → / D - Right</p>
            <p><strong>SPACE</strong> - Nitro Boost | <strong>ESC</strong> - Pause</p>
          </div>
        )}
      </div>}

      {gamePaused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>⏸️ Game Paused</h2>
            <button onClick={resumeGame} className="pause-btn">Resume</button>
            <button onClick={handleQuit} className="pause-btn pause-btn-danger">
              Quit to Menu
            </button>
          </div>
        </div>
      )}
      
      {gameOver && !showCrashPopup && (
        <div className="game-over-overlay">
          <div className="game-over-menu">
            <h2>{racePosition === 1 ? '🏆 Victory!' : '💥 Game Over'}</h2>
            <div className="game-over-stats">
              <p>Position: <strong>{racePosition}</strong></p>
              <p>Score: <strong>{raceScore}</strong></p>
              <p>Time: <strong>{formatTime(raceTime)}</strong></p>
              <p>Collisions: <strong>{collisions}</strong></p>
            </div>
            <button onClick={handleQuit} className="game-over-btn">
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {showCrashPopup && <CrashPopup />}
    </>
  );
};

export default HUD;
