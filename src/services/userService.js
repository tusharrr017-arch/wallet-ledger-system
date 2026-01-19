const pool =require("../config/db");

const createUserWithWallet = async(name)=>{
    const connection = await pool.getConnection();
    try{
        await connection.beginTransaction();
        const[userResult] = await connection.query(
            "INSERT INTO users (name) VALUES(?)",
            [name]
        );
        const userId= userResult.insertId;
        const[walletResult]= await connection.query(
            "INSERT INTO wallets (user_id) VALUES (?)",
            [userId]
        )
        const walletId= walletResult.insertId;
        await connection.commit();
        return{userId,walletId}
    }catch(err){
        await connection.rollback();
        throw err;
    }finally{
            connection.release()
    }
};
module.exports={createUserWithWallet}