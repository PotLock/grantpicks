'use client'

import React from 'react'
import ApplicationLayout from '../components/pages/application/Layout'
import TopNav from '../components/commons/TopNav'
import WalletProvider from '../providers/WalletProvider'

const AppPage = () => {
	return (
		<WalletProvider>
			<ApplicationLayout>
				<TopNav />
			</ApplicationLayout>
		</WalletProvider>
	)
}

export default AppPage
