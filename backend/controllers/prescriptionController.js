// controllers/prescriptionController.js

const Transaction = require("../models/Transaction");
const VendingMachine = require("../models/VendingMachine");
const Medicine = require("../models/Medicine");
const { v4: uuidv4 } = require("uuid");
const Fuse = require("fuse.js");
const { queryLLaMAWithImage } = require("../utils/openRouter");
const matchStock = require("../utils/matchStock");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// A map to temporarily store unique IDs and link them to sessions.
// In a production environment, use a database or Redis for this.
const uploadSessions = new Map();

// --------------------- Original Upload Prescription (with machineId from body) ---------------------
exports.uploadPrescription = async (req, res) => {
  try {
    const { machineId } = req.body;
    const prescriptionImage = req.file;

    if (!machineId || !prescriptionImage) {
      return res.status(400).json({ error: "Machine ID and prescription image required" });
    }

    // Process the image and return the matched medicines
    const transactionResult = await processImageAndMatch(prescriptionImage, machineId);
    return res.status(200).json(transactionResult);
  } catch (err) {
    console.error("Error in uploadPrescription:", err);
    return res.status(500).json({ error: "Failed to process prescription" });
  }
};

// --------------------- New Function: Generate Upload Link ---------------------
exports.generateUploadLink = async (req, res) => {
  const uniqueId = uuidv4();
  const yourIpAddress = "192.168.1.7";
  const uploadUrl = `http://${yourIpAddress}:4000/mobile_upload.html?id=${uniqueId}`;
  
  // Store the ID to validate the subsequent mobile upload request
  uploadSessions.set(uniqueId, { status: "pending", timestamp: Date.now() });

  res.status(200).json({ uploadUrl });
};

// --------------------- New Function: Handle Mobile Upload ---------------------
exports.handleMobileUpload = async (req, res) => {
  const { id } = req.query;
  const prescriptionImage = req.file;

  if (!id || !uploadSessions.has(id)) {
    return res.status(400).json({ message: 'Invalid or expired upload session.' });
  }
  
  if (!prescriptionImage) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const transactionResult = await processImageAndMatch(prescriptionImage);
    
    // Store the result in the session map for polling
    uploadSessions.set(id, { status: "ready", data: transactionResult });

    // Send a 200 OK to the mobile client
    res.status(200).json({ message: 'Upload successful. You can now return to the machine.' });

  } catch (err) {
    console.error("Mobile upload process failed:", err);
    res.status(500).json({ message: err.message || 'Internal server error during upload and processing.' });
  }
};

// --------------------- New Function: Check Upload Status (for polling) ---------------------
exports.checkUploadStatus = (req, res) => {
    const { id } = req.query;

    if (uploadSessions.has(id)) {
        const session = uploadSessions.get(id);
        if (session.status === 'ready') {
            const resultData = session.data;
            uploadSessions.delete(id); // Clean up the session
            return res.status(200).json({ status: 'ready', data: resultData });
        } else {
            return res.status(200).json({ status: 'pending' });
        }
    } else {
        return res.status(404).json({ status: 'not-found' });
    }
};

// --------------------- Helper Function to Avoid Code Duplication ---------------------
// controllers/prescriptionController.js

// ... (your existing code and imports)

const processImageAndMatch = async (prescriptionImage, machineId) => {
  const result = await cloudinary.uploader.upload(prescriptionImage.path, {
    folder: "quickmeds/prescriptions",
  });
  const prescriptionImageUrl = result.secure_url;
  
  fs.unlinkSync(prescriptionImage.path);

  const promptText = `
Extract all the medicines from this prescription image.
Return strictly as a JSON array in the following format:

[
  { "name": "medicine_name", "dosage": "xx mg" },
]

Do NOT include any explanations or extra text. Only valid JSON.
`;

  const llmResponse = await queryLLaMAWithImage(
    prescriptionImageUrl,
    promptText
  );

  // 1️⃣ Log the raw response from the LLM
  console.log("LLM Raw Response:", llmResponse);

  let recognizedMedicines;
  try {
    recognizedMedicines = llmResponse;
    // 2️⃣ Log the parsed result if successful
    console.log("Parsed Medicines (Success):", recognizedMedicines);
  } catch (err) {
    console.error("Failed to parse AI output. Raw response was not valid JSON:", llmResponse);
    recognizedMedicines = [];
  }
  
  if (!machineId) {
    machineId = "VM001";
  }

  const transaction = await Transaction.create({
    transactionId: uuidv4(),
    machineId,
    medicines: recognizedMedicines,
  });

  const transactionWithStock = await matchStock(transaction.transactionId);

  return transactionWithStock;
};
