import App from '../../app.js'

export async function getProjectFromApplicant(params: string[], adminApp: App) {
	const applicant = params[0]
	const project = await adminApp.project_contract.get_project_from_applicant({
		applicant,
	})

	return project.result
}
