import App from '../app.js'
import createRandomRounds from './round-factory/create-random.js'
import getRound from './round-factory/get-round.js'
import { addAdmin } from './round/add-admin.js'
import { roundInfo } from './round/info.js'
import { generateApplicator } from './project-registry/apply.js'
import { applyToRound } from './round/apply.js'
import { reviewApplicationAndApprove } from './round/review.js'
import { getProjectFromApplicant } from './project-registry/user-application.js'

async function commands(params: string[], app: App) {
	let result = null
	switch (params[0]) {
		case 'rf_create':
			result = await createRandomRounds(params.slice(1), app)
			break
		case 'rf_gen_applicator':
			result = await generateApplicator(params.slice(1), app)
			break
		case 'get_project_from_applicant':
			result = await getProjectFromApplicant(params.slice(1), app)
			break
		case 'rf_apply':
			result = await applyToRound(params.slice(1), app)
			break
		case 'rf_approve':
			result = await reviewApplicationAndApprove(params.slice(1), app)
			break
		case 'rf_rounds':
			result = await getRound(params.slice(1), app)
			break
			break
		case 'round_info':
			result = await roundInfo(params.slice(1), app)
			break
		case 'round_add_admin':
			result = await addAdmin(params.slice(1), app)
			break
	}

	console.log('result', result)
}

export default commands
