import App from '../../app.js';
import { Keypair } from '@stellar/stellar-sdk';
import axios from 'axios';
import CMDWallet from '../../wallet.js';
export async function generateApplicator(params, adminApp) {
    const roundId = params[0];
    let keypair = Keypair.random();
    let pubKey = keypair.publicKey();
    let secret = keypair.secret();
    let faucet = await axios.get(`https://friendbot.stellar.org?addr=${pubKey}`);
    let res = await faucet.data;
    console.log('Generate Applicator', pubKey);
    let cmdWallet = new CMDWallet({
        secret,
        network: 'testnet',
    });
    let clientApp = new App('testnet', cmdWallet);
    const registerTx = await clientApp.project_contract.apply({
        applicant: pubKey,
        project_params: {
            name: `Project ${pubKey}`,
            overview: `Overview for ${pubKey}`,
            admins: [pubKey],
            contacts: [
                {
                    name: 'Telegram',
                    value: 'https://t.me/stellar',
                },
            ],
            contracts: [
                {
                    name: 'NEAR Contract',
                    contract_address: 'near1.example.testnet',
                },
            ],
            image_url: 'https://example.com/image.png',
            video_url: 'https://example.com/video.mp4',
            payout_address: pubKey,
            repositories: [
                {
                    label: 'GitHub',
                    url: 'https://example.com/repo',
                },
            ],
            fundings: [
                {
                    amount: BigInt('1000'),
                    denomination: 'XLM',
                    description: 'Initial funding',
                    funded_ms: BigInt(Date.now()),
                    source: 'Stellar Development Foundation',
                },
            ],
            team_members: [
                {
                    name: 'Alice',
                    value: 'Github: alice',
                },
            ],
        },
    });
    await registerTx.signAndSend();
    const applyToRoundTx = await clientApp.round_contract.apply_to_round({
        round_id: BigInt(roundId),
        caller: pubKey,
        applicant: undefined,
        note: undefined,
        review_note: undefined,
    });
    const resultTx = await applyToRoundTx.signAndSend();
    return resultTx.result;
}
