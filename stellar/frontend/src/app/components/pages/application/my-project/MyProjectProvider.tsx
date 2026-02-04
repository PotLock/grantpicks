'use client'

import MyProjectHeader from '@/app/components/pages/application/my-project/MyProjectHeader'
import MyProjectLayout from '@/app/components/pages/application/my-project/MyProjectLayout'
import MyProjectSection from '@/app/components/pages/application/my-project/MyProjectSection'
import { IMyProjectContext } from '@/types/context'
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useWallet } from '@/app/providers/WalletProvider'
import { getProjectApplicant } from '@/services/stellar/project-registry'
import Button from '@/app/components/commons/Button'
import { usePathname, useRouter } from 'next/navigation'
import { useModalContext } from '@/app/providers/ModalProvider'
import { Project } from 'project-registry-client'
import IconProject from '@/app/components/svgs/IconProject'
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
	const pathname = usePathname()
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const [projectDataModel, setProjectDataModel] = useState<Project | undefined>(
		undefined,
	)
	const [noProject, setNoProject] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const { setCreateProjectFormMainProps } = useModalContext()
	const hasAutoOpenedCreateProjectRef = useRef(false)
	const [stats, setStats] = useState<GPProjectStats>({
		total_funds_received: 0,
		rounds_participated: 0,
		total_votes: 0,
	})
	const { setShowMenu } = useGlobalContext()
	const storage = useAppStorage()
	const potlockService = usePotlockService()

	const fetchProjectApplicant = useCallback(async () => {
		const startedAt = Date.now()

		setIsLoading(true)
		setNoProject(false)
		try {
			if (!stellarPubKey) {
				setIsLoading(false)
				return
			}
			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					setIsLoading(false)
					return
				}

				const res = await getProjectApplicant(stellarPubKey, contracts)
				const candidate = (res as any)?.ok ?? (res as any)?.result ?? (res as any)?.value ?? res
				const looksLikeProject =
					!!candidate &&
					typeof candidate === 'object' &&
					!('error' in (candidate as any)) &&
					!('err' in (candidate as any)) &&
					typeof (candidate as any).owner === 'string' &&
					typeof (candidate as any).name === 'string'

				if (looksLikeProject) {
					setProjectData(candidate as Project)
					setProjectDataModel(candidate as Project)
					setNoProject(false)
				} else {
					setProjectData(undefined)
					setProjectDataModel(undefined)
					setNoProject(true)
				}
			}
		} catch (error: any) {
			setProjectData(undefined)
			setProjectDataModel(undefined)
			storage.chainId === 'stellar' && setNoProject(true)
			storage.chainId === 'near' && setNoProject(true)
			console.log('error fetch project applicant', error)
		} finally {
			// Ensure the loading UI is visible (avoids "blink" into empty state)
			const minLoadingMs = 250
			const elapsed = Date.now() - startedAt
			if (elapsed < minLoadingMs) {
				await new Promise((r) => setTimeout(r, minLoadingMs - elapsed))
			}
			setIsLoading(false)
		}
	}, [
		stellarPubKey,
		storage,
		setProjectData,
		setProjectDataModel,
	])

	const fetchProjectStats = useCallback(async () => {
		if (!projectData?.id || !stellarPubKey) return
		const projectStats = await potlockService.getProjectStats(stellarPubKey)
		setStats(projectStats)
	}, [projectData?.id, potlockService, stellarPubKey])

	useEffect(() => {
		// Re-fetch any time user visits this route again
		if (storage.my_address && stellarPubKey) {
			fetchProjectApplicant()
		}
	}, [storage.my_address, stellarPubKey, pathname, fetchProjectApplicant])

	useEffect(() => {
		fetchProjectStats()
	}, [fetchProjectStats])

	useEffect(() => {
		// Auto-open create modal once when we confirm no project exists
		if (isLoading) return
		if (!noProject) return
		if (hasAutoOpenedCreateProjectRef.current) return

		hasAutoOpenedCreateProjectRef.current = true
		setCreateProjectFormMainProps((prev) => ({
			...prev,
			isOpen: true,
		}))
	}, [isLoading, noProject, setCreateProjectFormMainProps])

	useEffect(() => {
		// Re-fetch when the user tabs back / refocuses the window
		if (typeof window === 'undefined') return

		const refreshIfReady = () => {
			if (storage.my_address && stellarPubKey) {
				fetchProjectApplicant()
			}
		}

		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') refreshIfReady()
		}

		window.addEventListener('focus', refreshIfReady)
		document.addEventListener('visibilitychange', onVisibilityChange)
		return () => {
			window.removeEventListener('focus', refreshIfReady)
			document.removeEventListener('visibilitychange', onVisibilityChange)
		}
	}, [storage.my_address, stellarPubKey, fetchProjectApplicant])

	return (
		<MyProjectContext.Provider
			value={{
				projectData,
				projectDataModel,
				fetchProjectApplicant,
			}}
		>
			<MyProjectLayout>
				{isLoading ? (
					<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grantpicks-purple-500 mb-4" />
						<p className="text-grantpicks-black-700 font-semibold">Loading your project…</p>
					</div>
				) : noProject ? (
					<div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
						<div className="bg-grantpicks-purple-100 p-6 rounded-full mb-6">
							<IconProject size={48} className="fill-grantpicks-purple-600" />
						</div>
						<h2 className="text-3xl font-black text-grantpicks-black-950 mb-3">No project yet</h2>
						<p className="text-grantpicks-black-600 max-w-md mb-8">
							Create a project to start applying to rounds, adding media, and tracking your funding.
						</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Button
								color="black-950"
								className="!px-8 !py-3 !rounded-full"
								onClick={() => {
									setCreateProjectFormMainProps((prev) => ({
										...prev,
										isOpen: true,
									}))
								}}
							>
								Create Project
							</Button>
							<Button
								color="white"
								className="!px-8 !py-3 !rounded-full"
								onClick={() => {
									router.push(`/rounds`)
									setShowMenu(null)
								}}
							>
								Back to Rounds
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
