import React from 'react'
import BaseLayout from '../../../commons/BaseLayout'
import TopNav from '@/app/components/commons/TopNav'
import Footer from '@/app/components/commons/Footer'

const MyVotesLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<BaseLayout>
			<TopNav />
			<div className="bg-white flex flex-col min-h-screen w-full">
				<div className="flex-grow md:w-[90%] lg:w-[80%] mx-auto pt-16 md:pt-20 lg:pt-28 px-4 md:px-2 lg:px-0">
					{children}
				</div>
				<Footer />
			</div>
		</BaseLayout>
	)
}

export default MyVotesLayout
