const Fuse = require("fuse.js");
const Transaction = require("../models/Transaction");
const VendingMachine = require("../models/VendingMachine");
const Medicine = require("../models/Medicine");

/**
 * Match transaction medicines with master medicine list and vending machine stock
 * @param {string} transactionId - ID of the transaction to process
 * @returns {Object} - { transactionId, medicines: [ { id, name, brand, type, strength, price, prescription_required, stock, lane, dosage } ] }
 */
async function matchStock(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");

  // 1️⃣ Get transaction
  const transaction = await Transaction.findOne({
    transactionId: transactionId.trim(),
  });

  if (!transaction) throw new Error("Transaction not found");

  // 2️⃣ Get vending machine
  const vendingMachine = await VendingMachine.findOne({
    machineId: transaction.machineId,
  });

  if (!vendingMachine) throw new Error("Vending machine not found");

  // 3️⃣ Fuse.js setup for fuzzy matching
  const allMedicines = await Medicine.find({});
  const fuse = new Fuse(allMedicines, {
    keys: ["name", "brand"],
    threshold: 0.4,
    ignoreLocation: true,
    distance: 100,
    minMatchCharLength: 2,
  });

  // 4️⃣ Match each medicine and filter out non-matches
  const medicinesWithStock = transaction.medicines.flatMap((med) => {
    const result = fuse.search(med.name);
    const masterMed = result.length > 0 ? result[0].item : null;

    // If no match is found, return an empty array to flatMap
    if (!masterMed) {
      console.log(`No master list match found for: ${med.name}`);
      return [];
    }

    let stockInfo = vendingMachine.stock.find((s) => s.id === masterMed.id);

    // If no stock is found, default to 0 and null
    if (!stockInfo) {
      stockInfo = { stock: 0, lane: null };
    }

    return [{
      id: masterMed.id,
      name: masterMed.name,
      brand: masterMed.brand,
      type: masterMed.type,
      strength: masterMed.strength,
      price: masterMed.price,
      prescription_required: masterMed.prescription_required,
      stock: stockInfo.stock,
      lane: stockInfo.lane,
      dosage: med.dosage || masterMed.strength, // Use dosage from transaction if present, otherwise from master
    }];
  });

  return {
    transactionId: transaction.transactionId,
    medicines: medicinesWithStock,
  };
}

module.exports = matchStock;