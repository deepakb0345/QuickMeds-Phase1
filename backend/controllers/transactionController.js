const Transaction = require("../models/Transaction");
const Medicine3 = require("../models/Medicine");
const VendingMachine3 = require("../models/VendingMachine");
const { asyncHandler: ah2 } = require("../middleware/errorHandler");

// POST /api/transactions { machineId, prescriptionId?, items:[{medicine, quantity}] }
const createTransaction = ah2(async (req, res) => {
  const { machineId, prescriptionId, items } = req.body;
  if (!machineId || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("machineId and items are required");
  }

  // Price lookup and total
  const fullItems = [];
  let total = 0;
  for (const it of items) {
    const med = await Medicine3.findById(it.medicine);
    if (!med) {
      res.status(400);
      throw new Error("Invalid medicine in items");
    }
    const qty = Number(it.quantity) || 1;
    const price = med.price;
    total += qty * price;
    fullItems.push({ medicine: med._id, quantity: qty, price });
  }

  const trx = await Transaction.create({
    machineId,
    prescription: prescriptionId || null,
    items: fullItems,
    totalAmount: total,
  });
  res
    .status(201)
    .json({
      id: trx._id,
      totalAmount: total,
      paymentStatus: trx.paymentStatus,
    });
});

// PUT /api/transactions/:id/pay
const markPaidAndDispense = ah2(async (req, res) => {
  const { id } = req.params;
  const trx = await Transaction.findById(id);
  if (!trx) {
    res.status(404);
    throw new Error("Transaction not found");
  }
  trx.paymentStatus = "paid";
  await trx.save();

  // Decrement stock in the vending machine
  const machine = await VendingMachine3.findOne({ machineId: trx.machineId });
  if (machine) {
    for (const it of trx.items) {
      const slot = machine.stock.find(
        (s) => s.medicine?.toString() === it.medicine.toString()
      );
      if (slot) slot.quantity = Math.max(0, (slot.quantity || 0) - it.quantity);
    }
    await machine.save();
  }

  // TODO: Trigger GPIO/Motor control on Raspberry Pi here
  // e.g., publish to MQTT topic or call local Python service

  res.json({ ok: true, paymentStatus: "paid" });
});

module.exports = { createTransaction, markPaidAndDispense };
