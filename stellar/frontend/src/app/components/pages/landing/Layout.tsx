import React from 'react'
import BaseLayout from '../../commons/BaseLayout'

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
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
				<div className="z-20">{children}</div>
			</>
		</BaseLayout>
	)
}

export default LandingLayout
