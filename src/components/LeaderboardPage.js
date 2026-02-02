import React, { useState, useEffect } from 'react';
import { leaderboardAPI, levelAPI } from '../services/api';
import useGameStore from '../store/gameStore';

const LeaderboardPage = () => {
  const { setShowMenu, setShowLeaderboard } = useGameStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedLevel]);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const response = await levelAPI.list();
        setLevels(response.data);
      } catch (error) {
        console.error('Error loading levels:', error);
      }
    };
    loadLevels();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.get(selectedLevel);
      const data = response.data || [];
      const ranked = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
      setLeaderboard(ranked);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page" style={{ padding: '20px', minHeight: '100vh' }}>
      <header className="header">
        <h1>🏆 Leaderboard</h1>
        <button
          onClick={() => {
            setShowLeaderboard(false);
            setShowMenu(true);
          }}
        >
          Back to Menu
        </button>
      </header>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '20px', marginTop: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <select
            onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : null)}
            style={{
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              background: 'rgba(20,20,40,0.9)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <option value="" style={{ background: '#1b1f3a', color: '#fff' }}>All Levels</option>
            {levels.length > 0
              ? levels.map((level) => (
                  <option key={level.level_number} value={level.level_number} style={{ background: '#1b1f3a', color: '#fff' }}>
                    Level {level.level_number}: {level.name}
                  </option>
                ))
              : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <option key={level} value={level} style={{ background: '#1b1f3a', color: '#fff' }}>
                    Level {level}
                  </option>
                ))}
          </select>
        </div>

        {loading ? (
          <p style={{ opacity: 0.8 }}>Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No scores yet. Play a race to appear here.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>Rank</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Player</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Level</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Score</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Car</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={`${entry._id}-${entry.rank}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '15px' }}>#{entry.rank}</td>
                  <td style={{ padding: '15px' }}>{entry.username || entry.player_id}</td>
                  <td style={{ padding: '15px' }}>{entry.level_number}</td>
                  <td style={{ padding: '15px' }}>{entry.score}</td>
                  <td style={{ padding: '15px' }}>{Math.floor(entry.time)}s</td>
                  <td style={{ padding: '15px' }}>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
