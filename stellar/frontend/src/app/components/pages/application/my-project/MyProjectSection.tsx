import Button from '@/app/components/commons/Button'
import { TMyProjectTab } from '@/types/project'
import React, { Fragment, useState } from 'react'
import MyProjectOverview from './MyProjectOverview'
import MyProjectTeam from './MyProjectTeam'
import MyProjectMedia from './MyProjectMedia'
import MyProjectLinks from './MyProjectLinks'
import MyProjectFundingRaised from './MyProjectFundingRaised'

const MyProjectSection = () => {
	const [selectedTab, setSelectedtab] = useState<TMyProjectTab>('overview')
	const [tabs, setTabs] = useState<{ key: string; value: string }[]>([
		{
			key: 'overview',
			value: 'Overview',
		},
		{
			key: 'team',
			value: 'Team',
		},
		{
			key: 'media',
			value: 'Media',
		},
		{
			key: 'links',
			value: 'Links',
		},
		{
			key: 'funding_raised',
			value: 'Funding Raised',
		},
	])

	return (
		<div className="mt-6 md:mt-8 flex flex-col lg:flex-row">
			<div className="w-full lg:w-[30%]">
				<div className="flex flex-row lg:flex-col space-x-2 lg:space-y-2 w-full lg:w-[70%] lg:w overflow-x-auto lg:overscroll-x-none mb-4 lg:mb-0">
					{tabs.map((tab, index) => (
						<div key={index} className="flex-shrink-0">
							{tab.key === selectedTab ? (
								<Button
									color="black-950"
									isFullWidth
									className="!rounded-full !px-5 !py-2"
									onClick={() => setSelectedtab(tab.key as TMyProjectTab)}
									textAlign="left"
								>
									{tab.value}
								</Button>
							) : (
								<Button
									color="transparent"
									isFullWidth
									className="!px-5 !py-2"
									onClick={() => setSelectedtab(tab.key as TMyProjectTab)}
									textAlign="left"
								>
									{tab.value}
								</Button>
							)}
						</div>
					))}
				</div>
			</div>
			{selectedTab === 'overview' && <MyProjectOverview />}
			{selectedTab === 'team' && <MyProjectTeam />}
			{selectedTab === 'media' && <MyProjectMedia />}
			{selectedTab === 'links' && <MyProjectLinks />}
			{selectedTab === 'funding_raised' && <MyProjectFundingRaised />}
		</div>
	)
}

export default MyProjectSection
