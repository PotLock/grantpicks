import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				titilumWeb: ['var(--font-titilium-web)'],
			},
			colors: {
				grantpicks: {
					black: {
						600: '#656565',
						950: '#292929',
					},
					white: '#FFFFFF',
					purple: {
						100: '#ede9fe',
						950: '#2E1065',
					},
				},
			},
		},
	},
	plugins: [],
}
export default config
