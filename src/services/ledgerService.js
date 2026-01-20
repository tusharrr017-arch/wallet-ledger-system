const pool = require("../config/db");

const depositToWallet = async ({ walletId, amount, referenceId }) => {
  const connection = await pool.getConnection();
  try{
    await connection.beginTransaction();
    const[existing]= await connection.query(
        "SELECT id FROM ledger_entries where reference_id = ? LIMIT 1",
        [referenceId]
    );
    if (existing.length>0){
        await connection.commit();
        return {duplicated:true}
    }
    await connection.query(
        "INSERT INTO ledger_entries (wallet_id,type,amount,reference_id) VALUES(?,'DEPOSIT',?,?)",
        [walletId,amount,referenceId]
    );
    await connection.commit();
    return{duplicated:false};
  }catch(err){
    await connection.rollback();
    throw err;
  }finally{
    connection.release();
  }
}
module.exports= {depositToWallet}