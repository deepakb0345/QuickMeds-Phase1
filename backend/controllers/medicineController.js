const Medicine2 = require("../models/Medicine");
const VendingMachine2 = require("../models/VendingMachine");
const { asyncHandler: ah } = require("../middleware/errorHandler");

// GET /api/medicines?machineId=...
const listMedicines = ah(async (req, res) => {
  const machineId = req.query.machineId;
  if (!machineId) {
    const all = await Medicine2.find().lean();
    return res.json({ scope: "global", medicines: all });
  }
  const machine = await VendingMachine2.findOne({ machineId }).populate(
    "stock.medicine"
  );
  if (!machine) return res.json({ scope: "machine", medicines: [] });

  const medicines = machine.stock.map((s) => ({
    id: s.medicine._id,
    name: s.medicine.name,
    dosage: s.medicine.dosage,
    price: s.medicine.price,
    quantity: s.quantity,
    lane: s.lane,
  }));

  res.json({ scope: "machine", medicines });
});

// PUT /api/medicines/:id/stock?machineId=... { quantity }
const updateStock = ah(async (req, res) => {
  const machineId = req.query.machineId;
  const medId = req.params.id;
  const { quantity } = req.body;
  if (!machineId) {
    res.status(400);
    throw new Error("machineId is required");
  }
  const machine = await VendingMachine2.findOne({ machineId });
  if (!machine) {
    res.status(404);
    throw new Error("Machine not found");
  }
  const slot = machine.stock.find((s) => s.medicine?.toString() === medId);
  if (!slot) {
    // if not present, add
    machine.stock.push({ medicine: medId, quantity: Number(quantity) || 0 });
  } else {
    slot.quantity = Number(quantity) || 0;
  }
  await machine.save();
  res.json({ ok: true });
});

module.exports = { listMedicines, updateStock };
