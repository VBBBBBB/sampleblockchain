# Ration Distribution Blockchain App

This is the complete Full Stack DApp for the Ration Distribution System.

## Project Structure

1. **`network/`**: The core Hyperledger Fabric blockchain network.
2. **`chaincode-go/`**: The Smart Contract (business logic) written in Go.
3. **`server/`**: The Node.js API Middleware connecting App to Blockchain.
4. **`client/`**: The React Frontend Dashboard for Govt and Shops.

## How to Run the Project

### Step 1: Start the Network (Already Done)
Ensure your network is up. If not:
```bash
cd network
./restore_network.ps1
```

### Step 2: Start the API Server
Open a terminal:
```bash
cd server
npm start
```
*Server runs on http://localhost:3000*

### Step 3: Start the Frontend Dashboard
Open a NEW terminal:
```bash
cd client
npm run dev
```
*Frontend runs on http://localhost:5173* (or similar)

## Features Implemented
- **Government**: Create Stock Batches (recorded on blockchain)
- **Shop**: Issue Ration to Citizens (checks quota, deduplicates)
- **Public**: View Live Ledger of all assets and transactions also 

