const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Routes
const authRoutes = require('./src/routes/apiAuth');
app.use('/auth', authRoutes);

const apiRoutes = require('./src/routes/api');
app.use('/api', apiRoutes);

// Off-Chain Analytics Endpoint
app.get('/analytics/logs', async (req, res) => {
    try {
        const logs = await require('./src/models/Transaction').find().sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    connectDB(); // Optional: Connect to MongoDB if available
});
