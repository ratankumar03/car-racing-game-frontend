/**
 * AI Opponent Cars
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const OpponentCar = ({
  position,
  color,
  speed = 6,
  laneOffset = 0,
  playerRef,
  active = true,
  onCollision,
  collisionRadius = 1.6,
  opRef,
}) => {
  const carRef = opRef || useRef();
  
  useFrame((state, delta) => {
    if (!carRef.current || !active) return;
    
    const car = carRef.current;
    
    // Move forward along the track (negative Z)
    car.position.z -= speed * delta;
    
    // Simple lane weaving
    const time = state.clock.getElapsedTime();
    car.position.x = laneOffset + Math.sin(time * 0.5) * 1.5;
    
    // Reset position if car goes too far
    if (playerRef?.current) {
      const playerZ = playerRef.current.position.z;
      if (car.position.z > playerZ + 30) {
        car.position.z = playerZ - (80 + Math.random() * 200);
      }
      
      if (onCollision) {
        const dx = car.position.x - playerRef.current.position.x;
        const dz = car.position.z - playerRef.current.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq <= collisionRadius * collisionRadius) {
          onCollision();
        }
      }
    } else if (car.position.z > 50) {
      car.position.z = -500;
    }
  });
  
  return (
    <group ref={carRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Main body */}
      <Box args={[2.4, 0.7, 5]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.85} 
          roughness={0.25}
          emissive={new THREE.Color(color).multiplyScalar(0.2)}
          emissiveIntensity={0.25}
        />
      </Box>
      
      {/* Front nose */}
      <Box args={[2.1, 0.5, 1.4]} position={[0, 0.2, 2.2]} castShadow>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(1.05)} metalness={0.8} roughness={0.25} />
      </Box>
      
      {/* Cabin */}
      <Box args={[1.5, 0.6, 1.6]} position={[0, 0.8, -0.4]} castShadow>
        <meshStandardMaterial 
          color={new THREE.Color(color).multiplyScalar(0.7)} 
          metalness={0.6} 
          roughness={0.35}
          emissive={new THREE.Color(color).multiplyScalar(0.15)}
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Rear deck */}
      <Box args={[2.1, 0.35, 1.4]} position={[0, 0.5, -2.1]} castShadow>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.9)} metalness={0.8} roughness={0.25} />
      </Box>
      
      {/* Spoiler */}
      <Box args={[2.6, 0.15, 0.5]} position={[0, 0.95, -2.7]} castShadow>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.8)} metalness={0.8} roughness={0.25} />
      </Box>
      
      {/* Wheels */}
      <Sphere args={[0.45, 16, 16]} position={[-1.0, -0.35, 1.6]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.45, 16, 16]} position={[1.0, -0.35, 1.6]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.45, 16, 16]} position={[-1.0, -0.35, -1.8]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.45, 16, 16]} position={[1.0, -0.35, -1.8]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      
      {/* Tail light strip */}
      <Box args={[1.6, 0.1, 0.2]} position={[0, 0.4, -2.55]}>
        <meshStandardMaterial color="#ff1a1a" emissive="#ff1a1a" emissiveIntensity={0.9} />
      </Box>
      
      {/* Exhausts */}
      <Sphere args={[0.12, 8, 8]} position={[-0.4, -0.05, -2.95]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </Sphere>
      <Sphere args={[0.12, 8, 8]} position={[0.4, -0.05, -2.95]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </Sphere>
    </group>
  );
};

const OpponentCars = ({
  count = 5,
  playerRef,
  trackHalfWidth = 14,
  active = true,
  onCollision,
  refsContainer,
}) => {
  const colors = ['#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493'];
  const opponentRefs = useMemo(
    () => Array.from({ length: count }, () => React.createRef()),
    [count]
  );
  const lanes = useMemo(() => {
    const base = [-10, -5, 0, 5, 10];
    return base.filter((lane) => Math.abs(lane) <= trackHalfWidth);
  }, [trackHalfWidth]);
  
  useEffect(() => {
    if (refsContainer) {
      refsContainer.current = opponentRefs;
    }
  }, [refsContainer, opponentRefs]);
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const laneOffset = lanes[i % lanes.length] ?? 0;
        const startZ = -50 - (i * 35);
        const speed = 6 + Math.random() * 3;
        
        const opRef = opponentRefs[i];
        return (
          <OpponentCar
            key={`opponent-${i}`}
            position={[laneOffset, 1, startZ]}
            color={colors[i % colors.length]}
            speed={speed}
            laneOffset={laneOffset}
            playerRef={playerRef}
            active={active}
            onCollision={onCollision}
            opRef={opRef}
          />
        );
      })}
    </>
  );
};

export default OpponentCars;
