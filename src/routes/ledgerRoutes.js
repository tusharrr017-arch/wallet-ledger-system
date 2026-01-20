const express = require("express");
const {deposit,withdraw,getBalance,applyYield,transactions}= require("../controllers/ledgerController");

const router = express.Router();
router.post("/wallets/:walletId/deposit",deposit);
router.post("/wallets/:walletId/withdraw", withdraw);
router.get("/wallets/:walletId/balance", getBalance);
router.post("/wallets/:walletId/yield", applyYield);
router.get("/wallets/:walletId/transactions", transactions);
module.exports = router;
