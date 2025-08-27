const { Schema: Schema3, model: model3 } = require("mongoose");

const recognizedItemSchema = new Schema3(
  {
    name: String,
    dosage: String,
    instructions: String,
  },
  { _id: false }
);

const matchedMedicineSchema = new Schema3(
  {
    medicine: { type: Schema3.Types.ObjectId, ref: "Medicine" },
    available: Boolean,
    availableQuantity: { type: Number, default: 0 },
    price: Number,
  },
  { _id: false }
);

const prescriptionSchema = new Schema3(
  {
    machineId: { type: String },
    imageUrl: { type: String },
    recognized: [recognizedItemSchema],
    matched: [matchedMedicineSchema],
  },
  { timestamps: true }
);

module.exports = model3("Prescription", prescriptionSchema);
