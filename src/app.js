const express = require("express");
const app = express();
app.use(express.json());

app.get("/health",(req,res)=>{
    return res.status(200).json({
        ok:true,
        message:"Wallet Ledger API running"
    });
});

module.exports = app;