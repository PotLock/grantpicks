import dotenv from 'dotenv';
import CMDWallet from './wallet.js';
import App from './app.js';
import commands from './commands/index.js';
dotenv.config();
async function main() {
    let args = process.argv.slice(2);
    let adminSecret = process.env.ADMIN_SECRET || '';
    let cmdWallet = new CMDWallet({
        secret: adminSecret,
        network: 'testnet',
    });
    let app = new App('testnet', cmdWallet);
    await commands(args, app);
    process.exit(0);
}
main();
