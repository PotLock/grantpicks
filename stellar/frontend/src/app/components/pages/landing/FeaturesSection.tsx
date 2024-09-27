import React, { useState } from 'react'
import IconGearCheck from '../../svgs/IconGearCheck'
import clsx from 'clsx'
import IconSubmitDocument from '../../svgs/IconSubmitDocument'
import IconBrowserWindow from '../../svgs/IconBrowserWindow'
import IconPeopleCommunity from '../../svgs/IconPeopleCommunity'
import IconVote from '../../svgs/IconVote'
import IconHandCoin from '../../svgs/IconHandCoin'
import IconExplore from '../../svgs/IconExplore'
import IconTipMoney from '../../svgs/IconTipMoney'
import IconProjectRed from '../../svgs/IconProjectRed'
import IconBotSparkle from '../../svgs/IconBotSparkle'
import IconCreditCardPay from '../../svgs/IconCreditCardPay'
import IconAudit from '../../svgs/IconAudit'

const FeaturesSection = () => {
	const [tab, setTab] = useState<string>('projects')
	const tabTitle = [
		{ id: 'projects', title: 'Projects' },
		{ id: 'public', title: 'Public' },
		{ id: 'funders', title: 'Funders' },
	]

	const projectsData = [
		{
			title: 'Explore and Apply to Rounds',
			description:
				'Projects seeking funding can easily apply to rounds, making their cases accessible to round managers and voters.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-[rgba(74,144,226,0.12)] to-[rgba(74,144,226,0.3)] shadow-[0_8px_10px_-6px_rgba(74,144,226,0.3),0_20px_25px_-5px_rgba(74,144,226,0.3),0_0_0_1px_rgba(74,144,226,0.6)]">
					<IconSubmitDocument />
				</div>
			),
		},
		{
			title: 'Custom Project Pages',
			description:
				'Projects can develop unique profiles that highlight their initiatives, making them discoverable across Potlock products and increasing visibility.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-purple-500/10 to-purple-500/20 shadow-[0_8px_10px_-6px_rgba(90,33,182,0.3),_0_20px_25px_-5px_rgba(90,33,182,0.3),_0_0px_0px_1px_rgba(90,33,182,0.6)]">
					<IconBrowserWindow />
				</div>
			),
		},
		{
			title: 'Participate in Community Feedback',
			description:
				'Projects can receive feedback from voters and the community, which can help refine their proposals and improve their chances of funding.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-[rgba(0,150,136,0.12)] to-[rgba(0,150,136,0.3)] shadow-[0px_8px_10px_-6px_rgba(0,150,136,0.3),0px_20px_25px_-5px_rgba(0,150,136,0.3),0px_0px_0px_1px_rgba(0,150,136,0.6)]">
					<IconPeopleCommunity />
				</div>
			),
		},
	]

	const publicData = [
		{
			title: 'Vote for Projects',
			description:
				'Members of the public can participate in funding rounds by voting for their favorite projects.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-[#66c5591f] to-[#66c55933] shadow-[0_8px_10px_-6px_#66c5594d,0_20px_25px_-5px_#66c5594d,0_0px_0px_1px_#66c55999]">
					<IconVote fill="#66C559" />
				</div>
			),
		},
		{
			title: 'Earn Retroactive Points',
			description:
				'Voters can earn points for their participation, which can be redeemed for rewards or recognition within the GrantPicks community.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-blue-200/30 to-blue-600/30 shadow-[0px_8px_10px_-6px_rgba(59,130,246,0.3),0px_20px_25px_-5px_rgba(59,130,246,0.3),0px_0px_0px_1px_rgba(59,130,246,0.6)]">
					<IconHandCoin />
				</div>
			),
		},
		{
			title: 'Explore Funding Rounds',
			description:
				'Users can browse ongoing and past funding rounds, gaining insights into project details and results, which helps them make informed voting decisions.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-[rgba(255,152,0,0.5)] to-[rgba(255,152,0,0.3)] shadow-[0px_8px_10px_-6px_rgba(255,152,0,0.3),0px_20px_25px_-5px_rgba(255,152,0,0.3),0px_0px_0px_1px_rgba(255,152,0,0.6)]">
					<IconExplore />
				</div>
			),
		},
	]

	const fundersData = [
		{
			title: 'Create Prefund Rounds',
			description:
				'Set up funding rounds without custodial control, allowing for flexible payout options later on.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-blue-200/30 to-blue-500/30 shadow-[0px_8px_10px_-6px_rgba(59,130,246,0.3),0px_20px_25px_-5px_rgba(59,130,246,0.3),0px_0px_0px_1px_rgba(59,130,246,0.6)]">
					<IconTipMoney />
				</div>
			),
		},
		{
			title: 'Define Voter Requirements',
			description:
				'Customize eligibility criteria for voters to ensure that the right audience engages with your funding rounds.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-purple-500/10 to-purple-500/20 shadow-[0px_8px_10px_-6px_rgba(90,33,182,0.3),0px_20px_25px_-5px_rgba(90,33,182,0.3),0px_0px_0px_1px_rgba(90,33,182,0.6)]">
					<IconVote fill="#5A21B6" />
				</div>
			),
		},
		{
			title: 'Project Management Option',
			description:
				'Add projects manually or allow them to apply directly, streamlining the project selection process.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-tr from-[#ffd8dc80]/50 to-[#dd3345]/30 shadow-[0px_8px_10px_-6px_rgba(221,51,69,0.3),0px_20px_25px_-5px_rgba(221,51,69,0.3),0px_0px_0px_1px_rgba(221,51,69,0.6)]">
					<IconProjectRed />
				</div>
			),
		},
		{
			title: 'Flag Bot Voters',
			description:
				'Maintain the integrity of the voting process by flagging suspicious voting activity.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-teal-200/75 to-teal-600/30 shadow-[0px_8px_10px_-6px_rgba(16,185,129,0.3),0px_20px_25px_-5px_rgba(16,185,129,0.3),0px_0px_0px_1px_rgba(16,185,129,0.6)]">
					<IconBotSparkle />
				</div>
			),
		},
		{
			title: 'Adjust Payout',
			description:
				'Calculate and modify payout distributions based on project performance and voter preferences.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-br from-gray-200/75 to-gray-300 shadow-[0px_8px_10px_-6px_rgba(3,3,3,0.3),0px_20px_25px_-5px_rgba(0,0,0,0.3),0px_0px_0px_1px_rgba(1,1,1,0.6)]">
					<IconCreditCardPay />
				</div>
			),
		},
		{
			title: 'Audit Votes and Results',
			description:
				'Ensure transparency by auditing votes and reviewing payout results, fostering trust within the community.',
			icon: (
				<div className="grid place-content-center rounded-[10px] h-12 w-12 bg-gradient-to-tr from-yellow-300/75 to-yellow-200/75 shadow-[0px_8px_10px_-6px_rgba(245,158,11,0.3),0px_20px_25px_-5px_rgba(245,158,11,0.3),0px_0px_0px_1px_rgba(251,191,36,0.6)]">
					<IconAudit />
				</div>
			),
		},
	]

	const renderList = (
		dataArray: Array<{
			title: string
			icon: React.ReactNode
			description: string
		}>,
	) => {
		return dataArray.map((data) => (
			<div key={data.title} className="grid gap-y-6 content-start">
				{data.icon}
				<div>
					<p className="font-medium text-[#171717]">{data.title}</p>
					<p className="text-[#171717]/50">{data.description}</p>
				</div>
			</div>
		))
	}

	const getDataForTab = () => {
		switch (tab) {
			case 'projects':
				return projectsData
			case 'public':
				return publicData
			case 'funders':
				return fundersData
			default:
				return []
		}
	}

	return (
		<div className="pt-20 md:pt-24 xl:pt-32 grid justify-items-center">
			<div className="flex items-center gap-x-[10px] z-10 pb-5">
				<IconGearCheck />
				<p className="text-grantpicks-black-950 font-semibold text-xl">
					CORE CAPABILITIES
				</p>
			</div>
			<div className="grid gap-y-[18px] pb-[51px] z-10 justify-items-center">
				<p className="font-black text-[40px] md:text-[44px] lg:text-[50px] xl:text-[62px] text-[#171717] uppercase text-center max-w-[782px]">
					Unlock the Power of Collaborative Funding
				</p>
				<p className="font-semibold text-xl text-[#687076] text-center max-w-[846px]">
					Discover GrantPicks&apos; features that enable projects, engage
					voters, and support funders in making impactful funding decisions.
				</p>
			</div>
			<div className="pb-[50px] z-10">
				<div className="flex items-center rounded-full py-[4.75px] px-[2.31px] bg-grantpicks-purple-100 border border-grantpicks-purple-500">
					{tabTitle.map((data) => (
						<button
							key={data.id}
							onClick={() => {
								setTab(data.id)
							}}
							className={clsx(
								'rounded-full py-3 px-3 sm:px-10',
								tab === data.id
									? 'bg-[radial-gradient(83.78%_135.19%_at_52.55%_0%,_#7B3AED_0%,_#5A21B6_99.6%)] text-[#FCFCFC]'
									: 'text-[#171717]',
							)}
						>
							<p className="font-semibold text-xl">{data.title}</p>
						</button>
					))}
				</div>
			</div>
			<div className="z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-8 w-full">
				{renderList(getDataForTab())}
			</div>
		</div>
	)
}

export default FeaturesSection
