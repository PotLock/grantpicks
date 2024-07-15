import createRandomRounds from './round-factory/create-random.js';
import getRound from './round-factory/get-round.js';
import { addAdmin } from './round/add-admin.js';
import { roundInfo } from './round/info.js';
async function commands(params, app) {
    let result = null;
    switch (params[0]) {
        case 'rf_create':
            result = await createRandomRounds(params.slice(1), app);
            break;
        case 'rf_rounds':
            result = await getRound(params.slice(1), app);
            break;
            break;
        case 'round_info':
            result = await roundInfo(params.slice(1), app);
            break;
        case 'round_add_admin':
            result = await addAdmin(params.slice(1), app);
            break;
    }
    console.log('result', result);
}
export default commands;
