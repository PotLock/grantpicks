'use client'
import React, { useState } from 'react'
import AdminCard from '@/app/components/pages/round-view/AdminCard'
import useSWR from 'swr'
import { usePotlockService } from '@/services/potlock'
import { useParams } from 'next/navigation'
import IconAdd from '@/app/components/svgs/IconAdd'
import { UpdateRoundAdmins } from '@/app/components/pages/application/UpdateRoundAdmins'
import { GPRound } from '@/models/round'
import { useWallet } from '@/app/providers/WalletProvider'

const RoundAdminsPage = () => {
	const [showAddAdminsModal, setShowAddAdminsModal] = useState(false)
	const { stellarPubKey } = useWallet()

	const { roundId } = useParams()
	const potlockService = usePotlockService()
	const { data, isLoading, error, mutate } = useSWR(
		`/rounds/${roundId}/admins`,
		() => potlockService.getRound(Number(roundId)),
	)

	if (error) {
		return (
			<div className="text-center text-grantpicks-black-950">
				Error Loading Round Admins
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="text-center text-grantpicks-black-950">
				Loading Round Admins
			</div>
		)
	}

	return (
		<div>
			<div className="flex mb-2 items-center justify-between w-full">
				<div className="flex items-center w-full justify-between mb-4 gap-2">
					<h2 className="text-xl font-bold text-grantpicks-black-950 uppercase">
						Round Admins
					</h2>
					{stellarPubKey === data?.owner?.id && (
						<div
							onClick={() => setShowAddAdminsModal(true)}
							className="flex hover:opacity-70 cursor-pointer transition items-center gap-2 flex-shrink-0"
						>
							<p className="text-base font-semibold text-grantpicks-black-950">
								Add Admins
							</p>
							<button className="rounded-full w-8 h-8 flex items-center justify-center bg-grantpicks-alpha-50/5 cursor-pointer hover:opacity-70 transition">
								<IconAdd size={15} className="fill-grantpicks-black-400" />
							</button>
						</div>
					)}
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{data?.admins?.length && data?.admins?.length > 0 ? (
					data?.admins.map((admin, idx) => (
						<AdminCard key={idx} address={admin?.id} />
					))
				) : (
					<div className="col-span-full">
						<div className="text-center border border-black/10 rounded-xl p-8 bg-white">
							<p className="text-base font-semibold text-grantpicks-black-950 mb-1">
								No admins found
							</p>
							<p className="text-sm text-grantpicks-black-600">
								This round has no admins.
							</p>
						</div>
					</div>
				)}
			</div>
			<UpdateRoundAdmins
				isOpen={showAddAdminsModal}
				onClose={() => setShowAddAdminsModal(false)}
				doc={
					data as unknown as Omit<GPRound, 'admins'> & {
						admins: { id: string }[]
					}
				}
				mutateRounds={mutate}
			/>
		</div>
	)
}

export default RoundAdminsPage
