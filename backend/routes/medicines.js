const express3 = require("express");
const router2 = express3.Router();
const {
  listMedicines,
  updateStock,
} = require("../controllers/medicineController");

router2.get("/", listMedicines);
router2.put("/:id/stock", updateStock);

module.exports = router2;
