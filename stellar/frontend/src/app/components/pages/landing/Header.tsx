import React from 'react'
import HomeSection from './HomeSection'
import HowItWorksSection from './HowItWorksSection'
import FeaturesSection from './FeaturesSection'
import FAQsSection from './FAQsSection'
import StayUpdatedSection from './StayUpdatedSection'

const LandingHeader = () => {
	return (
		<div className="w-full mx-auto pt-20 md:pt-24 xl:pt-32 pb-16 md:pb-20 xl:pb-24 px-4 md:px-12 xl:px-20">
			<HomeSection />
			<HowItWorksSection />
			<FeaturesSection />
			<FAQsSection />
			<StayUpdatedSection />
		</div>
	)
}

export default LandingHeader
