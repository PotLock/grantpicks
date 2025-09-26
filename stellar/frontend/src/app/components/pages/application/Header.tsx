import React from 'react'

const ApplicationHeader = () => {
	return (
		<div className="flex flex-col items-center mb-8 justify-center px-4">
			<div className="flex flex-col w-full md:w-10/12 items-center justify-center">
				<div className="flex flex-col items-center justify-center mb-10 md:mb-14 lg:mb-16">
					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[65px] xl:text-[76px] font-black uppercase text-center leading-tight sm:leading-tight md:leading-[1.1] bg-gradient-to-r from-[#7B3AED] to-[#5A21B6] bg-clip-text text-transparent">
						Easily decide how funding is allocated
					</h1>
					<p className="text-base sm:text-lg text-grantpicks-black-600 w-full md:w-9/12 text-center mt-4">
						Discover funding opportunities, apply to rounds, participate in
						voting, and support innovative projects in the blockchain ecosystem.
					</p>
				</div>

				{/* Steps */}
				<div className="w-full max-w-6xl mx-auto mb-12 md:mb-14 lg:mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 xl:gap-14 md:justify-items-center justify-items-start">
					{/* Step 1 */}
					<div className="grid grid-cols-[3.5rem_1fr] items-center gap-3 sm:gap-4 md:gap-6 w-max">
						<div className="w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-orange-500 text-white font-bold text-xl sm:text-2xl md:text-3xl flex items-center justify-center shadow-md">
							1
						</div>
						<div className="min-w-0">
							<h3 className="text-xl sm:text-2xl font-bold text-grantpicks-black-950 mb-1">
								Apply
							</h3>
							<p className="text-sm sm:text-base text-grantpicks-black-600">
								Submit your project
							</p>
						</div>
					</div>

					{/* Step 2 */}
					<div className="grid grid-cols-[3.5rem_1fr] items-center gap-3 sm:gap-4 md:gap-6 w-max">
						<div className="w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-green-600 text-white font-bold text-xl sm:text-2xl md:text-3xl flex items-center justify-center shadow-md">
							2
						</div>
						<div className="min-w-0">
							<h3 className="text-xl sm:text-2xl font-bold text-grantpicks-black-950 mb-1">
								Vote
							</h3>
							<p className="text-sm sm:text-base text-grantpicks-black-600">
								Support projects you like
							</p>
						</div>
					</div>

					{/* Step 3 */}
					<div className="grid grid-cols-[3.5rem_1fr] items-center gap-3 sm:gap-4 md:gap-6 w-max">
						<div className="w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-purple-700 text-white font-bold text-xl sm:text-2xl md:text-3xl flex items-center justify-center shadow-md">
							3
						</div>
						<div className="min-w-0">
							<h3 className="text-xl sm:text-2xl font-bold text-grantpicks-black-950 mb-1">
								Win
							</h3>
							<p className="text-sm sm:text-base text-grantpicks-black-600">
								Get funded
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ApplicationHeader
