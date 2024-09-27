import Image from 'next/image'
import React, { useState } from 'react'
import IconRocket from '../../svgs/IconRocket'
import { useRouter } from 'next/navigation'
import Button from '../../commons/Button'
import IconBurger from '../../svgs/IconBurger'
import Menu from '../../commons/Menu'
import IconClose from '../../svgs/IconClose'

const Navbar = () => {
	const router = useRouter()
	const [showMenu, setShowMenu] = useState<boolean>(false)

	const scrollToSection = (sectionId: string) => {
		const section = document.getElementById(sectionId)
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<div className="flex mt-[41px] z-20 fixed inset-x-0 items-center justify-between px-4 md:px-12 xl:px-20 h-12">
			<div className="flex items-center relative">
				<button
					onClick={() => setShowMenu(!showMenu)}
					className="flex lg:hidden"
				>
					{showMenu ? (
						<IconClose size={28} className="fill-black" />
					) : (
						<IconBurger size={28} className="stroke-black" />
					)}
				</button>
				{showMenu && (
					<Menu
						isOpen={showMenu}
						onClose={() => setShowMenu(false)}
						position="top-7 left-0"
					>
						<div className="grid gap-y-3 text-[#202237] font-medium text-sm gap-x-[6px] border border-grantpicks-purple-500/20 h-full rounded-xl p-4 bg-[#EEF2FE]">
							<button className="px-3" onClick={() => scrollToSection('home')}>
								Home
							</button>
							<button
								className="px-3"
								onClick={() => scrollToSection('how-it-works')}
							>
								How it Works
							</button>
							<button
								className="px-3"
								onClick={() => scrollToSection('features')}
							>
								Features
							</button>
							<button className="px-3" onClick={() => scrollToSection('faqs')}>
								FAQs
							</button>
						</div>
					</Menu>
				)}
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
			</div>
			<div className="hidden lg:flex text-[#202237] font-medium text-sm gap-x-[6px] border border-grantpicks-purple-500/20 h-full rounded-full px-7 bg-[#EEF2FE]">
				<button className="px-3" onClick={() => scrollToSection('home')}>
					Home
				</button>
				<button
					className="px-3"
					onClick={() => scrollToSection('how-it-works')}
				>
					How it Works
				</button>
				<button className="px-3" onClick={() => scrollToSection('features')}>
					Features
				</button>
				<button className="px-3" onClick={() => scrollToSection('faqs')}>
					FAQs
				</button>
			</div>
			<Button
				color="purple"
				icon={<IconRocket size={18} className="fill-white hidden sm:block" />}
				iconPosition="right"
				className="h-full sm:px-7"
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
