import React from 'react'
import BaseLayout from '../../commons/BaseLayout'
import TopNav from '../../commons/TopNav'

const ApplicationLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<TopNav />
			<div className="bg-white pt-24 md:pt-28 lg:pt-32 px-[5vw] md:px-[10vw] xl:px-[15vw] py-4 mx-auto">
				{children}
			</div>
		</BaseLayout>
	)
}

export default ApplicationLayout
