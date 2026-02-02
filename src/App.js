/**
 * Main App Component
 */
import React from 'react';
import GameScene from './game/GameScene';
import Menu from './components/Menu';
import HUD from './components/HUD';
import useKeyboardControls from './hooks/useKeyboardControls';
import useGameStore from './store/gameStore';
import GaragePage from './components/GaragePage';
import LeaderboardPage from './components/LeaderboardPage';
import './App.css';

function App() {
  const { showMenu, showCustomization, showLeaderboard, player } = useGameStore();
  
  // Initialize keyboard controls
  useKeyboardControls();
  
  return (
    <div className="App">
      <GameScene />
      {showMenu && !showCustomization && !showLeaderboard && <Menu />}
      {showCustomization && <GaragePage player={player} />}
      {showLeaderboard && <LeaderboardPage />}
      <HUD />
    </div>
  );
}

export default App;
