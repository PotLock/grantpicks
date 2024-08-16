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
						100: '#EFEFEF',
						200: '#DCDCDC',
						300: '#BDBDBD',
						400: '#989898',
						500: '#7C7C7C',
						600: '#656565',
						900: '#3D3D3D',
						950: '#292929',
					},
					white: '#FFFFFF',
					purple: {
						50: '#F5F3FF',
						100: '#ede9fe',
						200: '#DDD6FE',
						400: '#A78BFA',
						500: '#895AF6',
						800: '#5A21B6',
						950: '#2E1065',
					},
					alpha: {
						50: '#373737',
					},
					red: {
						50: '#FEF3F2',
						100: '#FFE3E1',
						300: '#FFA8A2',
						400: '#FC776D',
						600: '#E22D20',
						950: '#470C08',
					},
					green: {
						50: '#F1FDF0',
						300: '#88F283',
						400: '#4CE246',
						600: '#17A512',
						700: '#168312',
						800: '#166714',
					},
					amber: {
						50: '#FFFBEB',
						200: '#FAE48D',
						400: '#F6BD29',
						700: '#B0540D',
						800: '#8F4111',
					},
				},
			},
		},
	},
	plugins: [],
}
export default config
