import dotenv from 'dotenv';
import { generateFakeRound } from './tests/index.js';
dotenv.config();
async function main() {
    await generateFakeRound();
    process.exit(0);
}
main();
