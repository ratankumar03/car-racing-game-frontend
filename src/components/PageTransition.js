/**
 * 3D Page Transition Component
 */
import React from 'react';
import './PageTransition.css';

const PageTransition = ({ playerName }) => {
  return (
    <div className="page-transition">
      {/* Animated Background with Color Shift */}
      <div className="transition-cubes"></div>

      {/* Color Waves */}
      <div className="color-wave">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* Rotating 3D Cube */}
      <div className="cube-container">
        <div className="cube-face cube-front">🏁</div>
        <div className="cube-face cube-back">🏎️</div>
        <div className="cube-face cube-right">⚡</div>
        <div className="cube-face cube-left">🏆</div>
        <div className="cube-face cube-top">💨</div>
        <div className="cube-face cube-bottom">🔥</div>
      </div>

      {/* Glowing Rotating Rings */}
      <div className="glow-rings">
        <div className="glow-ring"></div>
        <div className="glow-ring"></div>
        <div className="glow-ring"></div>
      </div>

      {/* 3D Particles */}
      <div className="transition-particles">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="particle-3d"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--tx': `${(Math.random() - 0.5) * 400}px`,
              '--ty': `${(Math.random() - 0.5) * 400}px`,
              '--tz': `${(Math.random() - 0.5) * 400}px`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Welcome Text */}
      <div className="transition-text">
        <h1>Welcome {playerName}!</h1>
        <p>Get ready to race...</p>
      </div>

      {/* Loading Bar */}
      <div className="transition-loading">
        <div className="loading-fill"></div>
      </div>
    </div>
  );
};

export default PageTransition;
