import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import '../styles/HomePage.css';

const HomePage = ({ player, onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [levels, setLevels] = useState([]);
  const [showLogin, setShowLogin] = useState(!player);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const levelsData = await apiService.getLevels();
        setLevels(levelsData);
      } catch (error) {
        console.error('Error loading levels:', error);
      }
    };

    if (player) {
      loadLevels();
    }
  }, [player]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && email) {
      await onLogin(username, email);
      setShowLogin(false);
    }
  };

  const handlePlayLevel = (levelNumber) => {
    navigate(`/game/${levelNumber}`);
  };

  if (showLogin) {
    return (
      <div className="home-page">
        <div className="login-container">
          <h1 className="game-title">🏎️ Car Racing Game</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Start Racing</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="header">
        <h1>🏎️ Car Racing Game</h1>
        <div className="player-info">
          <span>Welcome, {player.username}!</span>
          <span>Coins: {player.coins}</span>
          <span>Level: {player.level}</span>
        </div>
      </header>

      <main className="main-menu">
        <nav className="menu-nav">
          <button onClick={() => navigate('/garage')}>🚗 Garage</button>
          <button onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
          <button onClick={() => navigate('/settings')}>⚙️ Settings</button>
        </nav>

        <div className="levels-container">
          <h2>Select Level</h2>
          <div className="levels-grid">
            {levels.map((level) => (
              <div
                key={level._id}
                className={`level-card ${
                  level.level_number > player.level ? 'locked' : ''
                }`}
                onClick={() =>
                  level.level_number <= player.level &&
                  handlePlayLevel(level.level_number)
                }
              >
                <div className="level-number">{level.level_number}</div>
                <h3>{level.name}</h3>
                <p className="difficulty">{level.difficulty}</p>
                <div className="level-info">
                  <span>Track: {level.track_length}m</span>
                  <span>Opponents: {level.opponents_count}</span>
                </div>
                <div className="rewards">
                  <span>Coins: +{level.rewards.coins}</span>
                  <span>XP: +{level.rewards.xp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
