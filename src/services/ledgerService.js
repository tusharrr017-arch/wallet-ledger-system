const pool = require("../config/db");

const depositToWallet = async ({ walletId, amount, referenceId }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      "SELECT id FROM ledger_entries where reference_id = ? LIMIT 1",
      [referenceId],
    );
    if (existing.length > 0) {
      await connection.commit();
      return { duplicated: true };
    }
    await connection.query(
      "INSERT INTO ledger_entries (wallet_id,type,amount,reference_id) VALUES(?,'DEPOSIT',?,?)",
      [walletId, amount, referenceId],
    );
    await connection.commit();
    return { duplicated: false };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
const withdrawFromWallet = async ({ walletId, amount, referenceId }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [walletRows] = await connection.query(
      "SELECT id FROM wallets WHERE id= ? FOR UPDATE",
      [walletId],
    );
    if (walletRows.length === 0) {
      await connection.rollback();
      return { ok: false, message: "Wallet not found" };
    }
    const [existing] = await connection.query(
      "SELECT id FROM ledger_entries WHERE reference_id=? LIMIT 1",
      [referenceId],
    );
    if (existing.length > 0) {
      await connection.commit();
      return { duplicated: true };
    }
    const [balanceRows] = await connection.query(
      `
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN type IN ('DEPOSIT','YIELD') THEN amount
            WHEN type = 'WITHDRAW' THEN -amount
            ELSE 0
          END
        ), 0) AS balance
      FROM ledger_entries
      WHERE wallet_id = ?
      `,
      [walletId],
    );
    const currentBalance = balanceRows[0].balance;
    if (Number(currentBalance) < Number(amount)) {
      await connection.rollback();
      return {
        ok: false,
        message: "Insufficient Balance",
      };
    }
    await connection.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, reference_id)
       VALUES (?, 'WITHDRAW', ?, ?)`,
      [walletId, amount, referenceId],
    );
    await connection.commit();
    return {
      ok: true,
      duplicated: false,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
const getWalletBalance = async (walletId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      COALESCE(SUM(
        CASE 
          WHEN type IN ('DEPOSIT','YIELD') THEN amount
          WHEN type = 'WITHDRAW' THEN -amount
          ELSE 0
        END
      ), 0) AS balance
    FROM ledger_entries
    WHERE wallet_id = ?
    `,
    [walletId]
  );

  return rows[0].balance;
};

module.exports = { depositToWallet ,withdrawFromWallet ,getWalletBalance};
