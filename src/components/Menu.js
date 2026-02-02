/**
 * Main Menu Component
 */
import React, { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { playerAPI, carAPI, levelAPI } from '../services/api';
import PageTransition from './PageTransition';
import './Menu.css';

const Menu = () => {
  const {
    player,
    setPlayer,
    playerCars,
    setPlayerCars,
    selectedCar,
    setSelectedCar,
    levels,
    setLevels,
    currentLevel,
    setCurrentLevel,
    setShowMenu,
    setShowCustomization,
    setShowLeaderboard,
    startGame,
  } = useGameStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTransition, setShowTransition] = useState(false);
  
  useEffect(() => {
    // Load levels
    loadLevels();
  }, []);
  
  const loadLevels = async () => {
    try {
      const response = await levelAPI.list();
      setLevels(response.data);
    } catch (err) {
      console.error('Failed to load levels:', err);
    }
  };
  
  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Try create first; if username exists, fetch it
      let playerData;
      try {
        const response = await playerAPI.create(username, email);
        playerData = response.data;
      } catch (err) {
        if (err.response?.status === 400) {
          const response = await playerAPI.getByUsername(username);
          playerData = response.data;
        } else {
          throw err;
        }
      }
      
      setPlayer(playerData);
      setShowTransition(true);

      // Load player's cars
      const carsResponse = await carAPI.list(playerData._id);
      let cars = carsResponse.data;
      
      // Create default car if player has none
      if (cars.length === 0) {
        const defaultCar = await carAPI.create({
          player_id: playerData._id,
          name: 'Starter Car',
          model: 'sport',
          color: '#ff0000',
          speed: 100,
          acceleration: 100,
          handling: 100,
          nitro_power: 100,
          customizations: {
            body_type: 'sport',
            wheels: 'default',
            spoiler: 'none',
            paint: 'glossy',
            decals: []
          }
        });
        cars = [defaultCar.data];
      }
      
      setPlayerCars(cars);
      setSelectedCar(cars[0]);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create/load player');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartGame = () => {
    if (!player || !selectedCar) {
      setError('Please create a player and select a car first');
      return;
    }
    
    setShowMenu(false);
    startGame();
  };
  
  return (
    <div className="menu-overlay">
      {showTransition && player && <PageTransition playerName={player.username} />}
      <div className={`menu-container ${player ? 'menu-container-animated' : ''}`}>
        <div className="menu-poster" aria-hidden="true">
          <svg viewBox="0 0 800 220" role="img">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="60%" stopColor="#6b6bff" />
                <stop offset="100%" stopColor="#2bd1c8" />
              </linearGradient>
              <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1b1b1b" />
                <stop offset="100%" stopColor="#0b0b0b" />
              </linearGradient>
            </defs>
            <rect width="800" height="220" fill="url(#bg)" />
            <rect x="0" y="150" width="800" height="70" fill="url(#road)" />
            <rect x="390" y="150" width="20" height="70" fill="#f7f1e3" opacity="0.8" />
            <text x="40" y="85" fill="#ffffff" fontSize="56" fontFamily="Impact, Arial Black, sans-serif">
              CAR RACING
            </text>
            <text x="42" y="122" fill="#ffeaa7" fontSize="20" fontFamily="Arial, sans-serif">
              Start your engine • Beat the rivals
            </text>
            <g transform="translate(520 95)">
              <rect x="0" y="40" width="180" height="40" rx="8" fill="#0b0b0b" opacity="0.85" />
              <rect x="20" y="20" width="120" height="30" rx="8" fill="#1976d2" />
              <circle cx="40" cy="85" r="14" fill="#1a1a1a" />
              <circle cx="140" cy="85" r="14" fill="#1a1a1a" />
              <circle cx="40" cy="85" r="6" fill="#f5f5f5" />
              <circle cx="140" cy="85" r="6" fill="#f5f5f5" />
            </g>
          </svg>
        </div>
        <h1 className="game-title">🏎️ 3D Car Racing</h1>
        <p className="creator-credit">Created by Ratan Kumar Majhi</p>
        <div className="social-links">
          <a href="https://portfolio-frontend-b6b4.onrender.com/" target="_blank" rel="noopener noreferrer" title="Portfolio">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </a>
          <a href="https://www.facebook.com/ratan.majhi.831180" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/ratan-kumar-majhi-893521248/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://github.com/ratankumar03" target="_blank" rel="noopener noreferrer" title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>

        {!player ? (
          <form onSubmit={handleCreatePlayer} className="player-form">
            <h2>Create / Login Player</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Loading...' : 'Create / Login'}
            </button>
          </form>
        ) : (
          <div className="player-info">
            <h2>Welcome, {player.username}!</h2>
            <div className="menu-grid">
              <div className="menu-left">
                <div className="stats">
                  <div className="stat-item">Level: {player.level}</div>
                  <div className="stat-item">Coins: 💰 {player.coins}</div>
                  <div className="stat-item">Wins: {player.wins}</div>
                  <div className="stat-item">Losses: {player.losses}</div>
                </div>
                
                <div className="level-select">
                  <h3>Select Level</h3>
                  <select 
                    value={currentLevel} 
                    onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
                    className="select-field"
                  >
                    {levels.map(level => (
                      <option key={level.level_number} value={level.level_number}>
                        Level {level.level_number}: {level.name} ({level.difficulty})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedCar && (
                  <div className="car-info">
                    <h3>Selected Car: {selectedCar.name}</h3>
                    <div className="car-preview" style={{ backgroundColor: selectedCar.color }}>
                      🏎️
                    </div>
                  </div>
                )}
              </div>
              
              <div className="menu-right">
                <div className="menu-buttons">
                  <button onClick={handleStartGame} className="btn btn-success">
                    🏁 Start Race
                  </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowCustomization(true);
                  setShowLeaderboard(false);
                }}
                className="btn btn-secondary"
              >
                🔧 Customize Car
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowCustomization(false);
                  setShowLeaderboard(true);
                }}
                className="btn btn-secondary"
              >
                    🏆 Leaderboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
