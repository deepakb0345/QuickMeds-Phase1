const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    machineId: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String },
        instructions: { type: String },
        id: { type: String }, // Optional: link to master list if matched later
      },
    ],
    createdAt: { type: Date, default: Date.now, expires: 600 },
    // expires after 10 minutes automatically
  },
  { timestamps: true }
);

module.exports = model("Transaction", transactionSchema);
