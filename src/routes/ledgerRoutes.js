const express = require("express");
const {deposit,withdraw,getBalance,applyYield}= require("../controllers/ledgerController");

const router = express.Router();
router.post("/wallets/:walletId/deposit",deposit);
router.post("/wallets/:walletId/withdraw", withdraw);
router.get("/wallets/:walletId/balance", getBalance);
router.post("/wallets/:walletId/yield", applyYield);
module.exports = router;
