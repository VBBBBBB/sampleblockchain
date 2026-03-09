package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a Ration Distribution System - Enterprise Version v3.0
type SmartContract struct {
	contractapi.Contract
}

// Asset Types

// StockBatch represents a batch of grain/commodity released by the Government
type StockBatch struct {
	ID            string  `json:"id"`
	CommodityType string  `json:"commodityType"` // e.g., "Wheat", "Rice"
	Quantity      float64 `json:"quantity"`      // in KG
	Balance       float64 `json:"balance"`       // remaining quantity in this batch
	Origin        string  `json:"origin"`        // "Govt"
	CurrentOwner  string  `json:"currentOwner"`  // Org currently holding/controlling this batch
	Status        string  `json:"status"`        // "ALLOCATED", "IN_TRANSIT", "AT_SHOP", "EXHAUSTED"
	CreatedAt     string  `json:"createdAt"`
}

// Shop represents a registered Fair Price Shop
type Shop struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	District      string `json:"district"`
	DealerName    string `json:"dealerName"`
	LicenseNumber string `json:"licenseNumber"`
	IsActive      bool   `json:"isActive"`
}

// Beneficiary represents a ration card holder
// Sensitive data (like names/full IDs) are NOT stored directly here (Private Data or Hashing used)
type Beneficiary struct {
	CardHash     string  `json:"cardHash"`     // SHA256 of the Ration Card ID
	Category     string  `json:"category"`     // e.g., "BPL", "APL", "AAY"
	MonthlyQuota float64 `json:"monthlyQuota"` // Quota in KG per month
	District     string  `json:"district"`
}

// DistributionTransaction records the issuance of ration to a beneficiary
type DistributionTransaction struct {
	ID            string  `json:"id"`
	TransactionID string  `json:"blockchainTxId"` // Internal fabric transaction ID
	ShopID        string  `json:"shopId"`
	CardHash      string  `json:"cardHash"`
	Commodity     string  `json:"commodity"`
	Quantity      float64 `json:"quantity"`
	Date          string  `json:"date"` // YYYY-MM
	Timestamp     string  `json:"timestamp"`
}

// CreateStockBatch registers a new batch of ration in the system
func (s *SmartContract) CreateStockBatch(ctx contractapi.TransactionContextInterface, id string, commodity string, quantityStr string) error {
	// RBAC: Only Government Org should create stock
	mspid, _ := ctx.GetClientIdentity().GetMSPID()
	if mspid != "GovtMSP" {
		return fmt.Errorf("unauthorized: only Government organization can create stock batches")
	}

	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the stock batch %s already exists", id)
	}

	var quantity float64
	_, err = fmt.Sscanf(quantityStr, "%f", &quantity)
	if err != nil {
		return fmt.Errorf("invalid quantity format: %s", quantityStr)
	}

	timestamp, _ := ctx.GetStub().GetTxTimestamp()

	batch := StockBatch{
		ID:            id,
		CommodityType: commodity,
		Quantity:      quantity,
		Balance:       quantity,
		Origin:        "Govt",
		CurrentOwner:  "GovtOrg",
		Status:        "ALLOCATED",
		CreatedAt:     time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).Format(time.RFC3339),
	}

	batchJSON, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, batchJSON)
}

// OnboardShop adds a new shop to the network
func (s *SmartContract) OnboardShop(ctx contractapi.TransactionContextInterface, id string, name string, district string, dealer string, license string) error {
	shop := Shop{
		ID:            id,
		Name:          name,
		District:      district,
		DealerName:    dealer,
		LicenseNumber: license,
		IsActive:      true,
	}

	shopJSON, err := json.Marshal(shop)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, shopJSON)
}

// IssueRation records the distribution of food to a beneficiary with fraud prevention
func (s *SmartContract) IssueRation(ctx contractapi.TransactionContextInterface, shopId string, cardHash string, commodity string, quantityStr string) error {
	// RBAC: Verify the caller is authorized to issue ration (usually Shop or District)
	mspid, _ := ctx.GetClientIdentity().GetMSPID()
	if mspid == "GovtMSP" {
		return fmt.Errorf("unauthorized: Government organization cannot issue retail ration")
	}

	// Current month for quota check
	currentMonth := time.Now().Format("2006-01")

	// Create a unique key for this beneficiary+commodity+month to prevent duplicates
	quotaKey := fmt.Sprintf("QUOTA_%s_%s_%s", cardHash, commodity, currentMonth)

	// Check if they already received ration this month
	alreadyIssued, err := s.AssetExists(ctx, quotaKey)
	if err != nil {
		return err
	}
	if alreadyIssued {
		return fmt.Errorf("beneficiary %s has already received their %s quota for %s", cardHash, commodity, currentMonth)
	}

	var quantity float64
	_, err = fmt.Sscanf(quantityStr, "%f", &quantity)
	if err != nil {
		return fmt.Errorf("invalid quantity format: %s", quantityStr)
	}

	// PERFORMANCE IMPROVEMENT: Use CouchDB Rich Query (Selector) instead of looping
	queryString := fmt.Sprintf(`{"selector":{"currentOwner":"%s","commodityType":"%s","balance":{"$gte":%f}}}`, shopId, commodity, quantity)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return err
	}
	defer resultsIterator.Close()

	if !resultsIterator.HasNext() {
		return fmt.Errorf("no stock batch found for %s at shop %s with sufficient balance (%f required)", commodity, shopId, quantity)
	}

	queryResponse, err := resultsIterator.Next()
	if err != nil {
		return err
	}

	var targetBatch StockBatch
	err = json.Unmarshal(queryResponse.Value, &targetBatch)
	if err != nil {
		return err
	}

	// Deduct balance
	targetBatch.Balance -= quantity
	if targetBatch.Balance == 0 {
		targetBatch.Status = "EXHAUSTED"
	}

	updatedBatchJSON, _ := json.Marshal(targetBatch)
	err = ctx.GetStub().PutState(targetBatch.ID, updatedBatchJSON)
	if err != nil {
		return err
	}

	timestamp, _ := ctx.GetStub().GetTxTimestamp()
	txId := ctx.GetStub().GetTxID()

	distTx := DistributionTransaction{
		ID:            quotaKey,
		TransactionID: txId,
		ShopID:        shopId,
		CardHash:      cardHash,
		Commodity:     commodity,
		Quantity:      quantity,
		Date:          currentMonth,
		Timestamp:     time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).Format(time.RFC3339),
	}

	txJSON, err := json.Marshal(distTx)
	if err != nil {
		return err
	}

	// Emit Event for external systems
	ctx.GetStub().SetEvent("RationIssued", txJSON)

	return ctx.GetStub().PutState(quotaKey, txJSON)
}

// QueryAsset reads an asset from the ledger
func (s *SmartContract) QueryAsset(ctx contractapi.TransactionContextInterface, id string) (string, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return "", fmt.Errorf("failed to read from world state: %v", err)
	}
	if assetJSON == nil {
		return "", fmt.Errorf("the asset %s does not exist", id)
	}

	return string(assetJSON), nil
}

// AssetExists returns true when asset with given ID exists in world state
func (s *SmartContract) AssetExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return assetJSON != nil, nil
}

// TransferStock moves a stock batch from one entity to another (Govt -> District or District -> Shop)
func (s *SmartContract) TransferStock(ctx contractapi.TransactionContextInterface, batchId string, newOwner string) error {
	batchJSON, err := ctx.GetStub().GetState(batchId)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if batchJSON == nil {
		return fmt.Errorf("the stock batch %s does not exist", batchId)
	}

	var batch StockBatch
	err = json.Unmarshal(batchJSON, &batch)
	if err != nil {
		return err
	}

	batch.CurrentOwner = newOwner

	// If transfer to shop, update status
	if batch.Status == "ALLOCATED" {
		batch.Status = "IN_TRANSIT"
	} else if batch.Status == "IN_TRANSIT" {
		batch.Status = "AT_SHOP"
	}

	newBatchJSON, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(batchId, newBatchJSON)
}

// GetAssetHistory returns the chain of custody and changes for an asset
func (s *SmartContract) GetAssetHistory(ctx contractapi.TransactionContextInterface, id string) (string, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return "", fmt.Errorf("failed to get history for key %s: %v", id, err)
	}
	defer resultsIterator.Close()

	var history []string
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}
		history = append(history, string(response.Value))
	}

	historyJSON, _ := json.Marshal(history)
	return string(historyJSON), nil
}

// GetAllAssets returns all assets found in the ledger
func (s *SmartContract) GetAllAssets(ctx contractapi.TransactionContextInterface) (string, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return "", err
	}
	defer resultsIterator.Close()

	var assets []string
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}
		assets = append(assets, fmt.Sprintf("Key: %s, Value: %s", queryResponse.Key, string(queryResponse.Value)))
	}

	assetsJSON, _ := json.Marshal(assets)
	return string(assetsJSON), nil
}

func main() {
	rationSmartContract := new(SmartContract)

	chaincode, err := contractapi.NewChaincode(rationSmartContract)

	if err != nil {
		fmt.Printf("Error creating ration-contract chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting ration-contract chaincode: %s", err.Error())
	}
}
