export const YOUTUBE_URL_REGEX =
	/((http(s)?:\/\/)?)(www\.)?((youtube\.com\/)|(youtu.be\/))[\S]+/

export const GITHUB_URL_REGEX = new RegExp(
	'^https?:\\/\\/(www\\.)?github\\.com\\/' +
		'[a-zA-Z0-9_-]+\\/' +
		'[a-zA-Z0-9_-]+(\\/)?$',
	'i',
)

export const TELEGRAM_USERNAME_REGEX = /^[a-zA-Z0-9_]{5,32}$/

export const INSTAGRAM_USERNAME_REGEX = /^[a-zA-Z0-9_.]{1,30}$/

export const TWITTER_USERNAME_REGEX = /^[a-zA-Z0-9_]{5,15}$/

export const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
