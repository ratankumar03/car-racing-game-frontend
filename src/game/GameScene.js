/**
 * Main 3D Game Scene
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import Car from './Car';
import Track from './Track';
import OpponentCars from './OpponentCars';
import './GameScene.css';
import useGameStore from '../store/gameStore';

const CameraController = ({ playerRef }) => {
  const cameraRef = useRef();
  
  useFrame(() => {
    if (!cameraRef.current || !playerRef?.current) return;
    const car = playerRef.current;
    const offset = new THREE.Vector3(0, 6, 12);
    const targetPos = car.position.clone().add(offset);
    cameraRef.current.position.lerp(targetPos, 0.1);
    cameraRef.current.lookAt(car.position);
  });
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 8, 15]}
      fov={75}
    />
  );
};

const FinishWatcher = ({ active, playerRef, finishZ, onFinish }) => {
  useFrame(() => {
    if (!active || !playerRef?.current) return;
    if (playerRef.current.position.z <= finishZ) {
      onFinish();
    }
  });
  return null;
};

const RoadFollower = ({ playerRef, isCityEasy }) => {
  const roadRef = useRef();
  const lineRef = useRef();
  const leftEdgeRef = useRef();
  const rightEdgeRef = useRef();
  const leftLaneRef = useRef();
  const rightLaneRef = useRef();
  
  useFrame(() => {
    if (!roadRef.current || !lineRef.current || !playerRef?.current) return;
    const playerZ = playerRef.current.position.z;
    roadRef.current.position.z = playerZ - 40;
    lineRef.current.position.z = playerZ - 40;
    if (leftEdgeRef.current) leftEdgeRef.current.position.z = playerZ - 40;
    if (rightEdgeRef.current) rightEdgeRef.current.position.z = playerZ - 40;
    if (leftLaneRef.current) leftLaneRef.current.position.z = playerZ - 40;
    if (rightLaneRef.current) rightLaneRef.current.position.z = playerZ - 40;
  });
  
  return (
    <>
      <mesh ref={roadRef} position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 200]} />
        <meshStandardMaterial color={isCityEasy ? "#6b6b6b" : "#1f1f1f"} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh ref={lineRef} position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 200]} />
        <meshStandardMaterial color={isCityEasy ? "#ffffff" : "#f4d03f"} emissive={isCityEasy ? "#ffffff" : "#f6c343"} emissiveIntensity={0.4} />
      </mesh>
      {isCityEasy && (
        <>
          <mesh ref={leftLaneRef} position={[-8, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 200]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh ref={rightLaneRef} position={[8, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 200]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh ref={leftEdgeRef} position={[-18, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 200]} />
            <meshStandardMaterial color="#ff4d4d" />
          </mesh>
          <mesh ref={rightEdgeRef} position={[18, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 200]} />
            <meshStandardMaterial color="#ff4d4d" />
          </mesh>
        </>
      )}
    </>
  );
};

const StatsUpdater = ({ active, playerRef, opponentRefs }) => {
  const { updateRaceStats } = useGameStore();
  const lastZRef = useRef(0);
  
  useFrame((state, delta) => {
    if (!active || !playerRef?.current) return;
    const playerZ = playerRef.current.position.z;
    const distance = Math.max(0, -playerZ);
    const dz = playerZ - lastZRef.current;
    lastZRef.current = playerZ;
    const speed = Math.abs(dz / Math.max(delta, 0.0001)) * 3.6;
    
    let position = 1;
    if (opponentRefs?.current?.length) {
      const ahead = opponentRefs.current.filter((ref) => ref?.current && ref.current.position.z < playerZ).length;
      position = 1 + ahead;
    }
    
    const score = Math.max(0, Math.floor(distance * 0.2));
    
    updateRaceStats({
      raceDistance: distance,
      raceSpeed: speed,
      racePosition: position,
      raceScore: score,
    });
  });
  
  return null;
};

const CollisionWatcher = ({ active, playerRef, opponentRefs, onCrash, radius = 2.2 }) => {
  useFrame(() => {
    if (!active || !playerRef?.current || !opponentRefs?.current?.length) return;
    const px = playerRef.current.position.x;
    const pz = playerRef.current.position.z;
    for (const ref of opponentRefs.current) {
      if (!ref?.current) continue;
      const dx = ref.current.position.x - px;
      const dz = ref.current.position.z - pz;
      if (dx * dx + dz * dz <= radius * radius) {
        onCrash();
        break;
      }
    }
  });
  return null;
};

const GameScene = () => {
  const {
    currentLevel,
    levels,
    selectedCar,
    gameStarted,
    raceTime,
    updateRaceStats,
    endGame,
    incrementCollisions,
    resetControls,
    setControlsLocked,
    setShowMenu,
    resetGame,
    setShowCrashPopup,
    setCrashCountdown,
  } = useGameStore();
  const playerRef = useRef();
  const opponentRefs = useRef([]);
  const [countdown, setCountdown] = useState(null);
  const [raceActive, setRaceActive] = useState(false);
  const finishTriggeredRef = useRef(false);
  const crashTriggeredRef = useRef(false);
  
  const levelData = levels.find(l => l.level_number === currentLevel) || {
    environment: {
      weather: 'sunny',
      time_of_day: 'day',
      obstacles: ['trees', 'buildings']
    },
    track_length: 5000,
    opponents: 5,
    level_number: currentLevel,
    name: 'Track'
  };
  
  // Ensure environment object exists with defaults
  if (!levelData.environment) {
    levelData.environment = {
      weather: 'sunny',
      time_of_day: 'day',
      obstacles: ['trees', 'buildings']
    };
  }
  
  // Sky color based on time of day
  const getSkyProps = () => {
    const timeOfDay = levelData?.environment?.time_of_day || 'day';
    switch (timeOfDay) {
      case 'day':
        return { sunPosition: [0, 1, 0], turbidity: 8, rayleigh: 2 };
      case 'afternoon':
        return { sunPosition: [100, 20, 100], turbidity: 10, rayleigh: 3 };
      case 'evening':
        return { sunPosition: [100, 10, 100], turbidity: 15, rayleigh: 4 };
      case 'sunset':
        return { sunPosition: [100, 5, 100], turbidity: 20, rayleigh: 5 };
      case 'night':
        return { sunPosition: [0, -1, 0], turbidity: 25, rayleigh: 6 };
      default:
        return { sunPosition: [0, 1, 0], turbidity: 8, rayleigh: 2 };
    }
  };
  
  const skyProps = getSkyProps();
  const trackLength = levelData.track_length || 5000;
  const finishZ = -(trackLength / 2 - 30);
  
  const finishTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const size = 32;
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, size, size);
        }
      }
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH', canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    finishTriggeredRef.current = false;
    crashTriggeredRef.current = false;
    resetControls();
    setControlsLocked(true);
    setRaceActive(false);
    setCountdown(3);
    
    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          setCountdown(null);
          setRaceActive(true);
          setControlsLocked(false);
        }, 600);
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [gameStarted, resetControls, setControlsLocked]);
  
  const handleFinish = useCallback(() => {
    if (!raceActive || finishTriggeredRef.current || crashTriggeredRef.current) return;
    finishTriggeredRef.current = true;
    const score = Math.max(0, Math.floor(10000 - raceTime * 100));
    updateRaceStats({ raceScore: score });
    endGame(1, score);
    setTimeout(() => {
      resetGame();
      setShowMenu(true);
    }, 1500);
  }, [raceActive, raceTime, updateRaceStats, endGame]);
  
  const handleCollision = () => {
    if (!raceActive || crashTriggeredRef.current) return;
    crashTriggeredRef.current = true;
    incrementCollisions();
    updateRaceStats({ raceScore: 0 });
    endGame(0, 0);
    setShowCrashPopup(true);
    setCrashCountdown(10);
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        {/* Background */}
        <color attach="background" args={['#9ec9ff']} />
        {/* Camera */}
        <CameraController playerRef={playerRef} />
        
        {/* Sky Dome */}
        <mesh>
          <sphereGeometry args={[500, 32, 32]} />
          <meshBasicMaterial color="#9ec9ff" side={THREE.BackSide} />
        </mesh>
        
        {/* Lights */}
        <ambientLight intensity={0.35} color="#eaf4ff" />
        <hemisphereLight
          skyColor="#b7d7ff"
          groundColor="#3b2f1f"
          intensity={0.6}
        />
        <directionalLight
          position={[12, 18, 6]}
          intensity={(levelData?.environment?.time_of_day || 'day') === 'night' ? 0.4 : 1.15}
          color="#fff3e0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <directionalLight
          position={[-10, 10, -8]}
          intensity={0.4}
          color="#b0d0ff"
        />
        <pointLight position={[0, 12, 6]} intensity={0.35} color="#9fc5ff" />
        
        {/* Fog */}
        <fog 
          attach="fog" 
          color={(levelData?.environment?.weather || 'sunny') === 'foggy' ? '#cfd8dc' : '#9ec9ff'} 
          near={10} 
          far={(levelData?.environment?.weather || 'sunny') === 'foggy' ? 50 : 220} 
        />
        
        {/* Simple road (always visible) */}
        <RoadFollower
          playerRef={playerRef}
          isCityEasy={levelData?.level_number === 1 && (levelData?.name || '').toLowerCase().includes('city')}
        />

        {/* Game Elements */}
        <Track levelData={levelData} />

        {/* Finish Line Banner */}
        <mesh position={[0, 6, finishZ]} rotation={[0, 0, 0]}>
          <planeGeometry args={[30, 6]} />
          <meshBasicMaterial map={finishTexture} transparent />
        </mesh>
        {/* Finish Line on Road */}
        <mesh position={[0, 0.06, finishZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 4]} />
          <meshBasicMaterial map={finishTexture} />
        </mesh>
        
        <FinishWatcher
          active={raceActive}
          playerRef={playerRef}
          finishZ={finishZ}
          onFinish={handleFinish}
        />
        
        <StatsUpdater
          active={raceActive}
          playerRef={playerRef}
          opponentRefs={opponentRefs}
        />
        
        <CollisionWatcher
          active={raceActive}
          playerRef={playerRef}
          opponentRefs={opponentRefs}
          onCrash={handleCollision}
        />
        
        {gameStarted && (
          <>
            <Car 
              position={[0, 1, 0]} 
              color={selectedCar?.color || '#ff0000'} 
              isPlayer={true}
              carRef={playerRef}
              trackHalfWidth={14}
            />
            <OpponentCars
              count={levelData.opponents || 5}
              playerRef={playerRef}
              trackHalfWidth={14}
              active={raceActive}
              onCollision={handleCollision}
              refsContainer={opponentRefs}
            />
          </>
        )}
        
        {/* Controls for debugging (can be removed) */}
        {/* <OrbitControls /> */}
      </Canvas>
      
      {countdown !== null && (
        <div className="countdown-overlay">
          {/* Flash Effect */}
          <div className="countdown-flash"></div>

          {/* Vignette Pulse */}
          <div className="countdown-vignette"></div>

          {/* Rotating Outer Rings - Full Screen */}
          <div className="countdown-rotating-rings">
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-outer"></div>
          </div>

          {/* Screen Corner Effects */}
          <div className="countdown-screen-effects">
            <div className="screen-corner top-left"></div>
            <div className="screen-corner top-right"></div>
            <div className="screen-corner bottom-left"></div>
            <div className="screen-corner bottom-right"></div>
          </div>

          {/* Edge Particles */}
          <div className="edge-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`edge-${i}`}
                className="edge-particle"
                style={{
                  left: `${(i * 5) % 100}%`,
                  bottom: 0,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Progress Circle Fill */}
          <div className="countdown-progress-circle">
            <div className="progress-circle-bg"></div>
            <div className="progress-circle-fill"></div>
          </div>

          {/* Pulsing Rings */}
          <div className="countdown-rings">
            <div className="countdown-ring"></div>
            <div className="countdown-ring"></div>
            <div className="countdown-ring"></div>
          </div>

          {/* Center Particles */}
          <div className="countdown-particles">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: '50%',
                  top: '50%',
                  '--tx': `${Math.cos((i / 12) * Math.PI * 2) * 200}px`,
                  '--ty': `${Math.sin((i / 12) * Math.PI * 2) * 200}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Countdown Number */}
          <div className={`countdown-number ${countdown === 0 ? 'go' : ''}`}>
            {countdown === 0 ? 'GO!' : countdown}
          </div>

          {/* Label */}
          <div className="countdown-label">
            {countdown === 0 ? 'Race Started!' : 'Get Ready...'}
          </div>

          {/* Progress Bar */}
          <div className="countdown-progress-bar">
            <div className="countdown-progress-fill"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScene;
