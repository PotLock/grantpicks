import MyProjectHeader from '@/app/components/pages/application/my-project/MyProjectHeader'
import MyProjectLayout from '@/app/components/pages/application/my-project/MyProjectLayout'
import MyProjectSection from '@/app/components/pages/application/my-project/MyProjectSection'
import { IMyProjectContext } from '@/types/context'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { getProjectApplicant } from '@/services/on-chain/project-registry'
import { Network } from '@/types/on-chain'
import Button from '@/app/components/commons/Button'
import { useRouter } from 'next/navigation'
import { useModalContext } from '@/app/providers/ModalProvider'
import { Project } from 'project-registry-client'
import IconClose from '@/app/components/svgs/IconClose'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'

const MyProjectContext = createContext<IMyProjectContext>({
	projectData: undefined,
	projectDataModel: undefined,
	fetchProjectApplicant: () => Promise.resolve(),
})

const MyProjectProvider = () => {
	const { stellarPubKey } = useWallet()
	const router = useRouter()
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const [projectDataModel, setProjectDataModel] = useState<Project | undefined>(
		undefined,
	)
	const [noProject, setNoProject] = useState<boolean>(false)
	const { setCreateProjectFormMainProps } = useModalContext()
	const { setShowMenu } = useGlobalContext()
	const storage = useAppStorage()

	const fetchProjectApplicant = async () => {
		try {
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const res = await getProjectApplicant(stellarPubKey, contracts)
			//@ts-ignore
			if (!res?.error) {
				setProjectData(res)
				setProjectDataModel(res)
			} else {
				setNoProject(true)
			}
			//@ts-ignore
		} catch (error: any) {
			console.log('error fetch project applicant', error)
		}
	}

	useEffect(() => {
		if (!projectData && stellarPubKey) {
			fetchProjectApplicant()
		}
	}, [stellarPubKey])

	return (
		<MyProjectContext.Provider
			value={{
				projectData,
				projectDataModel,
				fetchProjectApplicant,
			}}
		>
			<MyProjectLayout>
				{noProject ? (
					<div className="fixed z-20 inset-0 backdrop-blur flex items-center justify-center">
						<div className="relative rounded-2xl bg-white p-3 md:p-6 flex flex-col items-center">
							<IconClose
								size={24}
								className="fill-grantpicks-black-400 absolute right-1 top-1 cursor-pointer transition hover:opacity-80"
								onClick={() => {
									router.push(`/application`)
									setShowMenu(null)
								}}
							/>
							<p className="text-base font-semibold text-grantpicks-black-950 mb-4">
								You don&apos;t have any project now
							</p>
							<Button
								color="black-950"
								onClick={() => {
									router.push(`/application`)
									setCreateProjectFormMainProps((prev) => ({
										...prev,
										isOpen: true,
									}))
								}}
							>
								Create New Project
							</Button>
						</div>
					</div>
				) : (
					<>
						<MyProjectHeader />
						<MyProjectSection />
					</>
				)}
			</MyProjectLayout>
		</MyProjectContext.Provider>
	)
}

export const useMyProject = () => useContext(MyProjectContext)

export default MyProjectProvider
