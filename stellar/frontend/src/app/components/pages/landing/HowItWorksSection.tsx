import React from 'react'
import MultiChainSvg from '../../svgs/MultiChainSvg'
import ResultPayoutSvg from '../../svgs/ResultPayoutSvg'
import BudgetBoxingSvg from '../../svgs/BudgetBoxingSvg'
import VotingSvg from '../../svgs/VotingSvg'
import ExploreSvg from '../../svgs/ExploreSvg'
import CreateRoundsSvg from '../../svgs/CreateRoundsSvg'
import IconGearCheck from '../../svgs/IconGearCheck'

const HowItWorksSection = () => {
	return (
		<div className="pt-20 md:pt-24 xl:pt-32 grid justify-items-center">
			<div className="flex items-center gap-x-[10px] z-10 pb-5">
				<IconGearCheck />
				<p className="text-grantpicks-black-950 font-semibold text-xl">
					HOW IT WORKS
				</p>
			</div>
			<div className="grid gap-y-[18px] pb-[51px] z-10 justify-items-center">
				<p className="font-black text-[40px] md:text-[44px] lg:text-[50px] xl:text-[62px] text-[#171717] uppercase text-center max-w-[782px]">
					What Can You Do on GrantPicks?
				</p>
				<p className="font-semibold text-xl text-[#687076] text-center max-w-[846px]">
					GrantPicks offers a unique platform for funding projects through
					head-to-head contests and community voting.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 z-10">
				<div className="bg-white drop-shadow p-2 rounded-2xl">
					<div className="h-[160px] rounded-t-xl bg-grantpicks-purple-50 relative">
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
							<CreateRoundsSvg />
						</div>
					</div>
					<div className="text-[#11181C] p-3">
						<p className="font-semibold text-lg text-[#11181C]">
							Create Funding Rounds
						</p>
						<p className="text-lg text-[#11181C]/50">
							Round managers can effortlessly set up funding rounds, defining
							parameters and inviting innovative projects to apply.
						</p>
					</div>
				</div>
				<div className="bg-white drop-shadow p-2 rounded-2xl">
					<div className="h-[160px] rounded-t-xl bg-grantpicks-purple-50 relative">
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
							<ExploreSvg />
						</div>
					</div>
					<div className="text-[#11181C] p-3">
						<p className="font-semibold text-lg text-[#11181C]">
							Explore and Apply to Rounds
						</p>
						<p className="text-lg text-[#11181C]/50">
							Projects seeking funding can easily apply to rounds, making their
							cases accessible to round managers and voters.
						</p>
					</div>
				</div>
				<div className="bg-white drop-shadow p-2 rounded-2xl">
					<div className="h-[160px] rounded-t-xl bg-grantpicks-purple-50 relative">
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
							<VotingSvg />
						</div>
					</div>
					<div className="text-[#11181C] p-3">
						<p className="font-semibold text-lg text-[#11181C]">
							Engage in Exciting Pairwise Voting
						</p>
						<p className="text-lg text-[#11181C]/50">
							Voters participate in thrilling head-to-head matchups, selecting
							their favorite projects from pairs presented to them. projects.
						</p>
					</div>
				</div>
				<div className="bg-white drop-shadow p-2 rounded-2xl">
					<div className="h-[160px] rounded-t-xl bg-grantpicks-purple-50 relative">
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
							<BudgetBoxingSvg />
						</div>
					</div>
					<div className="text-[#11181C] p-3">
						<p className="font-semibold text-lg text-[#11181C]">
							Utilize the Budget Boxing Algorithm
						</p>
						<p className="text-lg text-[#11181C]/50">
							GrantPicks uses the budget boxing algorithm to allocate funds
							based on voter preferences.
						</p>
					</div>
				</div>
				<div className="bg-white drop-shadow p-2 rounded-2xl">
					<div className="h-[160px] rounded-t-xl bg-grantpicks-purple-50 relative">
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
							<ResultPayoutSvg />
						</div>
					</div>
					<div className="text-[#11181C] p-3">
						<p className="font-semibold text-lg text-[#11181C]">
							Track Results and Payouts
						</p>
						<p className="text-lg text-[#11181C]/50">
							Once the voting is complete, round managers can easily track
							results and trigger payouts to successful projects.
						</p>
					</div>
				</div>
				<div className="bg-white drop-shadow p-2 rounded-2xl">
					<div className="h-[160px] rounded-t-xl bg-grantpicks-purple-50 relative">
						<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
							<MultiChainSvg />
						</div>
					</div>
					<div className="text-[#11181C] p-3">
						<p className="font-semibold text-lg text-[#11181C]">
							Multi-Chain Support
						</p>
						<p className="text-lg text-[#11181C]/50">
							Operates on multiple blockchains, allowing for broader
							accessibility and participation across different networks.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default HowItWorksSection
