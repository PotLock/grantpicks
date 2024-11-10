import React, { useState } from 'react'
import BaseLayout from '../../commons/BaseLayout'
import Footer from '../../commons/Footer'
import Navbar from './Navbar'
import DisclaimerBanner from './DisclaimerBanner'

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
	const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true)

	return (
		<BaseLayout>
			<>
				<div
					className="absolute inset-0"
					style={{
						background:
							'linear-gradient(45deg, rgba(256,256,256) 0%,  rgba(237, 233, 254) 40%, rgba(256,256,256) 80%, rgba(237, 233, 254) 100%)',
					}}
				/>
				<div className="bg-[url('/assets/images/container.png')] z-10 absolute inset-0 h-full"></div>
				<DisclaimerBanner
					isBannerVisible={isBannerVisible}
					setIsBannerVisible={setIsBannerVisible}
				/>
				<Navbar isBannerVisible={isBannerVisible} />
				<div className="z-20">{children}</div>
				<Footer />
			</>
		</BaseLayout>
	)
}

export default LandingLayout
