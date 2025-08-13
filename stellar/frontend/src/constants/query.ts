export const LIMIT_SIZE = 20
export const LIMIT_SIZE_CONTRACT = 10


export const convertToBasisPoints = (value: number | string): number => {
  if(!value) return 0
  const basisPoints = Number(value) * 100
	return Number(basisPoints.toFixed(2))
}