const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricService {
    constructor() {
        this.gateway = new Gateway();
        this.network = null;
        this.contract = null;
        this.channelName = process.env.CHANNEL_NAME || 'govt-district-channel';
        this.chaincodeName = process.env.CHAINCODE_NAME || 'ration';
    }

    async connect(identityLabel = 'GovtAdmin') {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const connectionProfilePath = path.resolve(process.cwd(), 'connection.json');

        if (!fs.existsSync(connectionProfilePath)) {
            throw new Error('Connection profile not found!');
        }

        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        await this.gateway.connect(connectionProfile, {
            wallet,
            identity: identityLabel,
            discovery: { enabled: true, asLocalhost: true }
        });

        console.log(`🔗 Fabric Connected as ${identityLabel}`);
        this.network = await this.gateway.getNetwork(this.channelName);
        this.contract = this.network.getContract(this.chaincodeName);
    }

    async submitTransaction(func, ...args) {
        if (!this.contract) await this.connect();
        console.log(`📡 Submitting to Fabric: ${func}(${args.join(', ')})`);
        const result = await this.contract.submitTransaction(func, ...args);
        return result.toString();
    }

    async evaluateTransaction(func, ...args) {
        if (!this.contract) await this.connect();
        console.log(`🔍 Evaluating in Fabric: ${func}(${args.join(', ')})`);
        const result = await this.contract.evaluateTransaction(func, ...args);
        return result.toString();
    }

    async disconnect() {
        await this.gateway.disconnect();
    }
}

module.exports = new FabricService();
