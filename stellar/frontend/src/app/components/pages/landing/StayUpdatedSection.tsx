import React, { useEffect } from 'react'

const StayUpdatedSection = () => {
	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://embeds.beehiiv.com/attribution.js'
		script.async = true
		document.body.appendChild(script)

		return () => {
			document.body.removeChild(script)
		}
	}, [])

	return (
		<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col w-full mx-auto">
			<div className="z-10 flex justify-center rounded-[40px] py-9 sm:py-[67px] px-9 sm:px-[61px] bg-[#743CF6] shadow-[0px_8px_20px_0px_rgba(0,0,0,0.05),0px_4px_12px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_0px_rgba(0,0,0,0.1)]">
				<div className="bg-[url('/assets/images/container.png')] absolute inset-0 h-full opacity-5"></div>
				<div className="grid gap-y-8 justify-items-center max-w-[743px] z-10">
					<p className="text-[40px] md:text-[44px] lg:text-[50px] font-semibold text-center">
						Stay Updated on Funding Opportunities and Innovations!
					</p>
					<p className="text-xl text-center">
						Receive the latest news, updates, and insights from GrantPicks. Be
						the first to know about new funding rounds and project highlights!
					</p>
					<iframe
						src="https://embeds.beehiiv.com/fe6499f8-35e3-4351-bba7-a4ba4c03ee41?slim=true"
						data-test-id="beehiiv-embed"
						height="52"
						style={{
							margin: 0,
							borderRadius: '0px',
							backgroundColor: 'transparent',
						}}
					></iframe>
				</div>
			</div>
		</div>
	)
}

export default StayUpdatedSection
