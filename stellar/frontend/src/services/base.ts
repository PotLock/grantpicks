import axios from 'axios'

const baseClient = (api_url: string) => {
	const token = localStorage.getItem(localStorage.TOKEN)
	const headers = token
		? {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			}
		: {
				'Content-Type': 'application/json',
			}
	const client = axios.create({
		baseURL: api_url,
		headers,
		timeout: 180000,
		withCredentials: false,
	})
	client.interceptors.request.use((config: any) => {
		config.headers = config.headers || {}
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	})

	return client
}

export default baseClient
