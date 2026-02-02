import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameEngine from '../game/GameEngine';
import useMobileTouchControls from '../hooks/useMobileTouchControls';
import '../styles/GamePage.css';

const GamePage = ({ player }) => {
  const { level } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);
  
  // Enable mobile touch controls
  useMobileTouchControls();
  
  const [gameState, setGameState] = useState({
    speed: 0,
    position: 1,
    distance: 0,
    nitro: 100,
    health: 100,
    score: 0,
    time: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  useEffect(() => {
    if (!player) {
      navigate('/');
      return;
    }

    // Initialize game engine
    const initGame = async () => {
      const engine = new GameEngine(canvasRef.current, {
        player,
        level: parseInt(level),
        onGameStateUpdate: (state) => setGameState(state),
        onGameEnd: (results) => {
          setShowResults(true);
          setGameResults(results);
        },
      });

      await engine.initialize();
      engine.start();
      gameEngineRef.current = engine;
    };

    initGame();

    // Keyboard controls
    const handleKeyDown = (e) => {
      if (gameEngineRef.current) {
        gameEngineRef.current.handleKeyDown(e);
      }

      // Pause/Resume
      if (e.key === 'Escape') {
        setIsPaused((prev) => !prev);
        if (gameEngineRef.current) {
          gameEngineRef.current.togglePause();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (gameEngineRef.current) {
        gameEngineRef.current.handleKeyUp(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, [player, level, navigate]);

  const handleRestart = () => {
    setShowResults(false);
    setGameResults(null);
    if (gameEngineRef.current) {
      gameEngineRef.current.restart();
    }
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleNextLevel = () => {
    const nextLevel = parseInt(level) + 1;
    navigate(`/game/${nextLevel}`);
    setShowResults(false);
    setGameResults(null);
  };

  return (
    <div className="game-page">
      <canvas ref={canvasRef} className="game-canvas" />

      {/* HUD */}
      <div className="game-hud">
        <div className="hud-top">
          <div className="hud-item">
            <span className="hud-label">Speed</span>
            <span className="hud-value">{Math.round(gameState.speed)} km/h</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Position</span>
            <span className="hud-value">{gameState.position}/6</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Distance</span>
            <span className="hud-value">{Math.round(gameState.distance)}m</span>
          </div>
        </div>

        <div className="hud-bottom">
          <div className="hud-bar">
            <span className="hud-label">Nitro</span>
            <div className="progress-bar">
              <div
                className="progress-fill nitro"
                style={{ width: `${gameState.nitro}%` }}
              ></div>
            </div>
          </div>
          <div className="hud-bar">
            <span className="hud-label">Health</span>
            <div className="progress-bar">
              <div
                className="progress-fill health"
                style={{ width: `${gameState.health}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="hud-center">
          <div className="score">Score: {gameState.score}</div>
          <div className="time">Time: {Math.floor(gameState.time)}s</div>
        </div>
      </div>

      {/* Pause Menu */}
      {isPaused && !showResults && (
        <div className="pause-menu">
          <div className="pause-content">
            <h2>Game Paused</h2>
            <button onClick={() => setIsPaused(false)}>Resume</button>
            <button onClick={handleRestart}>Restart</button>
            <button onClick={handleExit}>Exit to Menu</button>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {showResults && gameResults && (
        <div className="results-screen">
          <div className="results-content">
            <h2>{gameResults.won ? '🏆 Victory!' : '❌ Race Over'}</h2>
            <div className="results-stats">
              <div className="stat">
                <span>Final Position:</span>
                <span>{gameResults.position}/6</span>
              </div>
              <div className="stat">
                <span>Time:</span>
                <span>{Math.floor(gameResults.time)}s</span>
              </div>
              <div className="stat">
                <span>Score:</span>
                <span>{gameResults.score}</span>
              </div>
              <div className="stat">
                <span>Coins Earned:</span>
                <span>+{gameResults.coinsEarned}</span>
              </div>
            </div>
            <div className="results-buttons">
              <button onClick={handleRestart}>Restart</button>
              {gameResults.won && (
                <button onClick={handleNextLevel}>Next Level</button>
              )}
              <button onClick={handleExit}>Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Help - Only show on Desktop */}
      {!isMobile && (
        <div className="controls-help">
          <div className="control">↑ Accelerate</div>
          <div className="control">↓ Brake</div>
          <div className="control">← → Steer</div>
          <div className="control">Space Nitro</div>
          <div className="control">Esc Pause</div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
