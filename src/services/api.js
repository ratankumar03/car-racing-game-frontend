/**
 * API Service for Racing Game Backend
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for fallback
const MOCK_LEVELS = [
  { id: 1, name: 'Beginner Track', difficulty: 'easy', distance: 5000 },
  { id: 2, name: 'Intermediate Track', difficulty: 'medium', distance: 8000 },
  { id: 3, name: 'Advanced Track', difficulty: 'hard', distance: 12000 },
];

const MOCK_CARS = [
  { id: '1', name: 'Sports Car', speed: 220, acceleration: 9, handling: 8, owner_id: 'player1' },
  { id: '2', name: 'Racing Car', speed: 270, acceleration: 10, handling: 9, owner_id: 'player1' },
];

// Player API
export const playerAPI = {
  create: async (username, email) => {
    try {
      return await api.post('/players/', { username, email });
    } catch (error) {
      // Fallback: return mock player
      return { data: { id: 'player1', username, email, level: 1 } };
    }
  },
  getById: async (playerId) => {
    try {
      return await api.get(`/players/${playerId}/`);
    } catch (error) {
      return { data: { id: playerId, username: 'Player', level: 1, cars: [] } };
    }
  },
  getByUsername: async (username) => {
    try {
      return await api.get(`/players/username/${username}/`);
    } catch (error) {
      return { data: { id: 'player1', username, level: 1 } };
    }
  },
  update: (playerId, data) => api.put(`/players/${playerId}/`, data).catch(() => ({ data })),
};

// Car API
export const carAPI = {
  list: async (playerId) => {
    try {
      return await api.get(`/cars/?player_id=${playerId}`);
    } catch (error) {
      return { data: MOCK_CARS };
    }
  },
  create: (carData) => api.post('/cars/', carData),
  getById: (carId) => api.get(`/cars/${carId}/`),
  update: (carId, data) => api.put(`/cars/${carId}/`, data),
  upgrade: (carId, upgradeType, amount) => 
    api.post(`/cars/${carId}/upgrade/`, { upgrade_type: upgradeType, amount }),
};

// Level API
export const levelAPI = {
  list: async () => {
    try {
      return await api.get('/levels/');
    } catch (error) {
      return { data: MOCK_LEVELS };
    }
  },
  getById: async (levelNumber) => {
    try {
      return await api.get(`/levels/${levelNumber}/`);
    } catch (error) {
      return { data: MOCK_LEVELS[levelNumber - 1] || MOCK_LEVELS[0] };
    }
  },
};

// Game Session API
export const sessionAPI = {
  create: (playerId, levelNumber, carId) => 
    api.post('/sessions/', { player_id: playerId, level_number: levelNumber, car_id: carId }).catch(err => ({ 
      data: { id: 'session1', player_id: playerId, level_number: levelNumber, car_id: carId }
    })),
  getById: (sessionId) => api.get(`/sessions/${sessionId}/`),
  update: (sessionId, data) => api.put(`/sessions/${sessionId}/`, data),
  complete: (sessionId, position, score, time) => 
    api.post(`/sessions/${sessionId}/complete/`, { position, score, time }),
};

// Leaderboard API
export const leaderboardAPI = {
  get: (levelNumber = null, limit = 10) => {
    const params = { limit };
    if (levelNumber) params.level_number = levelNumber;
    return api.get('/leaderboard/', { params });
  },
};

// Voice Agent API
export const voiceAPI = {
  command: (command, context = null) => api.post('/voice/command/', { command, context }),
  getTip: (levelNumber = null) => {
    const params = levelNumber ? { level_number: levelNumber } : {};
    return api.get('/voice/tip/', { params });
  },
  explainFeature: (featureName) => api.post('/voice/explain/', { feature_name: featureName }),
};

// Utility API
export const utilityAPI = {
  healthCheck: () => api.get('/health/'),
  initialize: () => api.post('/initialize/'),
};

export default api;
