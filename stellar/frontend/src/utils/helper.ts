export const prettyTruncate = (str = '', len = 8, type?: string) => {
	if (str && str.length > len) {
		if (type === 'address') {
			if (str.length !== len + 1) {
				const front = Math.ceil(len / 2)
				const back = str.length - (len - front)
				return `${str.slice(0, front)}...${str.slice(back)}`
			}
			return str
		}
		return `${str.slice(0, len)}...`
	}
	return str
}

export const formatStroopToXlm = (amount: bigint) => {
	const res = (BigInt(amount as bigint) / BigInt(10 ** 7)).toString()
	return res
}

export const parseToStroop = (amount: string) => {
	let toIntXlm = 0
	let len_of_fraction = 0
	if (amount.split('.').length > 1) {
		const amount_fraction = amount.split('.').slice(1)
		len_of_fraction = amount_fraction[0].length
		toIntXlm = Number(amount) * 10 ** len_of_fraction
	} else {
		toIntXlm = Number(amount)
	}
	const res = BigInt(toIntXlm) * BigInt(10 ** (7 - len_of_fraction))
	return res
}
