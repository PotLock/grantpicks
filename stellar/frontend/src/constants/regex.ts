export const YOUTUBE_URL_REGEX =
	/((http(s)?:\/\/)?)(www\.)?((youtube\.com\/)|(youtu.be\/))[\S]+/

export const GITHUB_URL_REGEX = new RegExp(
	'^https?:\\/\\/(www\\.)?github\\.com\\/' +
		'[a-zA-Z0-9_-]+\\/' +
		'[a-zA-Z0-9_-]+(\\/)?$',
	'i',
)

export const NEAR_ADDRESS_REGEX = (address: string): boolean => {
	const nearRegex = /^(?!.*--)[a-z0-9-]{2,64}\.(near|testnet)$/
	return nearRegex.test(address)
}

export const BITCOIN_ADDRESS_REGEX = (address: string): boolean => {
	const btcRegex = /^(1|3|bc1)[a-km-zA-HJ-NP-Z1-9]{25,62}$/
	return btcRegex.test(address)
}

export const ETHEREUM_ADDRESS_REGEX = (address: string): boolean => {
	const ethRegex = /^0x[a-fA-F0-9]{40}$/
	return ethRegex.test(address)
}

export const TELEGRAM_USERNAME_REGEX = /^[a-zA-Z0-9_]{5,32}$/

export const INSTAGRAM_USERNAME_REGEX = /^[a-zA-Z0-9_.]{1,30}$/

export const TWITTER_USERNAME_REGEX = /^[a-zA-Z0-9_]{5,15}$/

export const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
