import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import IconCheck from '../../svgs/IconCheck'
import Button from '../../commons/Button'
import Link from 'next/link'

const LandingHeader = () => {
	const router = useRouter()
	return (
		<div className="w-[100%] md:w-[90%] xl:w-[80%] mx-auto pt-20 md:pt-24 xl:pt-32 pb-16 md:pb-20 xl:pb-24 px-4 md:px-0">
			<div className="flex flex-col items-center text-grantpicks-black-950 p-4 lg:p-0">
				<div className="flex items-center space-x-4 border border-grantpicks-purple-950 rounded-full px-5 py-2 mb-6 z-10">
					<Image
						src="/assets/images/grantpicksiconsquare.png"
						alt=""
						width={40}
						height={40}
						className="object-contain"
					/>
					<p className="text-base font-bold text-grantpicks-purple-950">{`Introducing GrantPicks`}</p>
				</div>
				<p className="text-[40px] md:text-[44px] lg:text-[50px] xl:text-[62px] max-w-[90%] md:max-w-full hidden md:block font-black text-center uppercase leading-[1.00] whitespace-pre mb-6 z-10">
					{`Head to head contests\nfor funding projects.`}
				</p>
				<p className="text-[40px] md:text-[44px] lg:text-[50px] xl:text-[62px] max-w-[80%] md:max-w-full block md:hidden font-black text-center uppercase leading-[1.00] whitespace-pre-wrap mb-6 z-10">
					{`Head to head contests\nfor funding projects.`}
				</p>
				<div className="flex flex-row justify-center space-x-2 sm:space-x-4 z-10 w-full">
					<button
						onClick={() => router.push(`/application`)}
						className="z-10 launch-app-button  bg-gradient-to-b from-[#7B3AED] to-[#5A21B6] text-white border border-[#DDD6FE] rounded-full px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold shadow-xl transition-all hover:scale-105 duration-500 whitespace-nowrap"
					>
						Launch App
					</button>
					<button
						onClick={() => window.open('https://docs.grantpicks.com', '_blank')}
						className="z-10 learn-more-button bg-white text-[#7B3AED] border border-[#7B3AED] rounded-full px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold transition-all hover:bg-[#F3E8FF] duration-500 whitespace-nowrap"
					>
						Learn More
					</button>
				</div>
			</div>
			<div className="pt-20 md:pt-24 xl:pt-32 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8">
				<div className="flex items-center space-x-4 z-10">
					<Image
						src="/assets/images/item.png"
						width={80}
						height={80}
						alt=""
						className="object-fill"
					/>
					<div>
						<div className="w-10 h-0 border-2 border-black mb-3"></div>
						<p className="text-base md:text-lg xl:text-xl font-semibold text-grantpicks-black-950">
							Quickly create transparent funding pots.
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-4 z-10">
					<Image
						src="/assets/images/item.png"
						width={80}
						height={80}
						alt=""
						className="object-fill"
					/>
					<div>
						<div className="w-10 h-0 border-2 border-black mb-3"></div>
						<p className="text-base md:text-lg xl:text-xl font-semibold text-grantpicks-black-950">
							Run large gamified contests quicker.{' '}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-4 z-10">
					<Image
						src="/assets/images/item.png"
						width={80}
						height={80}
						alt=""
						className="object-fill"
					/>
					<div>
						<div className="w-10 h-0 border-2 border-black mb-3"></div>
						<p className="text-base md:text-lg xl:text-xl font-semibold text-grantpicks-black-950">
							Poll a larger group of voters (rapid sentiment){' '}
						</p>
					</div>
				</div>
			</div>

			<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col items-center">
				<Image
					src="/assets/images/check-bubble.png"
					alt=""
					width={50}
					height={50}
					className="mb-4 md:mb-6 z-10"
				/>
				<p className="text-center z-10 text-[25px] md:text-[27px] lg:text-[30px] xl:text-[32px] font-black text-grantpicks-black-950 mb-10 lg:mb-12">
					<Link href={`https://docs.grantpicks.com`} target="_blank">HOW IT WORKS</Link>
				</p>
				<div className="how-it-works-div z-10 p-2 md:p-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 w-full md:w-[80%] lg:w-[70%]">
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								1
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Manager creates a round
						</p>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								2
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Projects apply to the round{' '}
						</p>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg col-span-1 md:col-span-2">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								3
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Voter picks top choices from a set of random head to head battles{' '}
						</p>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								4
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Fund distribution is calculated via budget boxing algorithm{' '}
						</p>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								5
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Projects get paid out{' '}
						</p>
					</div>
				</div>
			</div>

			<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col items-center">
				<Image
					src="/assets/images/check-bubble.png"
					alt=""
					width={50}
					height={50}
					className="mb-4 md:mb-6 z-10"
				/>
				<p className="text-center z-10 text-[25px] md:text-[27px] lg:text-[30px] xl:text-[32px] font-black text-grantpicks-black-950 mb-10 lg:mb-12">
					FEATURES
				</p>
				<div className="how-it-works-div z-10 p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-5 lg:gap-6 xl:gap-8 w-full md:w-[80%] lg:w-[70%]">
					<div className="space-y-2 md:space-y-5 lg:space-y-6 xl:space-y-8">
						<div className="space-y-2 lg:space-y-4">
							<p className="text-base font-bold text-grantpicks-black-950">
								PROJECTS
							</p>
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<IconCheck
										size={24}
										className="stroke-grantpicks-purple-400"
									/>
									<p className="text-base font-normal text-grantpicks-black-600">
										Get access to funding rounds
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<IconCheck
										size={24}
										className="stroke-grantpicks-purple-400"
									/>
									<p className="text-base font-normal text-grantpicks-black-600">
										Create custom project, discoverable across Potlock products{' '}
									</p>
								</div>
							</div>
						</div>
						<div className="space-y-2 lg:space-y-4">
							<p className="text-base font-bold text-grantpicks-black-950">
								PUBLIC
							</p>
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<IconCheck
										size={24}
										className="stroke-grantpicks-purple-400"
									/>
									<p className="text-base font-normal text-grantpicks-black-600">
										Vote and get retroactive points
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className="space-y-2 lg:space-y-4">
						<p className="text-base font-bold text-grantpicks-black-950">
							FUNDERS
						</p>
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Create prefund rounds non custodially or do payouts later{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Choose voter requirements{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Add projects manually or have them apply{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Flag bot voters{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Calculate and adjust payouts{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Audit votes and pay results{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck size={24} className="stroke-grantpicks-purple-400" />
								<p className="text-base font-normal text-grantpicks-black-600">
									Vote and get retroactive points{' '}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col items-center">
				<Image
					src="/assets/images/chat-bubble.png"
					alt=""
					width={50}
					height={50}
					className="mb-4 md:mb-6 z-10"
				/>
				<p className="text-center z-10 text-[25px] md:text-[27px] lg:text-[30px] xl:text-[32px] font-black text-grantpicks-black-950 mb-10 lg:mb-12">
					FREQUENTLY ASKED QUESTIONS
				</p>
				<div className="how-it-works-div z-10 p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-5 lg:gap-6 xl:gap-8 w-full md:w-[80%] lg:w-[70%]">
					<div className="space-y-2 md:space-y-5 lg:space-y-6 xl:space-y-8">
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								Who can create a round?
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								Anyone can create a funding round, but initially will be whitelisted. For more info check out our guide for <Link href={`https://docs.grantpicks.com/user-guides/for-round-managers`} className="text-[#7B3AED] text-base font-bold cursor-pointer hover:opacity-80" target="_blank">Round Owners / Managers</Link>.
							</p>
						</div>
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								Can I contribute to projects directly?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								This mechanism is strictly voting, However you can separately
								donate through Potlock's donation contracts?{' '}
							</p>
						</div>
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								What blockchains do you currently support?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								<Link href={`https://stellar.org`} className="text-[#7B3AED] text-base font-bold cursor-pointer hover:opacity-80" target="_blank">Stellar</Link> and <Link href={`https://near.org`} className="text-[#7B3AED] text-base font-bold cursor-pointer hover:opacity-80" target="_blank">NEAR</Link>
							</p>
						</div>
					</div>
					<div className="space-y-2 md:space-y-5 lg:space-y-6 xl:space-y-8">
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								Are these contracts audited?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								Our contracts are currently going under audits.{' '}
								<Link href="https://potlock.org/audits" target="_blank" className="text-[#7B3AED] text-base font-bold cursor-pointer hover:opacity-80">
									Check out all our audits here
								</Link>
							</p>
						</div>
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								How does the voting algorithm work?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								Calculates based on preferences using budget boxing. <Link href={`https://docs.grantpicks.com/user-guides/pairwise-voting-explained`} className="text-[#7B3AED] text-base font-bold cursor-pointer hover:opacity-80" target="_blank">Actual script can be found here</Link>
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col w-[85%] md:w-[80%] lg:w-[70%] mx-auto">
				<div className="easily-decide-div z-10 p-3 md:p-5 lg:p-6 flex flex-col md:flex-row items-center justify-start md:justify-between w-full">
					<p className="text-[25px] font-black text-white uppercase max-w-[260px] md:max-w-[280px] lg:max-w-[320px] xl:max-w-[380px] text-center md:text-left mb-4 md:mb-0">
						{`Easily decide how funding\nis allocated with GRANTPICKS`}
					</p>
					<div className="w-full md:w-auto">
						<Button
							color="transparent"
							isFullWidth
							className="!launch-app-button-easily-decide !px-10 !py-4 md:!py-3"
							onClick={() => { }}
						>
							<p className="text-sm font-semibold text-white">Launch App</p>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LandingHeader
