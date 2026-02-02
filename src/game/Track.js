/**
 * 3D Track Component with Environment
 */
import React, { useMemo } from 'react';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Track = ({ levelData }) => {
  const trackLength = levelData?.track_length || 5000;
  const environment = levelData?.environment || {};
  const levelName = (levelData?.name || '').toLowerCase();
  const levelNumber = levelData?.level_number || 1;
  const obstacles = environment.obstacles || [];
  const isMountainRoad =
    obstacles.includes('cliffs') ||
    obstacles.includes('rocks') ||
    levelName.includes('mountain') ||
    levelName.includes('hill') ||
    levelName.includes('hilly') ||
    levelName.includes('path');
  const isCityRoad =
    obstacles.includes('buildings') ||
    levelName.includes('city') ||
    levelName.includes('street');
  const isCityEasy = isCityRoad && levelNumber === 1;
  
  // Generate track segments
  const trackSegments = Math.floor(trackLength / 100);
  const trackZOffset = -trackSegments * 5;
  
  // Colors based on time of day
  const getSkyColor = () => {
    switch (environment.time_of_day) {
      case 'day': return '#87CEEB';
      case 'afternoon': return '#FFA07A';
      case 'evening': return '#FF6347';
      case 'sunset': return '#FF4500';
      case 'night': return '#191970';
      default: return '#87CEEB';
    }
  };
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const treePositions = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const side = i % 2 === 0 ? -20 : 20;
      const z = trackZOffset + (i / 50) * trackLength;
      const offset = (pseudoRandom(i * 7.13) - 0.5) * 5;
      return { x: side + offset, z };
    });
  }, [trackLength, trackZOffset]);

  const buildingPositions = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const side = i % 2 === 0 ? -25 : 25;
      const z = trackZOffset + (i / 30) * trackLength;
      const height = 5 + pseudoRandom(i * 3.77) * 10;
      return { x: side, z, height };
    });
  }, [trackLength, trackZOffset]);

  return (
    <>
      {/* Start Road Segment (always visible) */}
      {!isMountainRoad && (
        <>
          <Box
            args={[40, 0.12, 90]}
            position={[0, 0, -25]}
            receiveShadow
          >
            <meshStandardMaterial
              color="#1f1f1f"
              roughness={0.7}
              metalness={0.2}
              emissive="#101010"
              emissiveIntensity={0.2}
            />
          </Box>
          {/* Center line */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Box
              key={`start-center-${i}`}
              args={[0.4, 0.12, 6]}
              position={[0, 0.08, -12 - i * 10]}
            >
              <meshStandardMaterial color="#f4d03f" emissive="#f6c343" emissiveIntensity={0.5} />
            </Box>
          ))}
          {/* Lane lines */}
          {[-7, 7].map((x, idx) =>
            Array.from({ length: 7 }).map((_, i) => (
              <Box
                key={`start-lane-${idx}-${i}`}
                args={[0.3, 0.12, 6]}
                position={[x, 0.08, -12 - i * 10]}
              >
                <meshStandardMaterial color="#e6e6e6" emissive="#bfbfbf" emissiveIntensity={0.35} />
              </Box>
            ))
          )}
        </>
      )}

      {/* Hill Road Start (for mountain/hill levels) */}
      {isMountainRoad &&
        Array.from({ length: 9 }).map((_, i) => {
          const z = -90 + i * 10;
          const y = Math.sin((i + 2) * 0.5) * 1.2;
          const tilt = Math.sin((i + 2) * 0.5) * 0.06;
          return (
            <React.Fragment key={`hill-start-${i}`}>
              <Box
                args={[40, 0.2, 10]}
                position={[0, y, z]}
                rotation={[tilt, 0, 0]}
                receiveShadow
              >
                <meshStandardMaterial
                  color="#2f2f2f"
                  roughness={0.7}
                  metalness={0.2}
                  emissive="#101010"
                  emissiveIntensity={0.2}
                />
              </Box>
              <Box
                args={[0.4, 0.12, 6]}
                position={[0, y + 0.12, z]}
                rotation={[tilt, 0, 0]}
              >
                <meshStandardMaterial color="#f4d03f" emissive="#f6c343" emissiveIntensity={0.5} />
              </Box>
              {[-7, 7].map((x) => (
                <Box
                  key={`hill-start-lane-${i}-${x}`}
                  args={[0.3, 0.12, 6]}
                  position={[x, y + 0.12, z]}
                  rotation={[tilt, 0, 0]}
                >
                  <meshStandardMaterial color="#e6e6e6" emissive="#bfbfbf" emissiveIntensity={0.35} />
                </Box>
              ))}
            </React.Fragment>
          );
        })}

      {/* Road */}
      {!isMountainRoad && !isCityEasy && (
        <>
          <Box 
            args={[40, 0.1, trackSegments * 10]} 
            position={[0, 0, trackZOffset]} 
            receiveShadow
          >
            <meshStandardMaterial 
              color="#1f1f1f" 
              roughness={0.7}
              metalness={0.2}
              emissive="#101010"
              emissiveIntensity={0.2}
            />
          </Box>
          
          {/* Road Lines */}
          {Array.from({ length: trackSegments }).map((_, i) => (
            <React.Fragment key={`lane-set-${i}`}>
              <Box 
                args={[0.4, 0.11, 8]} 
                position={[0, 0.06, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color="#f4d03f" emissive="#f6c343" emissiveIntensity={0.5} />
              </Box>
              <Box 
                args={[0.3, 0.11, 8]} 
                position={[-7, 0.06, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color="#e6e6e6" emissive="#bfbfbf" emissiveIntensity={0.35} />
              </Box>
              <Box 
                args={[0.3, 0.11, 8]} 
                position={[7, 0.06, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color="#e6e6e6" emissive="#bfbfbf" emissiveIntensity={0.35} />
              </Box>
            </React.Fragment>
          ))}
        </>
      )}

      {/* Hill Road */}
      {isMountainRoad &&
        Array.from({ length: trackSegments }).map((_, i) => {
          const z = trackZOffset + i * 10 + 5;
          const wave = Math.sin(i * 0.35);
          const y = wave * 1.5;
          const tilt = wave * 0.08;
          return (
            <React.Fragment key={`hill-road-${i}`}>
              <Box 
                args={[40, 0.2, 10]} 
                position={[0, y, z]} 
                rotation={[tilt, 0, 0]}
                receiveShadow
              >
                <meshStandardMaterial 
                  color="#2f2f2f" 
                  roughness={0.7}
                  metalness={0.2}
                  emissive="#101010"
                  emissiveIntensity={0.2}
                />
              </Box>
              <Box 
                args={[0.4, 0.11, 8]} 
                position={[0, y + 0.12, z]}
                rotation={[tilt, 0, 0]}
              >
                <meshStandardMaterial color="#f4d03f" emissive="#f6c343" emissiveIntensity={0.5} />
              </Box>
              <Box 
                args={[0.3, 0.11, 8]} 
                position={[-7, y + 0.12, z]}
                rotation={[tilt, 0, 0]}
              >
                <meshStandardMaterial color="#e6e6e6" emissive="#bfbfbf" emissiveIntensity={0.35} />
              </Box>
              <Box 
                args={[0.3, 0.11, 8]} 
                position={[7, y + 0.12, z]}
                rotation={[tilt, 0, 0]}
              >
                <meshStandardMaterial color="#e6e6e6" emissive="#bfbfbf" emissiveIntensity={0.35} />
              </Box>
            </React.Fragment>
          );
        })}

      {/* City Easy Pixel Road */}
      {isCityEasy && (
        <>
          <Box 
            args={[32, 0.1, trackSegments * 10]} 
            position={[0, 0, trackZOffset]} 
            receiveShadow
          >
            <meshStandardMaterial color="#6b6b6b" roughness={0.9} />
          </Box>
          
          {Array.from({ length: trackSegments }).map((_, i) => (
            <React.Fragment key={`pixel-road-${i}`}>
              <Box 
                args={[32, 0.11, 10]} 
                position={[0, 0.06, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color={i % 2 === 0 ? '#7a7a7a' : '#5f5f5f'} />
              </Box>
              {/* Center dashed line */}
              <Box 
                args={[0.4, 0.12, 6]} 
                position={[0, 0.08, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color="#ffffff" />
              </Box>
              {/* Red/White edges */}
              <Box 
                args={[1, 0.12, 10]} 
                position={[-16, 0.08, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color={i % 2 === 0 ? '#ff4d4d' : '#ffffff'} />
              </Box>
              <Box 
                args={[1, 0.12, 10]} 
                position={[16, 0.08, trackZOffset + i * 10 + 5]}
              >
                <meshStandardMaterial color={i % 2 === 0 ? '#ff4d4d' : '#ffffff'} />
              </Box>
            </React.Fragment>
          ))}
        </>
      )}
      
      {/* Guardrails */}
      {Array.from({ length: trackSegments }).map((_, i) => (
        <React.Fragment key={`rail-${i}`}>
          <Box 
            args={[0.4, 0.6, 10]} 
            position={[-18.5, 0.6, trackZOffset + i * 10 + 5]}
            receiveShadow
            castShadow
          >
            <meshStandardMaterial 
              color="#b0b0b0" 
              metalness={0.7}
              roughness={0.3}
              emissive="#1b1b1b"
              emissiveIntensity={0.2}
            />
          </Box>
          <Box 
            args={[0.4, 0.6, 10]} 
            position={[18.5, 0.6, trackZOffset + i * 10 + 5]}
            receiveShadow
            castShadow
          >
            <meshStandardMaterial 
              color="#b0b0b0" 
              metalness={0.7}
              roughness={0.3}
              emissive="#1b1b1b"
              emissiveIntensity={0.2}
            />
          </Box>
        </React.Fragment>
      ))}
      
      {/* Trees */}
      {obstacles.includes('trees') && 
        treePositions.map((pos, i) => {
          return (
            <group key={`tree-${i}`} position={[pos.x, 0, pos.z]}>
              {/* Trunk */}
              <Cylinder args={[0.3, 0.4, 3, 8]} position={[0, 1.5, 0]} castShadow>
                <meshStandardMaterial color="#4a2511" roughness={0.9} emissive="#1a0d06" emissiveIntensity={0.15} />
              </Cylinder>
              {/* Foliage */}
              <Sphere args={[2, 8, 8]} position={[0, 4, 0]} castShadow>
                <meshStandardMaterial color="#228b22" roughness={0.8} emissive="#0b3d0b" emissiveIntensity={0.2} />
              </Sphere>
            </group>
          );
        })
      }
      
      {/* Buildings */}
      {isCityRoad && 
        buildingPositions.map((b, i) => {
          return (
            <Box 
              key={`building-${i}`}
              args={[8, b.height, 8]} 
              position={[b.x, b.height / 2, b.z]}
              castShadow
            >
              <meshStandardMaterial 
                color={new THREE.Color().setHSL(0.6, 0.15, 0.35 + Math.random() * 0.3)} 
                emissive={new THREE.Color().setHSL(0.12, 0.6, 0.2 + Math.random() * 0.2)}
                emissiveIntensity={0.25}
              />
            </Box>
          );
        })
      }

      {/* City Street Lights */}
      {isCityRoad &&
        Array.from({ length: 20 }).map((_, i) => {
          const side = i % 2 === 0 ? -18 : 18;
          const z = trackZOffset + i * (trackLength / 20);
          return (
            <group key={`streetlight-${i}`} position={[side, 0, z]}>
              <Cylinder args={[0.2, 0.2, 6, 8]} position={[0, 3, 0]} castShadow>
                <meshStandardMaterial color="#444444" />
              </Cylinder>
              <Sphere args={[0.5, 8, 8]} position={[0, 6.2, 0]}>
                <meshStandardMaterial color="#fff2b2" emissive="#fff2b2" emissiveIntensity={0.6} />
              </Sphere>
            </group>
          );
        })}

      {/* Mountain Walls Along Road */}
      {isMountainRoad &&
        Array.from({ length: trackSegments }).map((_, i) => (
          <React.Fragment key={`mountain-wall-${i}`}>
            <Box
              args={[6, 6, 10]}
              position={[-19, 3, trackZOffset + i * 10 + 5]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c5c5c" roughness={0.9} emissive="#1a1a1a" emissiveIntensity={0.15} />
            </Box>
            <Box
              args={[6, 6, 10]}
              position={[19, 3, trackZOffset + i * 10 + 5]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c5c5c" roughness={0.9} emissive="#1a1a1a" emissiveIntensity={0.15} />
            </Box>
          </React.Fragment>
        ))}

      {/* Mountain Scenery */}
      {isMountainRoad &&
        Array.from({ length: 28 }).map((_, i) => {
          const side = i % 2 === 0 ? -40 : 40;
          const z = trackZOffset + (i / 28) * trackLength;
          const height = 20 + Math.random() * 30;
          const radius = 12 + Math.random() * 12;
          return (
            <group key={`mountain-${i}`} position={[side, 0, z]}>
              <Cylinder args={[0, radius, height, 6]} position={[0, height / 2, 0]} castShadow>
                <meshStandardMaterial color="#6b6b6b" roughness={0.9} emissive="#1a1a1a" emissiveIntensity={0.15} />
              </Cylinder>
              <Cylinder args={[0, radius * 0.7, height * 0.6, 6]} position={[4, height * 0.3, 4]} castShadow>
                <meshStandardMaterial color="#7a5f3d" roughness={0.95} emissive="#1a120a" emissiveIntensity={0.15} />
              </Cylinder>
            </group>
          );
        })}
      
      {/* Ground (grass/desert/etc) */}
      <Box 
        args={[200, 0.1, trackSegments * 10]} 
        position={[0, -0.1, trackZOffset]} 
        receiveShadow
      >
        <meshStandardMaterial 
          color={
            isMountainRoad
              ? '#4b4a3c'
              : environment.weather === 'sandstorm'
                ? '#c2b280'
                : '#2d5016'
          } 
          roughness={1}
          emissive="#0d0d0d"
          emissiveIntensity={0.1}
        />
      </Box>
    </>
  );
};

export default Track;
