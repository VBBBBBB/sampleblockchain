const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // 1. Create a wallet to store identities
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // 2. Define Identities to Import
        const identities = [
            {
                id: 'GovtAdmin',
                mspId: 'GovtMSP',
                certPath: '../network/organizations/peerOrganizations/govt.example.com/users/Admin@govt.example.com/msp/signcerts/Admin@govt.example.com-cert.pem',
                keyPath: '../network/organizations/peerOrganizations/govt.example.com/users/Admin@govt.example.com/msp/keystore/priv_sk'
            },
            {
                id: 'DistrictAdmin',
                mspId: 'DistrictMSP',
                certPath: '../network/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp/signcerts/Admin@district.example.com-cert.pem',
                keyPath: '../network/organizations/peerOrganizations/district.example.com/users/Admin@district.example.com/msp/keystore/priv_sk'
            },
            {
                id: 'ShopAdmin',
                mspId: 'ShopMSP',
                certPath: '../network/organizations/peerOrganizations/shop.example.com/users/Admin@shop.example.com/msp/signcerts/Admin@shop.example.com-cert.pem',
                keyPath: '../network/organizations/peerOrganizations/shop.example.com/users/Admin@shop.example.com/msp/keystore/priv_sk'
            }
        ];

        // 3. Import each identity
        for (const identity of identities) {
            // Check if already exists
            const exists = await wallet.get(identity.id);
            if (exists) {
                console.log(`⚠️  Identity "${identity.id}" already exists in wallet`);
                continue;
            }

            // Read Certificate
            const cert = fs.readFileSync(path.join(__dirname, identity.certPath)).toString();

            // Read Private Key (handle potentially random filenames if needed, but assuming priv_sk based on check)
            // If the key might have a different name, we could list directory, but based on inspection it is priv_sk
            const key = fs.readFileSync(path.join(__dirname, identity.keyPath)).toString();

            // Create Identity Object
            const x509Identity = {
                credentials: {
                    certificate: cert,
                    privateKey: key,
                },
                mspId: identity.mspId,
                type: 'X.509',
            };

            // Import to wallet
            await wallet.put(identity.id, x509Identity);
            console.log(`✅ Successfully imported identity "${identity.id}"`);
        }

    } catch (error) {
        console.error(`❌ Error adding to wallet: ${error}`);
        process.exit(1);
    }
}

main();
