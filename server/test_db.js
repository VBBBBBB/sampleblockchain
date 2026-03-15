const { MongoClient } = require('mongodb');

// Hardcoded test (will remove later)
const user = "vishwaforleet_db_user";
const pass = encodeURIComponent("VishwaBhamre@2004");
const cluster = "blockchain-cluster.fndluer.mongodb.net";
const uri = `mongodb+srv://${user}:${pass}@${cluster}/?retryWrites=true&w=majority&appName=Blockchain-Cluster`;

console.log('Testing connection with encoded password:', uri.replace(/:([^@]+)@/, ':****@'));

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('✅ Directly connected to MongoDB');
        const db = client.db('rationdb');
        console.log('Connected to database');
    } catch (err) {
        console.error('❌ Direct Connection Error:', err.message);
    } finally {
        await client.close();
    }
}

run();
