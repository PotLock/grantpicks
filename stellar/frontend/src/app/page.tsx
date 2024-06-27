'use client'

import LandingHeader from './components/pages/landing/Header'
import LandingLayout from './components/pages/landing/Layout'
import WalletProvider from './providers/WalletProvider'

export default function Home() {
	return (
		<WalletProvider>
			<LandingLayout>
				<LandingHeader />
			</LandingLayout>
		</WalletProvider>
	)
}
