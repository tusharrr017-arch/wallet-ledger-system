const {depositToWallet}= require("../services/ledgerService");

const deposit =async (req,res)=>{
    try{
        const{walletId}= req.params;
        const{amount,reference_id}= req.body;

        if(!amount || !reference_id){
            return res.status(400).json({
                ok:false,
                message:"amount and reference_id are required",
            })
        }
        const result = await depositToWallet({
            walletId,
            amount,
            referenceId:reference_id,
        })
        return res.status(200).json({
            ok:true,
            message:result.duplicated
            ?"Deposit already processed"
            :"Deposit successful",
            ...result,
        });
    }catch(err){
        return res.status(500).json({
            ok:false,
            message: err.message,
        });
    }
}
module.exports= {deposit};