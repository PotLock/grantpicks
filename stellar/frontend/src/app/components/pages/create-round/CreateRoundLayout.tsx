import React from 'react'
import BaseLayout from '../../commons/BaseLayout'
import Footer from '../../commons/Footer'

const CreateRoundLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<div className="bg-grantpicks-black-200 min-h-screen">
				{children}
				<Footer />
			</div>
		</BaseLayout>
	)
}

export default CreateRoundLayout
