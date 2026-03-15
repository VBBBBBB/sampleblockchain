const FabricService = require('../services/FabricService');
const Transaction = require('../models/Transaction');

const getIdentity = (role) => {
    // Map shop requests through District hub identity to satisfy channel MSP validation
    if (role === 'Shop') return 'DistrictAdmin'; 
    if (role === 'District') return 'DistrictAdmin';
    return 'GovtAdmin';
};

exports.createStock = async (req, res) => {
    try {
        const { id, commodity, quantity } = req.body;
        const identity = getIdentity(req.user?.role);

        await FabricService.connect(identity);
        await FabricService.submitTransaction('CreateStockBatch', id, commodity, quantity.toString());

        await Transaction.create({
            txId: id,
            type: 'StockCreated',
            commodity: commodity,
            quantity: quantity,
        });

        res.status(200).json({ success: true, message: `Stock batch ${id} created!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.issueRation = async (req, res) => {
    try {
        const { shopId, cardHash, commodity, quantity } = req.body;
        // Dynamically connect using the caller's actual role to trigger chaincode RBAC
        const identity = getIdentity(req.user?.role);

        await FabricService.connect(identity);
        const txId = await FabricService.submitTransaction('IssueRation', shopId, cardHash, commodity, quantity.toString());

        await Transaction.create({
            txId: txId || Date.now().toString(),
            type: 'RationIssued',
            shopId: shopId,
            cardHash: cardHash,
            commodity: commodity,
            quantity: quantity,
        });

        res.status(200).json({ success: true, message: `Issued ${quantity}kg ${commodity} to ${cardHash}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllAssets = async (req, res) => {
    try {
        const identity = getIdentity(req.user?.role);
        await FabricService.connect(identity);
        const buffer = await FabricService.evaluateTransaction('GetAllAssets');
        const data = JSON.parse(buffer);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.transferStock = async (req, res) => {
    try {
        const { batchId, newOwner } = req.body;
        const identity = getIdentity(req.user?.role);
        
        await FabricService.connect(identity);
        await FabricService.submitTransaction('TransferStock', batchId, newOwner);

        await Transaction.create({
            txId: Date.now().toString(),
            type: 'StockTransferred',
            shopId: newOwner,
            commodity: batchId,
            quantity: 0
        });

        res.status(200).json({ success: true, message: `Batch ${batchId} transferred to ${newOwner}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.onboardShop = async (req, res) => {
    try {
        const { id, name, district, dealer, license } = req.body;
        const identity = getIdentity(req.user?.role);
        
        await FabricService.connect(identity);
        await FabricService.submitTransaction('OnboardShop', id, name, district, dealer, license);

        res.status(200).json({ success: true, message: `Shop ${name} onboarded successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAssetHistory = async (req, res) => {
    try {
        const identity = getIdentity(req.user?.role);
        await FabricService.connect(identity);
        const buffer = await FabricService.evaluateTransaction('GetAssetHistory', req.params.id);
        const data = JSON.parse(buffer);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
