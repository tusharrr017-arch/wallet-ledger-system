# Wallet Ledger System (Node.js + MySQL)

A wallet ledger system built using **Node.js (Express)** and **MySQL**, following a **ledger-style transaction model** where every balance change is recorded as an immutable entry.

This project supports:
- User creation
- Wallet creation
- Deposits (simulated cash load)
- Withdrawals
- Yield credit (1% per day rule)
- Transaction / ledger history
- Idempotent deposits using `reference_id`

---

##  Live Deployment (Render)

Backend is deployed on **Render**:

###  Base URL
```

[https://wallet-ledger-system.onrender.com](https://wallet-ledger-system.onrender.com)

```

To use any API endpoint, append it to the base URL.

Example:
```

[https://wallet-ledger-system.onrender.com/api/users](https://wallet-ledger-system.onrender.com/api/users)

```

---

##  Database (Aiven MySQL)

Database is hosted on **Aiven (MySQL)**.

Connection is done using environment variables in Render.

---

##  Health Check

### GET `/health`
Checks if server is running and DB is connected.

**Request**
```

GET [https://wallet-ledger-system.onrender.com/health](https://wallet-ledger-system.onrender.com/health)

````

**Response**
```json
{
  "ok": true,
  "message": "Wallet Ledger API running",
  "db": "connected"
}
````


---

##  API Endpoints

### 1) Create User

**POST** `/api/users`

**Request**

```json
{
  "name": "Tushar"
}
```

---

### 2) Deposit Money (Cash Load Simulation)

**POST** `/api/wallets/:walletId/deposit`

**Request**

```json
{
  "amount": 1000,
  "reference_id": "dep_001"
}
```

 Deposit is **idempotent** → sending the same `referenceId` again will not double credit.

---

### 3) Withdraw Money

**POST** `/api/wallets/:walletId/withdraw`

**Request**

```json
{
  "amount": 200,
  "reference_id": "wd_001"
}
```

---

### 4) Get Wallet Balance

**GET** `/api/wallets/:walletId/balance`

Example:

```
GET https://wallet-ledger-system.onrender.com/api/wallets/1/balance
```

---

### 5) Apply Yield (1% daily)

**POST** `/api/wallets/:walletId/yield`

Example:

```
POST https://wallet-ledger-system.onrender.com/api/wallets/1/yield
```

 Yield is applied automatically based on wallet balance
 Only **once per day per wallet**

---

### 6) Transaction / Ledger History

**GET** `/api/wallets/:walletId/transactions`

Example:

```
GET https://wallet-ledger-system.onrender.com/api/wallets/1/transactions
```

---

##  Testing with Postman

Use the deployed base URL:

```
https://wallet-ledger-system.onrender.com
```

Then test endpoints like:

* `POST /api/users`
* `POST /api/wallets/1/deposit`
* `POST /api/wallets/1/withdraw`
* `POST /api/wallets/1/yield`
* `GET /api/wallets/1/balance`
* `GET /api/wallets/1/transactions`

---

##  Environment Variables (Render)

These are configured inside Render → Environment Variables:

* `DB_HOST`
* `DB_PORT`
* `DB_USER`
* `DB_PASSWORD`
* `DB_NAME`
* `PORT` (Render auto assigns, but app supports it)

---

##  Notes

* No real payment system is integrated (cash loading is simulated)
* All balance changes are tracked via ledger entries
* MySQL used as primary database
* Works on local + deployed production environment

---

##  Author

Built by **Tushar Lakhani**

