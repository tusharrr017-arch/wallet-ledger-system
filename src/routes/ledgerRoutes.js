const express = require("express");
const {deposit}= require("../controllers/ledgerController");

const router = express.Router();
router.post("/wallets/:walletId/deposit",deposit);
module.exports = router;
