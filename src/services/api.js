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

// Player API
export const playerAPI = {
  create: (username, email) => api.post('/players/', { username, email }),
  getById: (playerId) => api.get(`/players/${playerId}/`),
  getByUsername: (username) => api.get(`/players/username/${username}/`),
  update: (playerId, data) => api.put(`/players/${playerId}/`, data),
};

// Car API
export const carAPI = {
  list: (playerId) => api.get(`/cars/?player_id=${playerId}`),
  create: (carData) => api.post('/cars/', carData),
  getById: (carId) => api.get(`/cars/${carId}/`),
  update: (carId, data) => api.put(`/cars/${carId}/`, data),
  upgrade: (carId, upgradeType, amount) => 
    api.post(`/cars/${carId}/upgrade/`, { upgrade_type: upgradeType, amount }),
};

// Level API
export const levelAPI = {
  list: () => api.get('/levels/'),
  getById: (levelNumber) => api.get(`/levels/${levelNumber}/`),
};

// Game Session API
export const sessionAPI = {
  create: (playerId, levelNumber, carId) => 
    api.post('/sessions/', { player_id: playerId, level_number: levelNumber, car_id: carId }),
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
