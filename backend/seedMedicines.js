// seedMedicinesVerbose.js
const mongoose = require("mongoose");
const Medicine = require("./models/Medicine");
const medicines = require("./medicine_master_list.json");
require("dotenv").config();

async function seedMedicines() {
  console.log("Original JSON file length:", Array.isArray(medicines) ? medicines.length : 'NOT AN ARRAY');

  // 🔥 DUPLICATE REMOVAL LOGIC (based on unique index name + dosage)
  const seen = new Set();
  const deduped = [];

  for (const m of medicines) {
    const name = (m.name || "").trim();
    const dosage = m.dosage === undefined || m.dosage === null ? "##NULL##" : String(m.dosage).trim();
    const key = `${name}||${dosage}`;

    if (!seen.has(key)) {
      deduped.push(m);
      seen.add(key);
    }
  }

  console.log("After removing duplicates:", deduped.length);

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Inspect indexes
    const indexes = await Medicine.collection.indexes();
    console.log("Medicine collection indexes:", indexes);

    // Clear existing data
    await Medicine.deleteMany({});
    console.log("Existing medicines cleared.");

    // Validate docs
    const validDocs = [];
    const invalidDocs = [];

    deduped.forEach((doc, i) => {
      const m = new Medicine(doc);
      const err = m.validateSync();
      if (err) {
        invalidDocs.push({ index: i, doc, errors: err.errors });
      } else {
        validDocs.push(doc);
      }
    });

    console.log("Valid docs count:", validDocs.length);
    console.log("Invalid docs count:", invalidDocs.length);

    if (invalidDocs.length > 0) {
      console.log("Sample invalid doc errors:", invalidDocs.slice(0, 5));
    }

    // Insert
    try {
      const res = await Medicine.insertMany(validDocs, { ordered: false });
      console.log("Inserted documents:", Array.isArray(res) ? res.length : 0);
    } catch (insertErr) {
      console.error("insertMany error:", insertErr.message);
      if (insertErr.writeErrors && insertErr.writeErrors.length) {
        console.error("writeErrors sample:", insertErr.writeErrors.slice(0,5).map(e => ({
          index: e.index, code: e.code, errmsg: e.errmsg, op: e.op && { id: e.op.id, name: e.op.name }
        })));
      }
    }

    const finalCount = await Medicine.countDocuments();
    console.log("Final DB count:", finalCount);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Fatal seeding error:", err);
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

seedMedicines();
