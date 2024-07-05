import App from '../app.js'
import createRandomRounds from './rounds/create-random.js'
import getRound from './rounds/get-round.js'

async function commands(params: string[], app: App) {
	let result = null
	switch (params[0]) {
		case 'create-round':
			result = await createRandomRounds(params.slice(1), app)
			break
    case 'get-round':
      result = await getRound(params.slice(1), app)
      break
	}

	console.log('result', result)
}

export default commands
