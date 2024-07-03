import React from 'react'
import BaseLayout from '../../commons/BaseLayout'

const CreateRoundLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<div className="bg-grantpicks-black-200 min-h-screen">{children}</div>
		</BaseLayout>
	)
}

export default CreateRoundLayout
