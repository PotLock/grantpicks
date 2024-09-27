import Image from 'next/image'
import React from 'react'
import IconRocket from '../../svgs/IconRocket'
import { useRouter } from 'next/navigation'
import Button from '../../commons/Button'

const Navbar = () => {
	const router = useRouter()

	const scrollToSection = (sectionId: string) => {
		const section = document.getElementById(sectionId)
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<div className="flex mt-[41px] z-20 fixed inset-x-0 items-center justify-between px-4 md:px-12 xl:px-20 h-12">
			<button
				onClick={() => {
					router.push('/application')
				}}
				className="flex items-center gap-x-[2px] px-[10px]"
			>
				<Image
					src="/assets/images/grantpicks-logo-new.png"
					alt="grantpicks-logo"
					width={46}
					height={26}
				/>
				<p className="text-[#020909] font-black text-xl">GrantPicks</p>
			</button>
			<div className="text-[#202237] font-medium text-sm gap-x-[6px] flex border border-grantpicks-purple-500/20 h-full rounded-full px-7 bg-[#EEF2FE]">
				<button className="px-3" onClick={() => scrollToSection('home')}>Home</button>
				<button className="px-3" onClick={() => scrollToSection('how-it-works')}>How it Works</button>
				<button className="px-3" onClick={() => scrollToSection('features')}>Features</button>
				<button className="px-3" onClick={() => scrollToSection('faqs')}>FAQs</button>
			</div>
			<Button
				color="purple"
				icon={<IconRocket size={18} className="fill-white" />}
				iconPosition="right"
				className="h-full px-7"
				onClick={() => {
					router.push('/application')
				}}
			>
				Launch App
			</Button>
		</div>
	)
}

export default Navbar
