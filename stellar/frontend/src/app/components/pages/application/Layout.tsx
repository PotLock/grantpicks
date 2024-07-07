import React from 'react'
import BaseLayout from '../../commons/BaseLayout'
import TopNav from '../../commons/TopNav'

const ApplicationLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<TopNav />
			<div className="bg-white pt-24 md:pt-28 lg:pt-32 w-full md:w-11/12 lg:w-10/12 mx-auto px-4 md:px-0">
				{children}
			</div>
		</BaseLayout>
	)
}

export default ApplicationLayout
