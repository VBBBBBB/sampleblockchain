const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    txId: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'StockCreated', 'StockTransferred', 'RationIssued'
    shopId: String,
    cardHash: String,
    commodity: String,
    quantity: Number,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
