import * as THREE from 'three';
import apiService from '../services/apiService';

class GameEngine {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
    this.player = options.player;
    this.level = options.level;
    this.onGameStateUpdate = options.onGameStateUpdate;
    this.onGameEnd = options.onGameEnd;

    // Scene setup
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Game objects
    this.playerCar = null;
    this.opponentCars = [];
    this.track = null;
    this.obstacles = [];
    this.environment = [];

    // Game state
    this.gameState = {
      speed: 0,
      position: 1,
      distance: 0,
      nitro: 100,
      health: 100,
      score: 0,
      time: 0,
      isRunning: false,
      isPaused: false,
    };

    // Physics
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.angularVelocity = 0;

    // Controls
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
    };

    // Constants
    this.MAX_SPEED = 300;
    this.ACCELERATION_RATE = 50;
    this.BRAKE_RATE = 80;
    this.TURN_RATE = 2.0;
    this.FRICTION = 0.98;
    this.NITRO_BOOST = 2.0;
    this.NITRO_DRAIN_RATE = 20;
    this.NITRO_RECHARGE_RATE = 5;

    // Timing
    this.startTime = null;
    this.lastFrameTime = null;

    // Session
    this.sessionId = null;
  }

  async initialize() {
    // Setup Three.js
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();

    // Load game data
    await this.loadGameData();

    // Create player car
    this.createPlayerCar();

    // Create track
    this.createTrack();

    // Create opponents
    this.createOpponents();

    // Create environment
    this.createEnvironment();

    // Create game session
    await this.createSession();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.width / this.canvas.height,
      0.1,
      2000
    );
    this.camera.position.set(0, 10, -20);
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x654321, 0.5);
    this.scene.add(hemisphereLight);
  }

  async loadGameData() {
    try {
      // Get level data
      this.levelData = await apiService.getLevel(this.level);
      
      // Get track data
      this.trackData = await apiService.getTrackData(this.level);

      // Get player's car
      const cars = await apiService.getPlayerCars(this.player._id);
      this.playerCarData = cars.find(car => car.is_active) || cars[0];

      // Get car stats
      if (this.playerCarData) {
        this.carStats = await apiService.getCarStats(this.playerCarData._id);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  }

  createPlayerCar() {
    // Create car geometry with 3D colors
    const carGroup = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(4, 2, 6);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: this.playerCarData?.color || 0x0066FF,
      shininess: 100,
      emissive: 0x001133,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    body.receiveShadow = true;
    carGroup.add(body);

    // Cabin
    const cabinGeometry = new THREE.BoxGeometry(3, 1.5, 3);
    const cabinMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.7,
      shininess: 150,
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 2.5, 0);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
    });

    const wheelPositions = [
      { x: -1.5, y: 0.8, z: 2.5 },
      { x: 1.5, y: 0.8, z: 2.5 },
      { x: -1.5, y: 0.8, z: -2.5 },
      { x: 1.5, y: 0.8, z: -2.5 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // Spoiler
    const spoilerGeometry = new THREE.BoxGeometry(3.5, 0.3, 0.8);
    const spoilerMaterial = new THREE.MeshPhongMaterial({
      color: this.playerCarData?.color || 0x0066FF,
      shininess: 100,
    });
    const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
    spoiler.position.set(0, 3, -3);
    carGroup.add(spoiler);

    // Lights
    const lightGeometry = new THREE.SphereGeometry(0.3);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const headlight1 = new THREE.Mesh(lightGeometry, lightMaterial);
    headlight1.position.set(-1, 1, 3);
    carGroup.add(headlight1);

    const headlight2 = new THREE.Mesh(lightGeometry, lightMaterial);
    headlight2.position.set(1, 1, 3);
    carGroup.add(headlight2);

    this.playerCar = carGroup;
    this.playerCar.position.set(0, 0, 0);
    this.scene.add(this.playerCar);
  }

  createTrack() {
    const trackGroup = new THREE.Group();

    // Road
    const roadGeometry = new THREE.PlaneGeometry(
      this.trackData.width,
      this.trackData.length
    );
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = this.trackData.length / 2;
    road.receiveShadow = true;
    trackGroup.add(road);

    // Lane markings
    const markingGeometry = new THREE.BoxGeometry(0.5, 0.1, 5);
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    for (let z = 0; z < this.trackData.length; z += 20) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.position.set(0, 0.1, z);
      trackGroup.add(marking);
    }

    this.track = trackGroup;
    this.scene.add(this.track);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(1000, this.trackData.length + 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 1.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = this.trackData.length / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createOpponents() {
    const opponentCount = this.levelData.opponents_count || 3;
    const colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0xFF00FF, 0x00FFFF];

    for (let i = 0; i < opponentCount; i++) {
      const opponent = this.createCarMesh(colors[i % colors.length]);
      opponent.position.set(
        (i - opponentCount / 2) * 5,
        0,
        -20 - (i * 10)
      );
      this.opponentCars.push(opponent);
      this.scene.add(opponent);
    }
  }

  createCarMesh(color) {
    const carGroup = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(4, 2, 6);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color,
      shininess: 100,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    carGroup.add(body);

    return carGroup;
  }

  createEnvironment() {
    // Create trees
    this.trackData.environment.forEach((item) => {
      if (item.type === 'tree') {
        const tree = this.createTree();
        tree.position.set(item.position[0], 0, item.position[2]);
        tree.scale.setScalar(item.scale);
        this.scene.add(tree);
        this.environment.push(tree);
      } else if (item.type === 'building') {
        const building = this.createBuilding();
        building.position.set(item.position[0], 0, item.position[2]);
        building.scale.setScalar(item.scale);
        this.scene.add(building);
        this.environment.push(building);
      }
    });
  }

  createTree() {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    foliage.castShadow = true;
    treeGroup.add(foliage);

    return treeGroup;
  }

  createBuilding() {
    const buildingGeometry = new THREE.BoxGeometry(10, 20, 10);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 10;
    building.castShadow = true;
    building.receiveShadow = true;

    return building;
  }

  async createSession() {
    try {
      const session = await apiService.createGameSession(
        this.player._id,
        this.playerCarData._id,
        this.level
      );
      this.sessionId = session._id;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  start() {
    this.gameState.isRunning = true;
    this.startTime = Date.now();
    this.lastFrameTime = this.startTime;
    this.animate();
  }

  animate() {
    if (!this.gameState.isRunning) return;

    requestAnimationFrame(() => this.animate());

    if (this.gameState.isPaused) {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();
  }

  update(deltaTime) {
    // Update player car
    this.updatePlayerCar(deltaTime);

    // Update opponents
    this.updateOpponents(deltaTime);

    // Update camera
    this.updateCamera();

    // Update game state
    this.gameState.time = (Date.now() - this.startTime) / 1000;
    this.gameState.distance = this.playerCar.position.z;
    this.gameState.speed = Math.abs(this.velocity.z) * 3.6; // Convert to km/h

    // Check win condition
    if (this.gameState.distance >= this.trackData.length) {
      this.endGame(true);
    }

    // Check lose condition
    if (this.gameState.health <= 0) {
      this.endGame(false);
    }

    // Notify state update
    if (this.onGameStateUpdate) {
      this.onGameStateUpdate({ ...this.gameState });
    }
  }

  updatePlayerCar(deltaTime) {
    // Acceleration
    if (this.keys.up) {
      const accel = this.ACCELERATION_RATE * deltaTime;
      this.velocity.z += accel;
    }

    // Braking
    if (this.keys.down) {
      const brake = this.BRAKE_RATE * deltaTime;
      this.velocity.z -= brake;
    }

    // Steering
    if (this.keys.left) {
      this.angularVelocity = this.TURN_RATE;
      if (this.velocity.z > 0) {
        this.velocity.x -= this.TURN_RATE * deltaTime * 10;
      }
    } else if (this.keys.right) {
      this.angularVelocity = -this.TURN_RATE;
      if (this.velocity.z > 0) {
        this.velocity.x += this.TURN_RATE * deltaTime * 10;
      }
    } else {
      this.angularVelocity *= 0.9;
    }

    // Nitro boost
    if (this.keys.space && this.gameState.nitro > 0) {
      this.velocity.z *= this.NITRO_BOOST;
      this.gameState.nitro -= this.NITRO_DRAIN_RATE * deltaTime;
      this.gameState.nitro = Math.max(0, this.gameState.nitro);
    } else if (this.gameState.nitro < 100) {
      this.gameState.nitro += this.NITRO_RECHARGE_RATE * deltaTime;
      this.gameState.nitro = Math.min(100, this.gameState.nitro);
    }

    // Apply friction
    this.velocity.multiplyScalar(this.FRICTION);

    // Clamp speed
    this.velocity.z = Math.max(0, Math.min(this.MAX_SPEED / 3.6, this.velocity.z));

    // Keep car on track
    const trackHalfWidth = this.trackData.width / 2 - 2;
    this.velocity.x = Math.max(-trackHalfWidth, Math.min(trackHalfWidth, this.velocity.x));

    // Update position
    this.playerCar.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.playerCar.position.x = Math.max(-trackHalfWidth, Math.min(trackHalfWidth, this.playerCar.position.x));

    // Update rotation
    this.rotation += this.angularVelocity * deltaTime;
    this.playerCar.rotation.y = this.rotation;
  }

  updateOpponents(deltaTime) {
    this.opponentCars.forEach((opponent, index) => {
      // Simple AI: move forward at varying speeds
      const baseSpeed = 30 + (index * 5);
      opponent.position.z += baseSpeed * deltaTime;

      // Keep on track
      opponent.position.x = Math.sin(opponent.position.z * 0.01) * 5;
    });
  }

  updateCamera() {
    // Follow player car
    const cameraOffset = new THREE.Vector3(0, 10, -20);
    const targetPosition = this.playerCar.position.clone().add(cameraOffset);
    this.camera.position.lerp(targetPosition, 0.1);
    this.camera.lookAt(this.playerCar.position);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':
        this.keys.up = true;
        break;
      case 'ArrowDown':
        this.keys.down = true;
        break;
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case ' ':
        this.keys.space = true;
        break;
      default:
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.key) {
      case 'ArrowUp':
        this.keys.up = false;
        break;
      case 'ArrowDown':
        this.keys.down = false;
        break;
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case ' ':
        this.keys.space = false;
        break;
      default:
        break;
    }
  }

  togglePause() {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  async endGame(won) {
    this.gameState.isRunning = false;

    const results = {
      won,
      position: this.gameState.position,
      time: this.gameState.time,
      score: this.gameState.score,
      coinsEarned: won ? this.levelData.rewards.coins : 0,
    };

    // Complete session
    if (this.sessionId) {
      try {
        await apiService.completeGameSession(this.sessionId, {
          won,
          score: this.gameState.score,
          distance_traveled: this.gameState.distance,
          collisions: 0,
          nitro_used: 100 - this.gameState.nitro,
        });
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }

    if (this.onGameEnd) {
      this.onGameEnd(results);
    }
  }

  restart() {
    // Reset game state
    this.gameState = {
      speed: 0,
      position: 1,
      distance: 0,
      nitro: 100,
      health: 100,
      score: 0,
      time: 0,
      isRunning: false,
      isPaused: false,
    };

    // Reset player car position
    this.playerCar.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.rotation = 0;

    // Start again
    this.start();
  }

  destroy() {
    this.gameState.isRunning = false;
    
    // Cleanup Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Remove all objects from scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }
}

export default GameEngine;
