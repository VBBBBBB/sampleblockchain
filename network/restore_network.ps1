
# Restore Network Script
# Usage: .\restore_network.ps1 (Run from 'network' folder)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RESTORING BLOCKCHAIN NETWORK SETUP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Define Variables
$ORDERER_CA = "/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/orderer.example.com/orderers/orderer0.orderer.example.com/msp/tlscacerts/tlsca.orderer.example.com-cert.pem"
$CHANNEL_NAME = "govt-district-channel"
$CC_NAME = "ration"
$CC_VERSION = "3.0"
$CC_SEQUENCE = "1" # Reset to 1 for fresh network
$CC_PACKAGE = "ration_v3.tar.gz"

# 2. Create Channel
Write-Host "`n[1/7] Creating Channel '$CHANNEL_NAME'..." -ForegroundColor Yellow
# Try to fetch block first, if fails, create it
docker exec cli peer channel fetch 0 ./$CHANNEL_NAME.block -o orderer0.orderer.example.com:7050 -c $CHANNEL_NAME --tls --cafile $ORDERER_CA > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Channel does not exist, creating..." -ForegroundColor Gray
    docker exec cli peer channel create -o orderer0.orderer.example.com:7050 -c $CHANNEL_NAME -f ./govt-district.tx --outputBlock ./$CHANNEL_NAME.block --tls --cafile $ORDERER_CA
}
else {
    Write-Host "Channel already exists, fetched block." -ForegroundColor Gray
}

# 3. Join Peers to Channel
Write-Host "`n[2/7] Joining Govt Peer to Channel..." -ForegroundColor Yellow
# Check if already joined
$channels = docker exec cli peer channel list
if ($channels -match $CHANNEL_NAME) {
    Write-Host "Govt Peer already joined." -ForegroundColor Gray
}
else {
    docker exec cli peer channel join -b ./$CHANNEL_NAME.block
}

Write-Host "`n[3/7] Joining District Peer to Channel..." -ForegroundColor Yellow
# Check if already joined (need strict env vars)
$distChannels = docker exec -e CORE_PEER_ADDRESS=peer0.district.example.com:8051 `
    -e CORE_PEER_LOCALMSPID=DistrictMSP `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/peers/peer0.district.example.com/tls/ca.crt `
    cli peer channel list

if ($distChannels -match $CHANNEL_NAME) {
    Write-Host "District Peer already joined." -ForegroundColor Gray
}
else {
    docker exec -e CORE_PEER_ADDRESS=peer0.district.example.com:8051 `
        -e CORE_PEER_LOCALMSPID=DistrictMSP `
        -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp `
        -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/peers/peer0.district.example.com/tls/ca.crt `
        cli peer channel join -b ./$CHANNEL_NAME.block
}

# 4. Update Anchor Peers
Write-Host "`n[4/7] Updating Anchor Peers..." -ForegroundColor Yellow
# Just run it, if it fails it might be because no change, which is fine
docker exec cli peer channel update -o orderer0.orderer.example.com:7050 -c $CHANNEL_NAME -f ./GovtOrgAnchors.tx --tls --cafile $ORDERER_CA
docker exec -e CORE_PEER_ADDRESS=peer0.district.example.com:8051 `
    -e CORE_PEER_LOCALMSPID=DistrictMSP `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/peers/peer0.district.example.com/tls/ca.crt `
    cli peer channel update -o orderer0.orderer.example.com:7050 -c $CHANNEL_NAME -f ./DistrictOrgAnchors_GovtDist.tx --tls --cafile $ORDERER_CA

# 5. Install Chaincode
Write-Host "`n[5/7] Installing Chaincode..." -ForegroundColor Yellow
Write-Host "Installing on Govt Peer..." -ForegroundColor Gray
docker exec cli peer lifecycle chaincode install $CC_PACKAGE

Write-Host "Installing on District Peer..." -ForegroundColor Gray
docker exec -e CORE_PEER_ADDRESS=peer0.district.example.com:8051 `
    -e CORE_PEER_LOCALMSPID=DistrictMSP `
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp `
    -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/peers/peer0.district.example.com/tls/ca.crt `
    cli peer lifecycle chaincode install $CC_PACKAGE

# 6. Approve Chaincode
Write-Host "`n[6/7] Approving Chaincode Definition..." -ForegroundColor Yellow

# Get Package ID
$installed = docker exec cli peer lifecycle chaincode queryinstalled
$packageId = $installed | Select-String -Pattern "Package ID: (ration.*)" | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }
if (-not $packageId) {
    Write-Error "Failed to get Package ID. Is chaincode installed?"
    exit
}
$packageId = ($packageId -split ',')[0]
Write-Host "Package ID: $packageId" -ForegroundColor Cyan

# Check if already committed
$committed = docker exec cli peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CC_NAME
if ($committed -match "Sequence: $CC_SEQUENCE") {
    Write-Host "Chaincode already committed at Sequence $CC_SEQUENCE. Skipping approval/commit." -ForegroundColor Green
}
else {
    Write-Host "Approving for Govt..." -ForegroundColor Gray
    docker exec cli peer lifecycle chaincode approveformyorg -o orderer0.orderer.example.com:7050 `
        --ordererTLSHostnameOverride orderer0.orderer.example.com --tls --cafile $ORDERER_CA `
        --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION `
        --package-id $packageId --sequence $CC_SEQUENCE

    Write-Host "Approving for District..." -ForegroundColor Gray
    docker exec -e CORE_PEER_ADDRESS=peer0.district.example.com:8051 `
        -e CORE_PEER_LOCALMSPID=DistrictMSP `
        -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp `
        -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/peers/peer0.district.example.com/tls/ca.crt `
        cli peer lifecycle chaincode approveformyorg -o orderer0.orderer.example.com:7050 `
        --ordererTLSHostnameOverride orderer0.orderer.example.com --tls --cafile $ORDERER_CA `
        --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION `
        --package-id $packageId --sequence $CC_SEQUENCE

    # 7. Commit Chaincode
    Write-Host "`n[7/7] Committing Chaincode..." -ForegroundColor Yellow
    docker exec cli peer lifecycle chaincode commit -o orderer0.orderer.example.com:7050 `
        --ordererTLSHostnameOverride orderer0.orderer.example.com --tls --cafile $ORDERER_CA `
        --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --sequence $CC_SEQUENCE `
        --peerAddresses peer0.govt.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/govt.example.com/peers/peer0.govt.example.com/tls/ca.crt `
        --peerAddresses peer0.district.example.com:8051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/district.example.com/peers/peer0.district.example.com/tls/ca.crt
}

Write-Host "`n✅ NETWORK RESTORED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "You can now run the demo commands." -ForegroundColor Green
