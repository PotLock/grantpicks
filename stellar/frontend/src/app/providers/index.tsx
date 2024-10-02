import React from 'react'
import GlobalProvider from './GlobalProvider'
import ModalProvider from './ModalProvider'
import WalletProvider from './WalletProvider'
import { PotlockServiceProvider } from '@/services/potlock'

const Providers = ({
	children,
}: Readonly<{
	children: React.ReactNode
}>) => {
	return (
		<>
			<GlobalProvider>
				<WalletProvider>
					<ModalProvider>
						<PotlockServiceProvider>{children}</PotlockServiceProvider>
					</ModalProvider>
				</WalletProvider>
			</GlobalProvider>
		</>
	)
}

export default Providers
