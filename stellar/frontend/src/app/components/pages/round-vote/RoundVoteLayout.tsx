import React from 'react'
import BaseLayout from '../../commons/BaseLayout'
import Footer from '../../commons/Footer'
import TopNav from '../../commons/TopNav'

const RoundVoteLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<TopNav />
			<div className="bg-white flex flex-col min-h-screen w-full">
				<div className="flex-grow w-full md:w-[85%] mx-auto pt-16 md:pt-20 lg:pt-28 px-4 md:px-2 lg:px-0">
					{children}
				</div>
				<Footer />
			</div>
		</BaseLayout>
	)
}

export default RoundVoteLayout
