/**
 * Game State Store using Zustand
 */
import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Player state
  player: null,
  setPlayer: (player) => set({ player }),
  
  // Car state
  selectedCar: null,
  playerCars: [],
  setSelectedCar: (car) => set({ selectedCar: car }),
  setPlayerCars: (cars) => set({ playerCars: cars }),
  
  // Level state
  currentLevel: 1,
  levels: [],
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setLevels: (levels) => set({ levels }),
  
  // Game session state
  currentSession: null,
  gameStarted: false,
  gamePaused: false,
  gameOver: false,
  controlsLocked: true,
  racePosition: 0,
  raceScore: 0,
  raceTime: 0,
  raceSpeed: 0,
  raceDistance: 0,
  collisions: 0,
  nitroCount: 3,
  showCrashPopup: false,
  crashCountdown: 10,

  setCurrentSession: (session) => set({ currentSession: session }),
  startGame: () => set({ gameStarted: true, gamePaused: false, gameOver: false, controlsLocked: true }),
  pauseGame: () => set({ gamePaused: true }),
  resumeGame: () => set({ gamePaused: false }),
  setControlsLocked: (locked) => set({ controlsLocked: locked }),
  endGame: (position, score) => set({ 
    gameOver: true, 
    gameStarted: false, 
    racePosition: position,
    raceScore: score 
  }),
  
  updateRaceStats: (stats) =>
    set((state) => (typeof stats === 'function' ? stats(state) : stats)),
  resetGame: () => set({
    gameStarted: false,
    gamePaused: false,
    gameOver: false,
    controlsLocked: true,
    racePosition: 0,
    raceScore: 0,
    raceTime: 0,
    raceSpeed: 0,
    raceDistance: 0,
    collisions: 0,
    nitroCount: 3,
    currentSession: null,
    showCrashPopup: false,
    crashCountdown: 10,
  }),
  
  incrementCollisions: () => set((state) => ({ collisions: state.collisions + 1 })),
  useNitro: () => set((state) => ({ 
    nitroCount: Math.max(0, state.nitroCount - 1) 
  })),
  
  // UI state
  showMenu: true,
  showCustomization: false,
  showLeaderboard: false,
  showVoiceAgent: false,
  
  setShowMenu: (show) => set({ showMenu: show }),
  setShowCustomization: (show) => set({ showCustomization: show }),
  setShowLeaderboard: (show) => set({ showLeaderboard: show }),
  setShowVoiceAgent: (show) => set({ showVoiceAgent: show }),
  setShowCrashPopup: (show) => set({ showCrashPopup: show }),
  setCrashCountdown: (countdown) => set({ crashCountdown: countdown }),

  // Keyboard controls state
  controls: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    nitro: false,
  },
  
  updateControls: (key, value) => set((state) => ({
    controls: { ...state.controls, [key]: value }
  })),
  
  resetControls: () => set({
    controls: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
      nitro: false,
    }
  }),
}));

export default useGameStore;
