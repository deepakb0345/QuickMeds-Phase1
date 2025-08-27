const express4 = require("express");
const router3 = express4.Router();
const {
  createTransaction,
  markPaidAndDispense,
} = require("../controllers/transactionController");

router3.post("/", createTransaction);
router3.put("/:id/pay", markPaidAndDispense);

module.exports = router3;
