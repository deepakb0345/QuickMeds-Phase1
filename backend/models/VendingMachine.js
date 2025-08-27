const { Schema, model } = require("mongoose");

const vendingMachineSchema = new Schema(
  {
    machineId: { type: String, required: true, unique: true },
    password: { type: String },
    location: { type: String },
    stock: [
      {
        id: {
          type: String, // QMEDxx from master list
          ref: "Medicine", // optional reference for clarity
          required: true,
        },
        stock: { type: Number, default: 0 },
        lane: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("VendingMachine", vendingMachineSchema);
