package main

import (
	"fmt"
	"testing"
	"time"

	"github.com/golang/protobuf/ptypes/timestamp"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockStub implements only the methods used in the smart contract
type MockStub struct {
	shim.ChaincodeStubInterface
	mock.Mock
}

func (m *MockStub) GetState(key string) ([]byte, error) {
	args := m.Called(key)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]byte), args.Error(1)
}

func (m *MockStub) PutState(key string, value []byte) error {
	args := m.Called(key, value)
	return args.Error(0)
}

func (m *MockStub) GetTxTimestamp() (*timestamp.Timestamp, error) {
	args := m.Called()
	return args.Get(0).(*timestamp.Timestamp), args.Error(1)
}

func (m *MockStub) GetTxID() string {
	args := m.Called()
	return args.String(0)
}

// MockContext
type MockContext struct {
	contractapi.TransactionContextInterface
	mock.Mock
}

func (m *MockContext) GetStub() shim.ChaincodeStubInterface {
	args := m.Called()
	return args.Get(0).(shim.ChaincodeStubInterface)
}

func TestCreateStockBatch(t *testing.T) {
	mockStub := new(MockStub)
	mockContext := new(MockContext)
	mockContext.On("GetStub").Return(mockStub)

	contract := new(SmartContract)

	// Success case
	mockStub.On("GetState", "batch1").Return(nil, nil)
	mockStub.On("GetTxTimestamp").Return(&timestamp.Timestamp{}, nil)
	mockStub.On("PutState", "batch1", mock.Anything).Return(nil)

	err := contract.CreateStockBatch(mockContext, "batch1", "Wheat", 1000)
	assert.NoError(t, err)
}

func TestIssueRation(t *testing.T) {
	mockStub := new(MockStub)
	mockContext := new(MockContext)
	mockContext.On("GetStub").Return(mockStub)

	contract := new(SmartContract)
	cardHash := "beneficiary123"
	commodity := "Rice"
	currentMonth := time.Now().Format("2006-01")
	quotaKey := fmt.Sprintf("QUOTA_%s_%s_%s", cardHash, commodity, currentMonth)

	// Success case
	mockStub.On("GetState", quotaKey).Return(nil, nil).Once()
	mockStub.On("GetTxTimestamp").Return(&timestamp.Timestamp{}, nil).Once()
	mockStub.On("GetTxID").Return("tx123").Once()
	mockStub.On("PutState", quotaKey, mock.Anything).Return(nil).Once()

	err := contract.IssueRation(mockContext, "shopA", cardHash, commodity, 5.0)
	assert.NoError(t, err)

	// Fail case (Duplicate)
	mockStub.On("GetState", quotaKey).Return([]byte("already issued"), nil).Once()
	err = contract.IssueRation(mockContext, "shopA", cardHash, commodity, 5.0)
	assert.Error(t, err)
}
