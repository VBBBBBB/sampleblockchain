const FabricService = require('../services/FabricService');
const Transaction = require('../models/Transaction');

exports.createStock = async (req, res) => {
    try {
        const { id, commodity, quantity } = req.body;

        await FabricService.connect('GovtAdmin');
        await FabricService.submitTransaction('CreateStockBatch', id, commodity, quantity.toString());

        // Save Off-Chain Analytics Log
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

        await FabricService.connect('ShopAdmin');
        const txId = await FabricService.submitTransaction('IssueRation', shopId, cardHash, commodity, quantity.toString());

        // Save Off-Chain Analytics Log
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
        await FabricService.connect('GovtAdmin');
        const buffer = await FabricService.evaluateTransaction('GetAllAssets');
        const data = JSON.parse(buffer);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
