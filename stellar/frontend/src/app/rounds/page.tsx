'use client'

import React from 'react'
import ApplicationLayout from '../components/pages/application/Layout'
import Header from '../components/pages/application/Header'
import Rounds from '../components/pages/application/Rounds'
import Footer from '../components/commons/Footer'

const AppPage = () => {
	return (
		<ApplicationLayout>
			<Header />
			<Rounds />
			<Footer />
		</ApplicationLayout>
	)
}

export default AppPage
