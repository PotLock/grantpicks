import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const LandingHeader = () => {
	const router = useRouter()
	return (
		<div className="w-[100%] md:w-[90%] xl:w-[80%] mx-auto pt-20 md:pt-24 xl:pt-32">
			<div className="flex flex-col items-center text-grantpicks-black-950">
				<div className="flex items-center space-x-4 border border-grantpicks-purple-950 rounded-full px-5 py-2 mb-6">
					<Image
						src="/assets/images/cup.png"
						alt=""
						width={24}
						height={24}
						className="object-contain"
					/>
					<p className="text-base font-bold text-grantpicks-purple-950 uppercase">{`INTRODUCING GRANTSPICK`}</p>
				</div>
				<p className="text-[62px] font-black text-center uppercase leading-[1.00] whitespace-pre mb-6">
					{`Quickly pick your favorite\nprojects get them funded\nand win points.`}
				</p>
				<button
					onClick={() => router.push(`/application`)}
					className="z-10 bg-gradient-to-b from-[#7B3AED] to-[#5A21B6] text-white border boder-[#DDD6FE] rounded-full px-8 py-3 text-base font-semibold shadow-xl transition-all hover:scale-105 duration-500"
				>
					Launch App
				</button>
			</div>
		</div>
	)
}

export default LandingHeader
