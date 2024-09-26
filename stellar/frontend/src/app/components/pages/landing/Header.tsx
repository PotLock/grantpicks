import React from 'react'
import Button from '../../commons/Button'
import HomeSection from './HomeSection'
import HowItWorksSection from './HowItWorksSection'
import FeaturesSection from './FeaturesSection'
import FAQsSection from './FAQsSection'

const LandingHeader = () => {
	return (
		<div className="w-[100%] md:w-[90%] xl:w-[80%] mx-auto pt-20 md:pt-24 xl:pt-32 pb-16 md:pb-20 xl:pb-24 px-4 md:px-0">
			<HomeSection />
			<HowItWorksSection />
			<FeaturesSection />
			<FAQsSection />
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
