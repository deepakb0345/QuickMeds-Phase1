const { Schema, model } = require("mongoose");

const medicineSchema = new Schema(
  {
    id: { type: String, required: true, unique: true }, // QMEDxx
    name: { type: String, required: true },
    brand: { type: String },
    type: { type: String }, // Tablet, Syrup, Capsule, Injection, etc.
    strength: { type: String },
    uses: { type: String },
    price: { type: Number, required: true },
    prescription_required: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Medicine", medicineSchema);
