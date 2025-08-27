const mongoose = require("mongoose");
const Medicine = require("./models/Medicine");
const medicines = require("./medicine_master_list.json"); // your 150 medicines JSON

require("dotenv").config();

async function seedMedicines() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing medicines (optional)
    await Medicine.deleteMany({});
    console.log("Existing medicines cleared.");

    // Insert master list
    await Medicine.insertMany(medicines);
    console.log("✅ Master Medicine List seeded!");

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

seedMedicines();
