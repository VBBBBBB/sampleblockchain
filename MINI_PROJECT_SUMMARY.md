# 📄 Mini Project Summary: Enterprise Ration Distribution System

**Submitted for Review by: Rahul Sir**

---

## 🎯 Project Objective
To eliminate fraud, ensure complete transparency, and provide real-time tracking in the **Public Distribution System (PDS)** by migrating it to a secure, decentralized **Permissioned Blockchain Network**.

## 🏗️ System Architecture & Tech Stack
An industry-grade multi-layer architecture designed for scalability and fault tolerance:
- **Blockchain Layer (Source of Truth):** Hyperledger Fabric v2.5
    - *Consensus:* Raft (Crash Fault Tolerant)
    - *Network:* 3 Organizations (Government, District, Shop)
- **Smart Contracts (Chaincode):** Written in **Golang**. Handles core business logic securely on-chain.
- **Middleware / API Layer:** **Node.js & Express**. Acts as a secure gateway, utilizing the Fabric SDK for identity management and transaction submission, shielding the frontend from blockchain complexities.
- **Application Layer (Frontend):** **React.js**. A dynamic, role-based dashboard for stakeholders. 

## ✨ Key Features & Workflow
1. **Government Portal:** Mint and allocate new Stock Batches securely. Every allocation is cryptographically signed and stored immutably.
2. **Fair Price Shop (FPS) Portal:** Shop owners issue rations to verified citizens. The Smart Contract automatically validates quotas and inherently prevents *double-dipping* or duplicate entries.
3. **Public / Auditor Ledger:** A transparent view of the live ledger, tracing the lifecycle of stocks from origin to the final consumer.

## 🚀 Impact & Advantages over Traditional Systems
- **Immutability:** Once stock is moved or ration is issued, the record cannot be altered or deleted.
- **Transparency:** All network participants share a synchronized ledger, eliminating discrepancies.
- **Security:** Standard X.509 certificate identities (MSP) ensure only authorized entities can perform role-specific actions.
- **Rich Queries:** CouchDB integration allows for fast, state-based querying of current stock levels and transaction history.
