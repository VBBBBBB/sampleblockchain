const mongoose = require('mongoose');
require('dotenv').config();
const Transaction = require('../models/Transaction');

const populate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('Seeding Analytics Data...');

        // Mock some previous audit logs for the dashboard
        await Transaction.deleteMany({}); // clear old

        await Transaction.create([
            {
                txId: 'mock_tx_1',
                type: 'StockCreated',
                commodity: 'Wheat',
                quantity: 5000,
                timestamp: new Date('2024-01-15')
            },
            {
                txId: 'mock_tx_2',
                type: 'StockTransferred',
                commodity: 'Wheat',
                quantity: 1000,
                shopId: 'shop001',
                timestamp: new Date('2024-01-20')
            },
            {
                txId: 'mock_tx_3',
                type: 'RationIssued',
                shopId: 'shop001',
                cardHash: 'citizen_88_hash',
                commodity: 'Wheat',
                quantity: 25,
                timestamp: new Date()
            }
        ]);

        console.log('✅ Analytics DB Seeded!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

populate();
