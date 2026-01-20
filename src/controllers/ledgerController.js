const {depositToWallet ,withdrawFromWallet ,getWalletBalance , applyDailyYield}= require("../services/ledgerService");

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
const withdraw =async(req,res)=>{
    try{
        const{walletId}=req.params;
        const{amount,reference_id}= req.body;
        if(!amount || !reference_id){
            return res.status(400).json({
                ok:false,
                message:"amount and reference_id are required",
            });
        }
        const result = await withdrawFromWallet({
            walletId,amount,referenceId:reference_id,
        });
        if(result.ok === false){
            return res.status(400).json({
                ok:false,
                message:result.message,
            });
        }
        return res.status(200).json({
            ok:true,
            message:result.duplicated
            ?"Withdrawal already processed"
            :"Withdrawal succesful",
            ...result,
        });
    }catch(err){
        return res.status(400).json({
            ok:false,
            message:err.message,
        });
    }
}
const getBalance = async (req, res) => {
  try {
    const { walletId } = req.params;

    const balance = await getWalletBalance(walletId);

    return res.status(200).json({
      ok: true,
      walletId,
      balance,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};
const applyYield = async (req, res) => {
  try {
    const { walletId } = req.params;

    const result = await applyDailyYield( {walletId} );

    if (result.ok === false) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};
module.exports= {deposit,withdraw,getBalance,applyYield};