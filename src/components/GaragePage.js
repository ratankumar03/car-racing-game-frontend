import React, { useState, useEffect } from 'react';
import { carAPI } from '../services/api';
import useGameStore from '../store/gameStore';
import '../styles/App.css';

const GaragePage = ({ player }) => {
  const { setShowMenu, setShowCustomization } = useGameStore();
  const [cars, setCars] = useState([]);
  const [modifications, setModifications] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    if (!player) {
      setShowCustomization(false);
      setShowMenu(true);
      return;
    }

    loadCars();
    loadModifications();
  }, [player, setShowCustomization, setShowMenu]);

  const loadCars = async () => {
    try {
      const response = await carAPI.list(player._id);
      const carsData = response.data;
      setCars(carsData);
      if (carsData.length > 0) {
        setSelectedCar(carsData.find(car => car.is_active) || carsData[0]);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  };

  const loadModifications = async () => {
    setModifications([]);
  };

  const handlePurchaseModification = async (modId) => {
    try {
      alert('Customization shop is not available yet.');
    } catch (error) {
      console.error('Error purchasing modification:', error);
      alert('Customization shop is not available yet.');
    }
  };

  if (!selectedCar) {
    return <div>Loading...</div>;
  }

  return (
    <div className="garage-page" style={{ padding: '20px', minHeight: '100vh' }}>
      <header className="header">
        <h1>🚗 Garage</h1>
        <div className="player-info">
          <span>Coins: {player.coins}</span>
        </div>
        <button
          onClick={() => {
            setShowCustomization(false);
            setShowMenu(true);
          }}
        >
          Back to Menu
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
        {/* Car Display */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '20px' }}>
          <h2>{selectedCar.name}</h2>
          <div style={{ marginTop: '20px' }}>
            <h3>Car Stats</h3>
            <div className="stat">Speed: {selectedCar.speed ?? 0}</div>
            <div className="stat">Acceleration: {selectedCar.acceleration ?? 0}</div>
            <div className="stat">Handling: {selectedCar.handling ?? 0}</div>
            <div className="stat">Braking: {selectedCar.braking ?? 0}</div>
            <div className="stat">Nitro Capacity: {selectedCar.nitro_capacity ?? selectedCar.nitro_power ?? 0}</div>
          </div>
        </div>

        {/* Modifications Shop */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '20px' }}>
          <h2>Modifications Shop</h2>
          {modifications.length === 0 ? (
            <p style={{ opacity: 0.8 }}>Customization shop coming soon.</p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {modifications.map((mod) => (
                <div
                  key={mod._id}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '10px',
                  }}
                >
                  <h3>{mod.name}</h3>
                  <p>{mod.description}</p>
                  <p>Type: {mod.type}</p>
                  <p>Cost: {mod.cost} coins</p>
                  <button onClick={() => handlePurchaseModification(mod._id)}>
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GaragePage;
