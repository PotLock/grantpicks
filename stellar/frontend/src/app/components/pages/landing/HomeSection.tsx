import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import PurpleUnderline from '../../svgs/PurpleUnderline'
import IconRocket from '../../svgs/IconRocket'
import IconExternalLink from '../../svgs/IconExternalLink'
import IconFunding from '../../svgs/IconFunding'
import IconGame from '../../svgs/IconGame'
import IconVerticalBar from '../../svgs/IconVerticalBar'

const HomeSection = () => {
	const router = useRouter()

	return (
		<div>
			<div className="flex flex-col items-center text-grantpicks-black-950 p-4 lg:p-0 mt-[91px]">
				<div className="flex justify-center items-center gap-x-[6px] bg-[#F4F4F5] border border-white drop-shadow rounded-full h-7 w-[221px] mb-6 z-10">
					<Image
						src="/assets/images/grantpicks-logo-new.png"
						alt="grantpicks-logo"
						width={29}
						height={18}
					/>
					<p className="text-[13px] font-medium text-[#313131]">
						Introducing GrantPicks
					</p>
				</div>
				<p className="text-[#281950] text-[40px] md:text-[44px] lg:text-[50px] xl:text-[62px] max-w-[90%] md:max-w-full font-black text-center uppercase whitespace-pre-wrap md:whitespace-pre mb-6 z-10">
					{`Head to Head `}
					<span className="relative">
						Contests
						<div className="absolute right-0 bottom-1 xl:bottom-2">
							<PurpleUnderline className="w-[155px] md:w-[175px] lg:w-[200px] xl:w-[255px]" />
						</div>
					</span>
					{`\nfor Project Funding`}
				</p>
				<p className="text-[#687076] text-xl z-10 pb-[61px] max-w-[615px] text-center whitespace-pre-wrap">
					Join the competition! Vote for innovative projects in thrilling
					head-to-head battles and help decide which ideas get funded.
				</p>
				<div className="grid md:flex gap-6 w-full md:justify-center">
					<button
						onClick={() => {
							router.push('/application')
						}}
						className="flex items-center justify-center z-10 md:w-auto text-white gap-x-[10px] px-7 h-12 purple-button transition-all hover:scale-105 duration-500"
					>
						<p className="text-sm font-semibold">Launch App</p>
						<IconRocket size={18} className="fill-white" />
					</button>
					<button className="flex items-center justify-center z-10 md:w-auto gap-x-[10px] px-7 h-12 rounded-full bg-white border border-grantpicks-black-300 drop-shadow text-grantpicks-black-950 transition-all hover:scale-105 duration-500">
						<p className="text-sm font-semibold">Learn More</p>
						<IconExternalLink size={18} className="stroke-black" />
					</button>
				</div>
			</div>
			<div className="pt-[91px] py-3 grid justify-items-center grid-cols-1 md:grid-cols-3 gap-12">
				<div className="grid justify-items-center z-10 content-start">
					<IconFunding />
					<div className="grid gap-y-6">
						<p className="font-semibold text-xl text-[#281950] text-center">
							Transparent Funding Pots
						</p>
						<p className="text-[#281950BF]/75 text-center">
							Establish clear funding mechanisms that allow all participants to
							track contributions and allocations.
						</p>
					</div>
				</div>
				<div className="grid justify-items-center z-10 content-start">
					<IconGame />
					<div className="grid gap-y-6">
						<p className="font-semibold text-xl text-[#281950] text-center">
							Gamified Contest Experience
						</p>
						<p className="text-[#281950BF]/75 text-center">
							Enhance user engagement through interactive contests that make
							voting enjoyable and rewarding.
						</p>
					</div>
				</div>
				<div className="grid justify-items-center z-10 content-start">
					<IconVerticalBar />
					<div className="grid gap-y-6">
						<p className="font-semibold text-xl text-[#281950] text-center">
							Rapid Sentiment Polling
						</p>
						<p className="text-[#281950BF]/75 text-center">
							Gather quick insights from a broad audience using our efficient
							pairwise voting system.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default HomeSection
