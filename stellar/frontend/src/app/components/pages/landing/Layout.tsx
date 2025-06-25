import React, { useState } from 'react'
import BaseLayout from '../../commons/BaseLayout'
import Footer from '../../commons/Footer'
import Navbar from './Navbar'
import DisclaimerBanner from './DisclaimerBanner'

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
	const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false)

	return (
		<BaseLayout>
			<>
				<div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(45deg, rgba(256,256,256) 0%,  rgba(237, 233, 254) 40%, rgba(256,256,256) 80%, rgba(237, 233, 254) 100%)' }} />
				<div className="bg-[url('/assets/images/container.png')] absolute inset-0 h-full z-0"></div>
				<DisclaimerBanner
					isBannerVisible={isBannerVisible}
					setIsBannerVisible={setIsBannerVisible}
				/>
				<Navbar isBannerVisible={isBannerVisible} />
				<div className="relative z-10">
					<div>{children}</div>
					<Footer />
				</div>
			</>
		</BaseLayout>
	)
}

export default LandingLayout
