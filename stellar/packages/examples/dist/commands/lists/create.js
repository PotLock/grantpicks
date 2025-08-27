export async function createList(params, adminApp) {
    const txList = await adminApp.lists_contract.create_list({
        owner: adminApp.wallet.account.publicKey,
        name: params[0],
        description: 'This is a test list',
        admin_only_registrations: false,
        admins: [],
        cover_image_url: '',
        default_registration_status: { tag: 'Approved' },
    });
    const tx = await txList.signAndSend();
    return tx.result;
}
