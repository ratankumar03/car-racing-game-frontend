import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Player APIs
  async createPlayer(username, email) {
    const response = await this.client.post('/players/', { username, email });
    return response.data;
  }

  async getPlayer(playerId) {
    const response = await this.client.get(`/players/${playerId}/`);
    return response.data;
  }

  async getPlayerStats(playerId) {
    const response = await this.client.get(`/players/${playerId}/`);
    return response.data;
  }

  // Car APIs
  async getPlayerCars(playerId) {
    const response = await this.client.get(`/cars/?player_id=${playerId}`);
    return response.data;
  }

  async modifyCar(carId, modifications) {
    const response = await this.client.put(`/cars/${carId}/`, modifications);
    return response.data;
  }

  async getCarStats(carId) {
    const response = await this.client.get(`/cars/${carId}/`);
    return response.data;
  }

  // Level APIs
  async getLevels() {
    const response = await this.client.get('/levels/');
    return response.data;
  }

  async getLevel(levelNumber) {
    const response = await this.client.get(`/levels/${levelNumber}/`);
    return response.data;
  }

  // Game Session APIs
  async createGameSession(playerId, carId, levelNumber) {
    const response = await this.client.post('/sessions/', {
      player_id: playerId,
      car_id: carId,
      level_number: levelNumber,
    });
    return response.data;
  }

  async updateGameSession(sessionId, updateData) {
    const response = await this.client.put(`/sessions/${sessionId}/`, updateData);
    return response.data;
  }

  async completeGameSession(sessionId, finalData) {
    const response = await this.client.post(`/sessions/${sessionId}/complete/`, finalData);
    return response.data;
  }

  // Leaderboard APIs
  async getLeaderboard(levelNumber = null) {
    const url = levelNumber
      ? `/leaderboard/?level_number=${levelNumber}`
      : '/leaderboard/';
    const response = await this.client.get(url);
    return response.data;
  }

  // Modification Shop APIs
  async getModifications(type = null) {
    return [];
  }

  async purchaseModification(carId, modificationId) {
    return { success: false, message: 'Shop not available' };
  }

  // AI APIs
  async getOpponentAI(gameState) {
    const response = await this.client.post('/ai/opponent/', gameState);
    return response.data;
  }

  async getMultipleOpponents(gameState) {
    const response = await this.client.post('/ai/opponents/', gameState);
    return response.data;
  }

  async getDifficultyRecommendation(playerId, performanceData, carStats, playerStats) {
    const response = await this.client.post('/ai/difficulty/', {
      player_id: playerId,
      performance_data: performanceData,
      car_stats: carStats,
      player_stats: playerStats,
    });
    return response.data;
  }

  async generateTraffic(density, trackLength, playerPosition) {
    const response = await this.client.post('/ai/traffic/generate/', {
      density,
      track_length: trackLength,
      player_position: playerPosition,
    });
    return response.data;
  }

  // Voice APIs
  async processVoiceCommand(text) {
    const response = await this.client.post('/voice/command/', { text });
    return response.data;
  }

  async chatWithAssistant(sessionId, message, gameContext = null) {
    const response = await this.client.post('/voice/assistant/', {
      session_id: sessionId,
      message,
      game_context: gameContext,
    });
    return response.data;
  }

  async getPerformanceTips(playerPerformance) {
    const response = await this.client.post('/voice/tips/', playerPerformance);
    return response.data;
  }

  async getTutorialInstructions(level) {
    const response = await this.client.get(`/voice/tutorial/${level}/`);
    return response.data;
  }

  // Game APIs
  async getGameConfig() {
    const response = await this.client.get('/game/config/');
    return response.data;
  }

  async getTrackData(levelNumber) {
    const response = await this.client.get(`/game/track/${levelNumber}/`);
    return response.data;
  }

  async detectCollisions(playerData, objects) {
    const response = await this.client.post('/game/collision/', {
      player: playerData,
      objects,
    });
    return response.data;
  }

  async activatePowerUp(type, playerState) {
    const response = await this.client.post('/game/powerup/', {
      type,
      player_state: playerState,
    });
    return response.data;
  }

  // Initialize game data
  async initializeGameData() {
    const response = await this.client.post('/initialize/');
    return response.data;
  }
}

const apiService = new APIService();
export default apiService;
