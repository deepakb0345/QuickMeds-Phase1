// src/components/MedicineList.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './MedicineList.css';

const MedicineList = ({ medicines, transactionId }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [dispensingStatus, setDispensingStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (medicineId, change) => {
    setSelectedItems(prevItems => {
      const newQuantity = (prevItems[medicineId] || 0) + change;
      if (newQuantity <= 0) {
        const newItems = { ...prevItems };
        delete newItems[medicineId];
        return newItems;
      }
      return {
        ...prevItems,
        [medicineId]: newQuantity,
      };
    });
  };

  const handleDispense = async () => {
    setLoading(true);
    setDispensingStatus('Processing your order...');
    
    // Create the payload for the backend
    const dispensingPayload = {
      transactionId,
      medicines: Object.keys(selectedItems).map(id => ({
        id,
        quantity: selectedItems[id],
      })),
    };

    try {
      const response = await axios.post(
        'http://localhost:4000/api/vending-machines/YOUR_MACHINE_ID/dispense', 
        dispensingPayload
      );
      
      setDispensingStatus('Success! Please collect your medicines.');
      console.log('Dispensing successful:', response.data);

    } catch (err) {
      console.error('Dispensing failed:', err);
      setDispensingStatus('Dispensing failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = medicines.reduce((total, med) => {
    const quantity = selectedItems[med.id] || 0;
    return total + (med.price * quantity);
  }, 0);

  return (
    <div className="medicine-list-container">
      <header className="header-list">
        <div className="logo-placeholder">QuickMeds.</div>
      </header>
      
      <div className="list-main-content">
        <div className="steps-container-list">
          <div className="step-item completed">
            <span className="step-number">1</span>
            <span className="step-text">Upload your Prescription</span>
          </div>
          <div className="step-item current">
            <span className="step-number">2</span>
            <span className="step-text">Select the Items</span>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <span className="step-text">Checkout</span>
          </div>
        </div>

        <div className="items-container">
          <h2>Items in the Prescription:</h2>
          <div className="med-grid">
            {medicines.map(med => (
              <div key={med.id} className={`med-card ${med.stock === 0 ? 'out-of-stock' : ''}`}>
                <div className="med-info">
                  <h3>{med.name}</h3>
                  <p className="med-brand">{med.brand}</p>
                  <p className="med-strength">{med.strength}</p>
                </div>
                <div className="med-actions">
                  <p className="med-price">₹{med.price}</p>
                  <p className="med-stock">{med.stock > 0 ? `${med.stock} in stock` : 'Out of Stock'}</p>
                  <div className="quantity-control">
                    <button 
                      onClick={() => handleQuantityChange(med.id, -1)} 
                      disabled={loading || !selectedItems[med.id]}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-count">{selectedItems[med.id] || 0}</span>
                    <button 
                      onClick={() => handleQuantityChange(med.id, 1)} 
                      disabled={loading || med.stock <= (selectedItems[med.id] || 0)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary">
            <p className="total-label">Total:</p>
            <p className="total-cost">₹{totalCost}</p>
            <button 
              onClick={handleDispense} 
              disabled={loading || totalCost === 0}
              className="checkout-button"
            >
              {loading ? 'Processing...' : 'Checkout →'}
            </button>
          </div>
          {dispensingStatus && (
            <p className="dispensing-status">{dispensingStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineList;