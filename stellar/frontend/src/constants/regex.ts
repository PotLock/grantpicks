export const YOUTUBE_URL_REGEX =
	/((http(s)?:\/\/)?)(www\.)?((youtube\.com\/)|(youtu.be\/))[\S]+/

export const GITHUB_URL_REGEX = new RegExp(
	'^https?:\\/\\/(www\\.)?github\\.com\\/' +
		'[a-zA-Z0-9_-]+\\/' +
		'[a-zA-Z0-9_-]+(\\/)?$',
	'i',
)
