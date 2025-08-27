// routes/prescription.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temporary folder for uploaded files
const prescriptionController = require("../controllers/prescriptionController");
const { checkUploadStatus } = require('../controllers/prescriptionController');


// Original route for direct upload from the vending machine screen
router.post("/upload", upload.single("prescriptionImage"), prescriptionController.uploadPrescription);

// New route to get a unique upload URL for the QR code
router.get("/generate-upload-link", prescriptionController.generateUploadLink);

// New route to handle the image upload from a mobile device after scanning the QR
router.post("/mobile-upload", upload.single("image"), prescriptionController.handleMobileUpload);

router.get("/status", checkUploadStatus);

module.exports = router;