/**
 * 3D Car Component with Physics
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';

const Car = ({
  position = [0, 1, 0],
  color = '#ff0000',
  isPlayer = false,
  carRef = null,
  trackHalfWidth = 13,
}) => {
  const internalRef = carRef || useRef();
  const { controls, selectedCar, nitroCount, useNitro, gamePaused, gameOver, controlsLocked } = useGameStore();
  
  const carSpecs = selectedCar || {
    speed: 100,
    acceleration: 100,
    handling: 100,
    nitro_power: 100,
  };
  
  // Car physics
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const speed = useRef(0);
  const nitroActive = useRef(false);
  const nitroTimer = useRef(0);
  
  useFrame((state, delta) => {
    if (!internalRef.current || !isPlayer || gamePaused || gameOver || controlsLocked) return;
    
    const car = internalRef.current;
    const maxSpeed = (carSpecs.speed / 100) * 40;
    const accelRate = (carSpecs.acceleration / 100) * 30;
    const turnSpeed = (carSpecs.handling / 100) * 12;
    
    // Handle nitro
    if (controls.nitro && nitroCount > 0 && !nitroActive.current) {
      nitroActive.current = true;
      nitroTimer.current = 2; // 2 seconds of nitro
      useNitro();
    }
    
    if (nitroActive.current) {
      nitroTimer.current -= delta;
      if (nitroTimer.current <= 0) {
        nitroActive.current = false;
      }
    }
    
    // Acceleration (forward/back)
    if (controls.forward) {
      speed.current = Math.min(speed.current + accelRate * delta, maxSpeed);
    } else if (controls.backward) {
      speed.current = Math.max(speed.current - accelRate * delta, -maxSpeed * 0.4);
    } else {
      // Friction
      speed.current *= 0.98;
    }
    
    // Nitro boost
    if (nitroActive.current) {
      speed.current = maxSpeed * 1.5;
    }
    
    // Steering (sideways movement)
    if (controls.left) {
      car.position.x -= turnSpeed * delta;
    }
    if (controls.right) {
      car.position.x += turnSpeed * delta;
    }
    
    // Brake
    if (controls.brake) {
      speed.current *= 0.9;
    }
    
    // Update position
    velocity.current.set(0, 0, -1).multiplyScalar(speed.current);
    car.position.addScaledVector(velocity.current, delta);
    
    // Keep car on track (simple boundary)
    car.position.x = Math.max(-trackHalfWidth, Math.min(trackHalfWidth, car.position.x));

    // Visual tilt
    const tiltTarget = controls.left ? 0.2 : controls.right ? -0.2 : 0;
    car.rotation.z = THREE.MathUtils.lerp(car.rotation.z, tiltTarget, 0.1);
  });
  
  return (
    <group ref={internalRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Main body */}
      <Box args={[2.4, 0.7, 5]} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.2}
          emissive={nitroActive.current ? '#00ffff' : '#000000'}
          emissiveIntensity={nitroActive.current ? 0.45 : 0}
        />
      </Box>

      {/* Front nose */}
      <Box args={[2.1, 0.5, 1.4]} position={[0, 0.2, 2.2]} castShadow>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(1.05)} metalness={0.85} roughness={0.22} />
      </Box>

      {/* Cabin */}
      <Box args={[1.5, 0.6, 1.6]} position={[0, 0.8, -0.4]} castShadow>
        <meshStandardMaterial
          color={new THREE.Color(color).multiplyScalar(0.6)}
          metalness={0.6}
          roughness={0.3}
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

      {/* Side intakes */}
      <Box args={[0.3, 0.25, 1.2]} position={[-1.1, 0.2, -0.6]} castShadow>
        <meshStandardMaterial color="#111" metalness={0.4} roughness={0.6} />
      </Box>
      <Box args={[0.3, 0.25, 1.2]} position={[1.1, 0.2, -0.6]} castShadow>
        <meshStandardMaterial color="#111" metalness={0.4} roughness={0.6} />
      </Box>

      {/* Diffuser */}
      <Box args={[2.2, 0.2, 0.6]} position={[0, -0.05, -2.7]} castShadow>
        <meshStandardMaterial color="#0b0b0b" metalness={0.4} roughness={0.7} />
      </Box>

      {/* Wheels */}
      <Sphere args={[0.45, 16, 16]} position={[-1.0, -0.35, 1.6]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.45, 16, 16]} position={[1.0, -0.35, 1.6]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.45, 16, 16]} position={[-1.0, -0.35, -1.8]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>
      <Sphere args={[0.45, 16, 16]} position={[1.0, -0.35, -1.8]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
      </Sphere>

      {/* Headlights */}
      <Sphere args={[0.18, 8, 8]} position={[-0.7, 0.1, 2.7]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </Sphere>
      <Sphere args={[0.18, 8, 8]} position={[0.7, 0.1, 2.7]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </Sphere>

      {/* Tail light strip */}
      <Box args={[1.6, 0.1, 0.2]} position={[0, 0.4, -2.55]}>
        <meshStandardMaterial color="#ff1a1a" emissive="#ff1a1a" emissiveIntensity={1} />
      </Box>

      {/* Exhausts */}
      <Sphere args={[0.12, 8, 8]} position={[-0.4, -0.05, -2.95]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </Sphere>
      <Sphere args={[0.12, 8, 8]} position={[0.4, -0.05, -2.95]}>
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </Sphere>

      {/* Nitro Flames */}
      {nitroActive.current && (
        <>
          <Sphere args={[0.3, 8, 8]} position={[-0.35, -0.2, -3.1]}>
            <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
          </Sphere>
          <Sphere args={[0.3, 8, 8]} position={[0.35, -0.2, -3.1]}>
            <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
          </Sphere>
        </>
      )}
    </group>
  );
};

export default Car;
