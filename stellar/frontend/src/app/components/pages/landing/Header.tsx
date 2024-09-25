import Image from 'next/image'
import React from 'react'
import IconCheck from '../../svgs/IconCheck'
import Button from '../../commons/Button'
import HomeSection from './HomeSection'

const LandingHeader = () => {
	return (
		<div className="w-[100%] md:w-[90%] xl:w-[80%] mx-auto pt-20 md:pt-24 xl:pt-32 pb-16 md:pb-20 xl:pb-24 px-4 md:px-0">
			<HomeSection />
			<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col items-center">
				<Image
					src="/assets/images/check-bubble.png"
					alt=""
					width={50}
					height={50}
					className="mb-4 md:mb-6 z-10"
				/>
				<p className="text-center z-10 text-[25px] md:text-[27px] lg:text-[30px] xl:text-[32px] font-black text-grantpicks-black-950 mb-10 lg:mb-12">
					HOW IT WORKS
				</p>
				<div className="how-it-works-div z-10 p-2 md:p-3 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 w-full md:w-[80%] lg:w-[70%]">
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								1
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Round manager creates a Round
						</p>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								2
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							Projects apply in the Round{' '}
						</p>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4 px-4 py-3 md:py-5 border border-black/10 rounded-lg col-span-1 md:col-span-2">
						<div className="how-it-works-counter py-2 px-[14px]">
							<p className="text-base lg:text-xl font-semibold text-grantpicks-black-950">
								3
							</p>
						</div>
						<p className="text-xl font-semibold text-grantpicks-black-950">
							{`Voters pick from a pair that's considered to have the most impact`}{' '}
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
										className="stroke-grantpicks-purple-400 shrink-0"
									/>
									<p className="text-base font-normal text-grantpicks-black-600">
										Get access to funding rounds
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<IconCheck
										size={24}
										className="stroke-grantpicks-purple-400 shrink-0"
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
										className="stroke-grantpicks-purple-400 shrink-0"
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
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
								<p className="text-base font-normal text-grantpicks-black-600">
									Create prefund rounds non custodially or do payouts later{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
								<p className="text-base font-normal text-grantpicks-black-600">
									Choose voter requirements{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
								<p className="text-base font-normal text-grantpicks-black-600">
									Add projects manually or have them apply{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
								<p className="text-base font-normal text-grantpicks-black-600">
									Flag bot voters {' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
								<p className="text-base font-normal text-grantpicks-black-600">
									Calculate and adjust payouts{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
								<p className="text-base font-normal text-grantpicks-black-600">
									Audit votes and pay results{' '}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<IconCheck
									size={24}
									className="stroke-grantpicks-purple-400 shrink-0"
								/>
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
								Get access to funding rounds
							</p>
						</div>
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								Can I contribute to projects directly?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								This mechanism is strictly voting, However you can separately
								donate through Potlock’s donation contracts?{' '}
							</p>
						</div>
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								What blockchains do you currently support?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								Stellar and NEAR
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
								<span className="text-base font-bold cursor-pointer hover:opacity-80">
									Check out all our audits here
								</span>
							</p>
						</div>
						<div className="space-y-2 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
							<p className="text-base font-bold text-grantpicks-black-950">
								How does the voting algorithm work?{' '}
							</p>
							<p className="text-base font-normal text-grantpicks-black-600">
								Calculates based on preferences. Actual script can be found here
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
							onClick={() => {}}
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
