import React, { useState } from 'react'
import IconQuestionBubble from '../../svgs/IconQuestionBubble'
import IconClose from '../../svgs/IconClose'
import IconPlus from '../../svgs/IconPlus'

const FAQsSection = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null)

	const faqs = [
		{
			question: 'Who can create a round?',
			answer:
				'Anyone can create a funding round, but initially will be whitelisted. For more info check out our guide for Round Owners / Managers.',
		},
		{
			question: 'Can I contribute to projects directly?',
			answer:
				'This mechanism is strictly voting, However you can separately donate through Potlock’s donation contracts.',
		},
		{
			question: 'What blockchains do you currently support?',
			answer: 'Stellar and NEAR.',
		},
		{
			question: 'Are these contracts audited?',
			answer:
				'Our contracts are currently going under audits. Check out all our audits here.',
		},
		{
			question: 'How does the voting algorithm work?',
			answer:
				'Calculates based on preferences. Actual script can be found here.',
		},
	]

	const toggleAccordion = (index: number) => {
		setOpenIndex(openIndex === index ? null : index)
	}

	return (
		<div className="pt-20 md:pt-24 xl:pt-32 grid justify-items-center">
			<div className="flex items-center gap-x-[10px] z-10 pb-5">
				<IconQuestionBubble />
				<p className="text-grantpicks-black-950 font-semibold text-xl">FAQs</p>
			</div>
			<div className="grid gap-y-[18px] pb-[51px] z-10 justify-items-center">
				<p className="font-black text-[40px] md:text-[44px] lg:text-[50px] xl:text-[62px] text-[#171717] uppercase text-center max-w-[782px]">
					Frequently Asked Questions → Answers
				</p>
				<p className="font-semibold text-xl text-[#687076] text-center max-w-[846px]">
					Find quick and clear responses to the most frequently asked questions
					about GrantPicks and its features.
				</p>
			</div>
			<div className="w-full md:w-[80%] lg:w-[70%] space-y-4 z-10">
				{faqs.map((faq, index) => (
					<div key={index} className="bg-grantpicks-purple-100 rounded-2xl">
						<div className="flex justify-between items-center w-full py-8 px-9 text-left">
							<p className="text-xl font-bold text-[#0A0A0A]">{faq.question}</p>
							<button onClick={() => toggleAccordion(index)}>
								{openIndex === index ? (
									<IconClose
										size={12}
										className="fill-[#1E1E1E] stroke-[#1E1E1E] cursor-pointer"
									/>
								) : (
									<IconPlus
										size={12}
										className="fill-[#1E1E1E] stroke-[#1E1E1E] cursor-pointer"
									/>
								)}
							</button>
						</div>
						{openIndex === index && (
							<div className="pb-8 px-9 bg-grantpicks-purple-100 rounded-2xl">
								<p className="text-lg font-semibold text-[#171717]">
									{faq.answer}
								</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default FAQsSection
