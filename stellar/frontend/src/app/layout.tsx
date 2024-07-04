import type { Metadata } from 'next'
import { Titillium_Web } from 'next/font/google'
import Head from 'next/head' // Import Head
import './globals.css'
import 'react-datepicker/dist/react-datepicker.css'
import '@near-wallet-selector/modal-ui/styles.css'
import WalletProvider from './providers/WalletProvider'

const titiliumWeb = Titillium_Web({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-titilium-web',
	weight: ['200', '300', '400', '600', '700', '900'],
})
export const metadata: Metadata = {
	title: 'GrantPicks',
	description: 'Grants made fun! QUICKLY PICK YOUR FAVORITE PROJECTS, GET THEM FUNDED, AND WIN POINTS!',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<Head>
				<title>{metadata.title}</title>
				<meta name="description" content={metadata.description} />
				<meta property="og:title" content={metadata.title} />
				<meta property="og:description" content={metadata.description} />
				<meta property="og:image" content="https://grantpicks.com/assets/images/GrantPicksMeta.png" />
				<meta property="og:url" content="https://grantpicks.com" />
				<meta property="og:type" content="website" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:image" content="https://grantpicks.com/assets/images/GrantPicksMeta.png" />
			</Head>
			<body className={titiliumWeb.className}>
				<WalletProvider>{children}</WalletProvider>
			</body>
		</html>
	)
}