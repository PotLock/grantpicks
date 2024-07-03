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
						50: '#F7F7F7',
						200: '#DCDCDC',
						400: '#989898',
						500: '#7C7C7C',
						600: '#656565',
						900: '#3D3D3D',
						950: '#292929',
					},
					white: '#FFFFFF',
					purple: {
						100: '#ede9fe',
						400: '#A78BFA',
						950: '#2E1065',
					},
					alpha: {
						50: '#373737',
					},
					red: {
						400: '#FC776D',
						600: '#E22D20',
					},
				},
			},
		},
	},
	plugins: [],
}
export default config
