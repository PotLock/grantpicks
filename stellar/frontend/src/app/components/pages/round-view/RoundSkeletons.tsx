import React from 'react'

export const ApplicationCardSkeleton = () => (
	<div className="max-w-7xl mx-auto px-4 md:px-6">
		<div className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-3 bg-white border-b border-black/10">
			<div
				className="flex items-center overflow-x-auto space-x-2 md:space-x-3"
				role="tablist"
				aria-label="Application filters"
			>
				<div className="rounded-full px-4 py-2 flex-shrink-0 text-sm font-semibold bg-grantpicks-black-50 text-transparent">
					All
				</div>
				<div className="rounded-full px-4 py-2 flex-shrink-0 text-sm font-semibold bg-grantpicks-black-50 text-transparent">
					Pending
				</div>
				<div className="rounded-full px-4 py-2 flex-shrink-0 text-sm font-semibold bg-grantpicks-black-50 text-transparent">
					Accepted
				</div>
				<div className="rounded-full px-4 py-2 flex-shrink-0 text-sm font-semibold bg-grantpicks-black-50 text-transparent">
					Rejected
				</div>
			</div>
		</div>
		<div className="py-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="border border-black/10 rounded-xl p-4 bg-white animate-pulse"
				>
					<div className="flex items-center justify-between text-xs text-grantpicks-black-500 mb-3">
						<div className="h-3 w-24 bg-gray-200 rounded" />
						<div className="flex items-center gap-2">
							<div className="h-3 w-14 bg-gray-200 rounded" />
							<div className="h-3 w-12 bg-gray-200 rounded" />
						</div>
					</div>
					<div className="flex items-center gap-2 mb-2">
						<div className="w-6 h-6 rounded-full bg-gray-200" />
						<div className="h-4 w-24 bg-gray-200 rounded" />
						<div className="h-3 w-20 bg-gray-200 rounded" />
					</div>
					<div className="space-y-2">
						<div className="h-3 w-full bg-gray-200 rounded" />
						<div className="h-3 w-11/12 bg-gray-200 rounded" />
						<div className="h-3 w-10/12 bg-gray-200 rounded" />
					</div>
				</div>
			))}
		</div>
	</div>
)

export const RoundAboutSkeleton = () => (
	<div className="grid gap-8 md:gap-10 animate-pulse">
		{/* About skeleton */}
		<div>
			<div className="h-6 md:h-7 w-28 md:w-36 bg-gray-200 rounded mb-3 md:mb-4"></div>
			<div className="space-y-2">
				<div className="h-4 md:h-5 bg-gray-200 rounded w-full"></div>
				<div className="h-4 md:h-5 bg-gray-200 rounded w-11/12"></div>
				<div className="h-4 md:h-5 bg-gray-200 rounded w-10/12"></div>
			</div>
		</div>

		{/* Duration skeleton */}
		<div>
			<div className="flex items-center justify-between flex-wrap gap-3 mb-3 md:mb-4">
				<div className="h-6 md:h-7 w-28 md:w-36 bg-gray-200 rounded"></div>
				<div className="h-6 md:h-7 w-24 md:w-28 bg-gray-200 rounded"></div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
					<div className="h-5 bg-gray-200 rounded w-3/4"></div>
				</div>
				<div>
					<div className="h-4 w-36 bg-gray-200 rounded mb-2"></div>
					<div className="h-5 bg-gray-200 rounded w-2/3"></div>
				</div>
			</div>
		</div>

		{/* Requirements skeleton */}
		<div>
			<div className="h-6 md:h-7 w-32 md:w-40 bg-gray-200 rounded mb-3 md:mb-4"></div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="rounded-xl border border-black/10 p-4 md:p-5 bg-white">
					<div className="h-5 w-56 bg-gray-200 rounded mb-3"></div>
					<div className="space-y-2">
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-5/6"></div>
					</div>
				</div>
				<div className="rounded-xl border border-black/10 p-4 md:p-5 bg-white">
					<div className="h-5 w-48 bg-gray-200 rounded mb-3"></div>
					<div className="space-y-2">
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-4/6"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
)
