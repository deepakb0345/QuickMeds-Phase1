import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QrCode from 'react-qr-code';
import './PrescriptionUploader.css'; 

const PrescriptionUploader = ({ onPrescriptionMatch }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sessionId, setSessionId] = useState('');

  // 1️⃣ Effect to update date and time (runs once and sets up a timer)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000); 
    return () => clearInterval(timer);
  }, []);

  // 2️⃣ Effect to fetch QR URL (runs only ONCE on mount)
  useEffect(() => {
    const fetchQrUrl = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/prescriptions/generate-upload-link');
        setQrCodeUrl(response.data.uploadUrl);
        
        // Extract and store the unique session ID from the URL
        const urlParams = new URLSearchParams(response.data.uploadUrl.split('?')[1]);
        setSessionId(urlParams.get('id'));
      } catch (err) {
        console.error("Failed to fetch QR code URL:", err);
        setError("Failed to generate QR code. Please try again.");
      }
    };
    fetchQrUrl();
  }, []); // 👈 The empty dependency array ensures this runs only once

  // 3️⃣ Effect to start polling (runs only when sessionId is set)
  useEffect(() => {
    let pollingTimer;

    if (sessionId) {
      pollingTimer = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`http://localhost:4000/api/prescriptions/status?id=${sessionId}`);
          
          if (statusResponse.data.status === 'ready') {
            clearInterval(pollingTimer); // Stop polling
            onPrescriptionMatch(statusResponse.data.data); // Update state in App.jsx
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
        if (pollingTimer) {
            clearInterval(pollingTimer);
        }
    };
  }, [sessionId]); // 👈 This effect correctly runs only when sessionId changes


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/prescriptions/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      onPrescriptionMatch(response.data);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to process prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-uploader-page">
      {/* Header */}
      <header className="header-upload">
        <div className="logo-placeholder">QuickMeds.</div>
        <div className="date-time">{currentDateTime}</div>
      </header>

      {/* Main content area */}
      <div className="uploader-main-content">
        {/* Left Side: Steps */}
        <div className="steps-container">
          <div className="step-item current">
            <span className="step-number">1</span>
            <span className="step-text">Upload your Prescription</span>
          </div>
          <div className="step-item blurred">
            <span className="step-number">2</span>
            <span className="step-text">Select the Items</span>
          </div>
          <div className="step-item blurred">
            <span className="step-number">3</span>
            <span className="step-text">Checkout</span>
          </div>
        </div>

        {/* Right Side: Upload Area */}
        <div className="upload-container">
          <p className="upload-prompt">Scan this QR to upload</p>
          <div className="qr-placeholder">
            {qrCodeUrl ? (
              <QrCode value={qrCodeUrl} size={200} />
            ) : (
              <div className="qr-loading">Loading QR Code...</div>
            )}
          </div>
          <div className="or-divider">OR</div>
          <label htmlFor="file-upload" className="custom-file-upload">
            <input 
              id="file-upload"
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            {loading ? 'Processing...' : 'Upload Physical Copy'}
          </label>
          {file && <p className="file-name">{file.name} selected.</p>}
          {error && <p className="error-message">{error}</p>}
          {file && (
            <button onClick={handleUpload} className="submit-button">
              Confirm Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUploader;