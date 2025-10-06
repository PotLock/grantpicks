import MyProjectHeader from '@/app/components/pages/application/my-project/MyProjectHeader'
import MyProjectLayout from '@/app/components/pages/application/my-project/MyProjectLayout'
import MyProjectSection from '@/app/components/pages/application/my-project/MyProjectSection'
import { IMyProjectContext } from '@/types/context'
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { useWallet } from '@/app/providers/WalletProvider'
import { getProjectApplicant } from '@/services/stellar/project-registry'
import Button from '@/app/components/commons/Button'
import { useRouter } from 'next/navigation'
import { useModalContext } from '@/app/providers/ModalProvider'
import { Project } from 'project-registry-client'
import IconClose from '@/app/components/svgs/IconClose'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPProjectStats } from '@/models/stats'
import { usePotlockService } from '@/services/potlock'

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
	const [stats, setStats] = useState<GPProjectStats>({
		total_funds_received: 0,
		rounds_participated: 0,
		total_votes: 0,
	})
	const { setShowMenu } = useGlobalContext()
	const storage = useAppStorage()
	const potlockService = usePotlockService()

	const fetchProjectApplicant = useCallback(async () => {
		try {
			if (storage.chainId === 'stellar') {
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
			}
		} catch (error: any) {
			storage.chainId === 'stellar' && setNoProject(true)
			storage.chainId === 'near' && setNoProject(true)
			console.log('error fetch project applicant', error)
		}
	}, [
		stellarPubKey,
		storage,
		setProjectData,
		setProjectDataModel,
	])

	const fetchProjectStats = useCallback(async () => {
		if (projectData) {
			const projectStats = await potlockService.getProjectStats(stellarPubKey)
			setStats(projectStats)
		}
	}, [projectData, potlockService, stellarPubKey])



	useEffect(() => {
		if (storage.my_address) {
			fetchProjectApplicant()
			fetchProjectStats()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage.my_address, fetchProjectApplicant, fetchProjectStats])

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
									router.push(`/rounds`)
									setShowMenu(null)
								}}
							/>
							<p className="text-base font-semibold text-grantpicks-black-950 mb-4">
								You don&apos;t have any project now
							</p>
							<Button
								color="black-950"
								onClick={() => {
									router.push(`/rounds`)
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
						<MyProjectHeader stats={stats} />
						<MyProjectSection />
					</>
				)}
			</MyProjectLayout>
		</MyProjectContext.Provider>
	)
}

export const useMyProject = () => useContext(MyProjectContext)

export default MyProjectProvider
