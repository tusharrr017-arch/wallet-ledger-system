# Wallet Ledger System

A simple wallet ledger system built using **Node.js + Express + MySQL**.
Each user has exactly one wallet. All balance changes are recorded as **ledger entries** (DEPOSIT / WITHDRAW / YIELD).
Balance is derived from the ledger and the ledger is treated as the source of truth.

---

## Tech Stack

* Node.js
* Express.js
* MySQL
* mysql2

---

## Project Setup (Run Locally)

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

Create a `.env` file in the root folder (you can copy `.env.example`)

Example:

```env
PORT=5500
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wallet_ledger
```

### 3) Setup Database

Run the `schema.sql` file in MySQL Workbench or terminal.

Terminal example:

```bash
mysql -u root -p wallet_ledger < schema.sql
```

### 4) Start the server

```bash
npm run dev
```

Server runs at:

```
http://localhost:5500
```

---

## API Endpoints

> Base URL: `http://localhost:5500`

---

### 1) Health Check

**GET** `/`

Example:

```bash
GET http://localhost:5500/
```

Response:

```json
{
  "ok": true,
  "message": "Wallet Ledger API running",
  "db": "connected"
}
```

---

## Users

### 2) Create User + Wallet

Creates a new user and automatically creates a wallet for them.

**POST** `/api/users`

Request Body:

```json
{
  "name": "Rahul"
}
```

Response:

```json
{
  "ok": true,
  "message": "User created Successfully",
  "data": {
    "userId": 1,
    "walletId": 1
  }
}
```

---

## Wallet / Ledger Operations

### 3) Deposit (Simulated Cash Load)

Creates a `DEPOSIT` ledger entry for the wallet.

**POST** `/api/wallets/:walletId/deposit`

Example:

```bash
POST http://localhost:5500/api/wallets/1/deposit
```

Request Body:

```json
{
  "amount": "100.000000",
  "reference_id": "DEP_001"
}
```

Notes:

* `reference_id` is used for idempotency
* sending the same `reference_id` again will not credit twice

Response (first time):

```json
{
  "ok": true,
  "message": "Deposit successful",
  "duplicated": false
}
```

Response (duplicate reference_id):

```json
{
  "ok": true,
  "message": "Deposit already processed",
  "duplicated": true
}
```

---

### 4) Withdraw

Creates a `WITHDRAW` ledger entry if balance is sufficient.

**POST** `/api/wallets/:walletId/withdraw`

Example:

```bash
POST http://localhost:5500/api/wallets/1/withdraw
```

Request Body:

```json
{
  "amount": "25.000000",
  "reference_id": "WDR_001"
}
```

Rules:

* withdrawal is rejected if balance is insufficient
* withdrawals are safe under concurrent requests using DB transaction + wallet lock

Success Response:

```json
{
  "ok": true,
  "message": "Withdrawal succesful",
  "duplicated": false
}
```

Insufficient balance response:

```json
{
  "ok": false,
  "message": "Insufficient Balance"
}
```

---

### 5) Get Wallet Balance

Returns current balance derived from ledger.

**GET** `/api/wallets/:walletId/balance`

Example:

```bash
GET http://localhost:5500/api/wallets/1/balance
```

Response:

```json
{
  "ok": true,
  "walletId": "1",
  "balance": "75.000000"
}
```

---

### 6) Apply Daily Yield (1% per day)

Creates a `YIELD` ledger entry (1% of current balance).
Yield is applied at most once per day per wallet.

**POST** `/api/wallets/:walletId/yield`

Example:

```bash
POST http://localhost:5500/api/wallets/1/yield
```

Response (first call today):

```json
{
  "ok": true,
  "applied": true,
  "message": "Yield applied successfully",
  "yieldAmount": "0.750000"
}
```

Response (already applied today):

```json
{
  "ok": true,
  "applied": false,
  "message": "Yield already applied today"
}
```

---

### 7) Get Wallet Transactions (Ledger History)

Returns all ledger entries for a wallet.

**GET** `/api/wallets/:walletId/transactions`

Example:

```bash
GET http://localhost:5500/api/wallets/1/transactions
```

Response:

```json
{
  "ok": true,
  "walletId": "1",
  "count": 3,
  "transactions": [
    {
      "id": 1,
      "wallet_id": 1,
      "type": "DEPOSIT",
      "amount": "100.000000",
      "reference_id": "DEP_001",
      "created_at": "2026-01-20T10:00:00.000Z"
    }
  ]
}
```

---

## Transaction Flow (Brief)

* All money operations are recorded in `ledger_entries`
* Deposits and withdrawals use `reference_id` to ensure idempotency
* Withdrawals and yield operations use DB transactions and wallet locking (`FOR UPDATE`) to ensure concurrency correctness
* Wallet balance is derived by summing ledger entries (DEPOSIT + YIELD - WITHDRAW)

---

## Notes

* Monetary values use `DECIMAL(18,6)` precision
* Ledger entries are append-only and should not be updated/deleted
* This project does not integrate real payments (cash load is simulated)

---
