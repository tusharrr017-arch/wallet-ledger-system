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
    [walletId],
  );

  return rows[0].balance;
};
const applyDailyYield = async ({ walletId }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [walletRows] = await connection.query(
      "SELECT id FROM wallets WHERE id=? FOR UPDATE",
      [walletId],
    );
    if (walletRows.length === 0) {
      await connection.rollback();
      return {
        ok: false,
        message: "Wallet not found",
      };
    }
    const [existingYield] = await connection.query(
      `SELECT id 
             FROM ledger_entries
             WHERE wallet_id=?
               AND type ='YIELD'
               AND DATE(created_at)= CURDATE()
             LIMIT 1`,
      [walletId],
    );
    if (existingYield.length > 0) {
      await connection.commit();
      return {
        ok: true,
        applied: false,
        message: "Yield already applied today",
      };
    }
    const [yieldCalcRows] = await connection.query(
      `
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN type IN ('DEPOSIT','YIELD') THEN amount
        WHEN type = 'WITHDRAW' THEN -amount
        ELSE 0
      END
    ), 0) AS balance,
    CAST(
      COALESCE(SUM(
        CASE 
          WHEN type IN ('DEPOSIT','YIELD') THEN amount
          WHEN type = 'WITHDRAW' THEN -amount
          ELSE 0
        END
      ), 0) * 0.01
    AS DECIMAL(18,6)) AS yield_amount
  FROM ledger_entries
  WHERE wallet_id = ?
  `,
      [walletId],
    );

    const balance = Number(yieldCalcRows[0].balance);

    if (balance <= 0) {
      await connection.commit();
      return {
        ok: true,
        applied: false,
        message: "No Balance to apply yield",
      };
    }

    const yieldAmount = yieldCalcRows[0].yield_amount;

    const referenceId = `YIELD_${walletId}_${new Date().toISOString().slice(0, 10)}`;
    await connection.query(
      `
      INSERT INTO ledger_entries (wallet_id, type, amount, reference_id)
      VALUES (?, 'YIELD', ?, ?)
      `,
      [walletId, yieldAmount, referenceId],
    );

    await connection.commit();

    return {
      ok: true,
      applied: true,
      message: "Yield applied successfully",
      yieldAmount: yieldAmount.toFixed(6),
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
const getWalletTransactions = async (walletId) => {
  const [rows] = await pool.query(
    `
    SELECT id, wallet_id, type, amount, reference_id, created_at
    FROM ledger_entries
    WHERE wallet_id = ?
    ORDER BY created_at DESC
    `,
    [walletId],
  );

  return rows;
};

module.exports = {
  depositToWallet,
  withdrawFromWallet,
  getWalletBalance,
  applyDailyYield,
  getWalletTransactions,
};
