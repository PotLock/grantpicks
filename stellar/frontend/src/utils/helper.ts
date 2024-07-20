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
