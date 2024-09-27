import Image from 'next/image'
import React from 'react'
import IconRocket from '../../svgs/IconRocket'
import { useRouter } from 'next/navigation'

const Navbar = () => {
	const router = useRouter()

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
				<button className="px-3">Home</button>
				<button className="px-3">How it Works</button>
				<button className="px-3">Features</button>
				<button className="px-3">FAQs</button>
			</div>
			<button
				onClick={() => {
					router.push('/application')
				}}
				className="flex items-center text-white h-full gap-x-[10px] px-7 purple-button transition-all hover:scale-105 duration-500"
			>
				<p className="text-sm font-semibold">Launch App</p>
				<IconRocket size={18} className="fill-white" />
			</button>
		</div>
	)
}

export default Navbar
