import IconCube from '@/app/components/svgs/IconCube'
import IconNear from '@/app/components/svgs/IconNear'
import React from 'react'

const MyProjectHeader = () => {
	return (
		<>
			<p className="text-[62px] font-black text-grantpicks-black-950 mb-8 md:mb-10 lg:mb-14">
				MY PROJECT
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-8">
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						<IconCube size={24} className="fill-grantpicks-black-400" />
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							2
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							ROUNDS PARTICIPATED
						</p>
					</div>
				</div>
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						<IconNear size={24} className="fill-grantpicks-black-400" />
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							300 NEAR
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							FUNDING RECEIVED{' '}
						</p>
					</div>
				</div>
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						<IconCube size={24} className="fill-grantpicks-black-400" />
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							300
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							TOTAL VOTES{' '}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}

export default MyProjectHeader
