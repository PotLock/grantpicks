import React from 'react'

const ApplicationHeader = () => {
	return (
		<div className="flex flex-col items-center mb-10 justify-center px-4">
			<div className="flex flex-col w-full md:w-11/12 items-center justify-center">
				<div className="flex flex-col items-center justify-center mb-8 md:mb-12">

					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center leading-tight text-grantpicks-black-950">
						Discover and support high-impact funding rounds
					</h1>
					<p className="text-sm sm:text-base text-grantpicks-black-600 w-full md:w-8/12 text-center mt-4">
						Apply, vote, and fund projects with transparent allocations and
						on-chain results.
					</p>
				</div>

				{/* Steps */}
				<div className="w-full max-w-5xl mx-auto mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 md:justify-items-center justify-items-start">
					{/* Step 1 */}
					<div className="grid grid-cols-[3rem_1fr] items-center gap-3 sm:gap-4 w-max">
						<div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-md">
							1
						</div>
						<div className="min-w-0">
							<h3 className="text-lg sm:text-xl font-bold text-grantpicks-black-950 mb-1">
								Apply
							</h3>
							<p className="text-sm text-grantpicks-black-600">
								Submit your project
							</p>
						</div>
					</div>

					{/* Step 2 */}
					<div className="grid grid-cols-[3rem_1fr] items-center gap-3 sm:gap-4 w-max">
						<div className="w-12 h-12 rounded-full bg-green-600 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-md">
							2
						</div>
						<div className="min-w-0">
							<h3 className="text-lg sm:text-xl font-bold text-grantpicks-black-950 mb-1">
								Vote
							</h3>
							<p className="text-sm text-grantpicks-black-600">
								Support projects you like
							</p>
						</div>
					</div>

					{/* Step 3 */}
					<div className="grid grid-cols-[3rem_1fr] items-center gap-3 sm:gap-4 w-max">
						<div className="w-12 h-12 rounded-full bg-purple-700 text-white font-bold text-lg sm:text-xl flex items-center justify-center shadow-md">
							3
						</div>
						<div className="min-w-0">
							<h3 className="text-lg sm:text-xl font-bold text-grantpicks-black-950 mb-1">
								Funding
							</h3>
							<p className="text-sm text-grantpicks-black-600">
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
