import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = ({ player }) => {
  const navigate = useNavigate();
  const [graphics, setGraphics] = useState('high');
  const [audio, setAudio] = useState(80);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const handleSave = () => {
    localStorage.setItem('gameSettings', JSON.stringify({
      graphics,
      audio,
      voiceEnabled,
    }));
    alert('Settings saved!');
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      <header className="header">
        <h1>⚙️ Settings</h1>
        <button onClick={() => navigate('/')}>Back to Menu</button>
      </header>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '30px',
        borderRadius: '20px',
        marginTop: '30px',
        maxWidth: '600px',
        margin: '30px auto',
      }}>
        <h2>Game Settings</h2>

        <div style={{ marginTop: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Graphics Quality:
          </label>
          <select
            value={graphics}
            onChange={(e) => setGraphics(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>

        <div style={{ marginTop: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Audio Volume: {audio}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={audio}
            onChange={(e) => setAudio(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            Enable Voice Control
          </label>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Player Info</h3>
          <p>Username: {player?.username || 'Guest'}</p>
          <p>Email: {player?.email || 'N/A'}</p>
          <p>Level: {player?.level || 1}</p>
          <p>Total Races: {(player?.races_won || 0) + (player?.races_lost || 0)}</p>
          <p>Win Rate: {
            player ? 
            Math.round((player.races_won / Math.max(player.races_won + player.races_lost, 1)) * 100) : 0
          }%</p>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            marginTop: '30px',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
