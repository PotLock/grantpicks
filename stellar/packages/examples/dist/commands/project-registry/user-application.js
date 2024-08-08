export async function getProjectFromApplicant(params, adminApp) {
    const applicant = params[0];
    const project = await adminApp.project_contract.get_project_from_applicant({
        applicant,
    });
    return project.result;
}
