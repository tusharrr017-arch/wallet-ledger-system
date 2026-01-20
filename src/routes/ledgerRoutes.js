const express = require("express");
const {deposit,withdraw,getBalance}= require("../controllers/ledgerController");

const router = express.Router();
router.post("/wallets/:walletId/deposit",deposit);
router.post("/wallets/:walletId/withdraw", withdraw);
router.get("/wallets/:walletId/balance", getBalance);
module.exports = router;
