// src/App.jsx

import { useState } from 'react';
import PrescriptionUploader from './components/PrescriptionUploader';
import MedicineList from './components/MedicineList';

function App() {
  const [matchedMedicines, setMatchedMedicines] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  const handlePrescriptionMatch = (data) => {
    // This function is called by PrescriptionUploader.jsx upon successful API response
    // It updates the state, which in turn causes the MedicineList component to render
    setMatchedMedicines(data.medicines);
    setTransactionId(data.transactionId);
  };

  return (
    <div className="App">
      {/* This is a conditional rendering block.
        If matchedMedicines is null (initial state), it shows the uploader.
        Once a successful upload occurs and handlePrescriptionMatch is called,
        matchedMedicines becomes a non-null array, and the MedicineList component is rendered instead.
      */}
      {!matchedMedicines ? (
        <PrescriptionUploader onPrescriptionMatch={handlePrescriptionMatch} />
      ) : (
        <MedicineList 
          medicines={matchedMedicines} 
          transactionId={transactionId} 
        />
      )}
    </div>
  );
}

export default App;