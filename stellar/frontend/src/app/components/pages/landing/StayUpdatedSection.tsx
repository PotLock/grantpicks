import React, { useState } from 'react'
import InputText from '../../commons/InputText'
import Image from 'next/image'
import Button from '../../commons/Button'

const StayUpdatedSection = () => {
	const [emailInput, setEmailInput] = useState<string>('')

	return (
		<div className="pt-20 md:pt-24 xl:pt-32 flex flex-col w-full mx-auto">
			<div className="grid lg:flex lg:items-center z-10 rounded-[40px] py-9 sm:py-[67px] px-9 sm:px-[61px] lg:px-0 lg:pl-[61px] bg-gradient-to-l from-[#9E77F8] via-[#8D5EF7] to-[#743CF6] shadow-[0px_8px_20px_0px_rgba(0,0,0,0.05),0px_4px_12px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1),inset_0px_0.5px_0px_0px_rgba(0,0,0,0.1)]">
				<div className="lg:max-w-[743px] grid gap-y-8">
					<p className="text-[40px] md:text-[44px] lg:text-[50px] font-semibold">
						Stay Updated on Funding Opportunities and Innovations!
					</p>
					<p className="text-xl">
						Receive the latest news, updates, and insights from GrantPicks. Be
						the first to know about new funding rounds and project highlights!
					</p>
					<div className="grid sm:flex lg:grid xl:flex gap-5 w-full">
						<div className="flex-1">
							<InputText
								type="email"
								placeholder="Enter Your Email"
								value={emailInput}
								onChange={(e) => {
									setEmailInput(e.target.value)
								}}
								className="!rounded-full"
							/>
						</div>
						<Button color="purple" className="px-[58px]" onClick={() => {}}>
							Submit
						</Button>
					</div>
				</div>
				<div className="lg:shrink-0 flex justify-center">
					<Image
						src="/assets/images/grantpicks-logo-large.png"
						alt="grantpicks-logo"
						width={514.68}
						height={320.51}
					/>
				</div>
			</div>
		</div>
	)
}

export default StayUpdatedSection
