import App from '../app.js'
import createRandomRounds from './round-factory/create-random.js'
import getRound from './round-factory/get-round.js'
import initRoundF from './round-factory/init.js'
import { roundInfo } from './round/info.js'
import { initRound } from './round/init.js'

async function commands(params: string[], app: App) {
	let result = null
	switch (params[0]) {
		case 'init-rf':
			result = await initRoundF(params.slice(1), app)
			break
		case 'rf-create':
			result = await createRandomRounds(params.slice(1), app)
			break
		case 'rf-rounds':
			result = await getRound(params.slice(1), app)
			break
		case 'init-round':
			result = await initRound(params.slice(1), app)
			break
		case 'round-info':
			result = await roundInfo(params.slice(1), app)
			break
	}

	console.log('result', result)
}

export default commands
