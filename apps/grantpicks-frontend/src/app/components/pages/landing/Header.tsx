import React from 'react'

const LandingHeader = () => {
	return (
		<div className="w-[100%] md:w-[90%] xl:w-[80%] mx-auto pt-20 md:pt-24 xl:pt-32">
			<div className="flex flex-col items-center text-grantpicks-black-950">
				<p className="text-[62px] font-black text-center uppercase leading-[1.00] whitespace-pre">
					{`Quickly pick your favorite\nprojects get them funded\nand win points.`}
				</p>
			</div>
		</div>
	)
}

export default LandingHeader
