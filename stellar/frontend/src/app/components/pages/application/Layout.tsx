import React from 'react'
import BaseLayout from '../../commons/BaseLayout'

const ApplicationLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<div className="bg-white">{children}</div>
		</BaseLayout>
	)
}

export default ApplicationLayout
