export function getArithmeticIndex(numOfProjects: number, index: number) {
	let sum = 0
	let firstProjectIndex = 0

	while (sum + (numOfProjects - firstProjectIndex - 1) <= index) {
		sum += numOfProjects - firstProjectIndex - 1
		firstProjectIndex += 1
	}

	let secondProjectIndex = firstProjectIndex + 1 + (index - sum)

	return [firstProjectIndex, secondProjectIndex]
}
