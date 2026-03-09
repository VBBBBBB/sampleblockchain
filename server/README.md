# Ration Distribution System - API Server

This is the middleware server that connects the frontend/client applications to the Hyperledger Fabric blockchain network.

## Prerequisites

- Node.js (v14 or later)
- Running Hyperledger Fabric Network (in `../network`)

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Import Identities**:
   This script reads the crypto material from the `../network/organizations` directory and imports it into a local wallet.
   ```bash
   node addToWallet.js
   ```

3. **Start the Server**:
   ```bash
   node app.js
   ```
   The server will start on `http://localhost:3000`.

## API Endpoints

### 1. Create Stock Batch (Govt Only)
- **URL**: `POST /api/stock`
- **Body**:
  ```json
  {
    "id": "batch001",
    "commodity": "Wheat",
    "quantity": "1000"
  }
  ```

### 2. Issue Ration (Shop Only)
- **URL**: `POST /api/ration`
- **Body**:
  ```json
  {
    "shopId": "shop001",
    "cardHash": "hash_citizen_123",
    "commodity": "Wheat",
    "quantity": "25"
  }
  ```

### 3. Query Asset
- **URL**: `GET /api/asset/:id`
- **Example**: `/api/asset/batch001` or `/api/asset/QUOTA_hash_citizen_123_Wheat_2024-02`

### 4. Get All Assets
- **URL**: `GET /api/all`

## Troubleshoot

- If connection fails, ensure the network is running:
  ```bash
  cd ../network
  ./network.sh up createChannel -c govt-district-channel
  ```
  (Or use the provided `restore_network.ps1` script)
