# Literature Review: Enterprise Ration Distribution System using Hyperledger Fabric

**Author:** Shivani (Project Lead)  
**Date:** February 2026  
**Subject:** Implementation of Permissioned Blockchain in Public Distribution Systems

---

## Abstract

The Public Distribution System (PDS) is a critical component of food security in many developing nations, designed to provide essential commodities to vulnerable populations at subsidized rates. However, traditional centralized PDS networks are plagued by systemic inefficiencies, including leakage, black marketing, and a lack of transparency in the supply chain. This literature review explores the application of blockchain technology—specifically Hyperledger Fabric—as a solution to these challenges. By replacing opaque, centralized databases with a distributed, immutable ledger, the proposed "Enterprise Ration Distribution System" aims to ensure end-to-end traceability of stock, prevent identity fraud through cryptographic verification, and provide real-time auditability for government oversight.

---

## 1. Introduction

### 1.1 Background
The PDS supply chain involves multiple stakeholders: government storage godowns, district distributors, fair price shops (FPS), and the end beneficiaries (citizens). In the current model, data regarding stock movement and issuance is often siloed or manually recorded, creating opportunities for manipulation. "Ghost beneficiaries"—fake identities used to siphon off rations—and the diversion of stock to the open market are persistent issues that undermine the system's efficacy.

### 1.2 Problem Statement
Existing web portals for PDS management rely on centralized databases (SQL/NoSQL) where administrative users have absolute control over the data. This centralization creates a single point of failure and allows for undetectable data tampering. If an administrator retrospectively alters stock logs to cover up theft, there is no immutable audit trail to prove the malfeasance.

### 1.3 Objective
The primary objective of this project is to architect a permissioned blockchain network using **Hyperledger Fabric v2.5**. Unlike public blockchains (e.g., Ethereum), which are open and pseudonymous, a permissioned network is ideal for this use case as it reflects the existing hierarchy of the government-PDS ecosystem, where participants (Govt, Shops) are known and authenticated entities.

---

## 2. Literature Review

### 2.1 Blockchain in Supply Chain Management
Blockchain technology, fundamentally a distributed ledger technology (DLT), offers a shared, immutable record of transactions. In the context of supply chains, research by *Saberi et al. (2019)* highlights that blockchain's primary value proposition is **transparency** and **traceability**. Every transaction—from the creation of a stock batch at a warehouse to its issuance at a shop—is cryptographically signed and linked to the previous transaction. This creates an unalterable "chain of custody."

A study by *Kshetri (2018)* on blockchain's role in IoT and supply chain visibility argues that blockchain can reduce administrative costs and erroneous records by providing a "single source of truth" accessible to all authorized parties. In a PDS context, this means the government can instantly verify the exact stock levels at any fair price shop without relying on potentially falsified manual reports.

### 2.2 Hyperledger Fabric vs. Public Blockchains
While public blockchains like Ethereum popularized the concept of smart contracts, they are ill-suited for enterprise government applications due to low transaction throughput, lack of data privacy, and volatile transaction fees ("gas").

The literature overwhelmingly supports **Hyperledger Fabric** for consortium-based enterprise networks. *Androulaki et al. (2018)*, in their foundational paper on Fabric, describe its modular architecture that separates transaction processing into three phases: Execution, Ordering, and Validation. This "execute-order-validate" architecture allows Fabric to achieve significantly higher throughput (txn/sec) compared to Ethereum's "order-execute" model.

Furthermore, Fabric's **Channel** architecture allows for private subnetworks. For instance, sensitive data regarding a specific district's allocation can be kept private from other districts if necessary, a feature impossible on a public chain. The use of **MSP (Membership Service Provider)** ensures that all participants are authenticated via X.509 certificates, aligning perfectly with the government's need for strict identity management.

### 2.3 Related Works
Several pilot projects have attempted similar implementations. The **Walmart Food Trust**, built on Hyperledger Fabric, serves as a benchmark for food traceability systems. It reduced the time taken to trace the origin of a food item from 7 days to 2.2 seconds.
In the academic sphere, *Jain et al. (2021)* proposed a theoretical framework for "e-Ration" using blockchain, emphasizing the elimination of intermediaries. However, most academic implementations remain at the simulation level. This project differentiates itself by offering a full-stack implementation, integrating the blockchain backend with a user-friendly MERN (MongoDB, Express, React, Node.js) frontend and an off-chain analytics layer.

---

## 3. Proposed System Architecture

Based on the industry standards outlined in the project's design documents, the system follows a robust three-tier architecture:

### 3.1 The Blockchain Layer (Hyperledger Fabric)
*   **Consensus Mechanism:** The network utilizes **Raft Consensus**, a crash fault-tolerant (CFT) ordering service. This ensures that as long as a quorum of orderer nodes is active, the network continues to process transactions, providing high availability.
*   **Smart Contracts (Chaincode):** Business logic is written in **Go (Golang)** due to its performance benefits. Key functions include:
    *   `CreateStockBatch`: Invoked by Government nodes to mint new digital assets representing physical grain.
    *   `IssueRation`: Invoked by Shop nodes. It atomically verifies the shop's stock balance and the user's eligibility before committing the transaction.
*   **World State:** **CouchDB** is used as the state database, allowing for rich JSON-style queries (e.g., "Find all transactions for Wheat in District A") which LevelDB does not support efficiently.

### 3.2 The API Layer (Middleware)
Directly exposing the blockchain network to client applications is a security risk and computationally expensive. To mitigate this, a **Node.js/Express Middleware** is implemented using the **Fabric SDK**. 
*   **Gateway Service:** This acts as a Singleton service, managing persistent connections (gRPC) to the Fabric Gateway.
*   **Identity Abstraction:** The middleware handles the complex signing process using the user's digital wallet, abstracting these cryptographic operations from the frontend.

### 3.3 The Application Layer (Frontend & Analytics)
*   **React Dashboard:** A role-based interface provides distinct views for "Government Admins" (stock creation, monitoring) and "Shop Owners" (issuance).
*   **Off-Chain Analytics:** To overcome the latency of querying the blockchain for historical data, an **Event-Driven Architecture** is employed. Chaincode events (e.g., `StockCreated`) trigger listeners in the Node.js server, which replicate the data into a local **MongoDB** instance. This allows for instant, complex analytics on the frontend without querying the ledger for every page load.

---

## 4. Conclusion

The "Enterprise Ration Distribution System" represents a significant leap forward from traditional PDS management software. By leveraging Hyperledger Fabric, the system guarantees that once a ration stock is created, its journey is immutable and transparent. The decoupling of the endorsement policy (blockchain rules) from the application logic ensures that the system is resistant to tampering even if the web application is compromised. This architecture not only addresses the immediate issues of leakage and corruption but also lays the groundwork for a future-proof, automated supply chain infrastructure for public welfare.

---

## 5. References

1.  **Androulaki, E., et al.** (2018). "Hyperledger Fabric: A Distributed Operating System for Permissioned Blockchains." *Proceedings of the Thirteenth EuroSys Conference*.
2.  **Saberi, S., et al.** (2019). "Blockchain technology and its relationships to sustainable supply chain management." *International Journal of Production Research*.
3.  **Kshetri, N.** (2018). "1 Blockchain's roles in meeting key supply chain management objectives." *International Journal of Information Management*.
4.  **Jain, A., et al.** (2021). "Blockchain-based approach for e-Ration distribution system." *International Conference on Computing and Communication Systems*.
5.  **Hyperledger Foundation.** (2025). "Hyperledger Fabric Documentation v2.5."
