const mongoose = require("mongoose");
const VendingMachine = require("./models/VendingMachine");
const medicines = require("./medicine_master_list.json"); // your master list

require("dotenv").config();

async function seedVendingMachines() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing vending machines (optional)
    await VendingMachine.deleteMany({});
    console.log("Existing vending machines cleared.");

    // Create 3 sample vending machines
    const vendingMachines = ["VM001", "VM002", "VM003"].map((machineId) => {
      // Randomly pick 30 medicines for each machine
      const stock = medicines
        .sort(() => 0.5 - Math.random())
        .slice(0, 30)
        .map((med, index) => ({
          id: med.id,
          stock: Math.floor(Math.random() * 50) + 10, // 10–60 units
          lane: `A${index + 1}`,
        }));

      return {
        machineId,
        password: "vm@123",
        location: `Location for ${machineId}`,
        stock,
      };
    });

    await VendingMachine.insertMany(vendingMachines);
    console.log("✅ Vending Machines seeded with stock!");

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

seedVendingMachines();
