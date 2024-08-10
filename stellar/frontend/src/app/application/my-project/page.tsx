'use client'

import MyProjectHeader from '@/app/components/pages/application/my-project/MyProjectHeader'
import MyProjectLayout from '@/app/components/pages/application/my-project/MyProjectLayout'
import MyProjectSection from '@/app/components/pages/application/my-project/MyProjectSection'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { getProjectApplicant } from '@/services/on-chain/project-registry'
import { IMyProjectContext } from '@/types/context'
import { Network } from '@/types/on-chain'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Project } from 'round-client'

const MyProjectContext = createContext<IMyProjectContext>({
	projectData: undefined,
	projectDataModel: undefined,
	fetchProjectApplicant: () => Promise.resolve(),
})

const MyProjectPage = () => {
	const { stellarPubKey } = useWallet()
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const [projectDataModel, setProjectDataModel] = useState<Project | undefined>(
		undefined,
	)

	const fetchProjectApplicant = async () => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const res = await getProjectApplicant(stellarPubKey, contracts)
			console.log('res my prject', res)
			//@ts-ignore
			if (!res?.error) {
				setProjectData(res)
				setProjectDataModel(res)
			}
			//@ts-ignore
			console.log('res my project', res, res?.error)
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
				<MyProjectHeader />
				<MyProjectSection />
			</MyProjectLayout>
		</MyProjectContext.Provider>
	)
}

export const useMyProject = () => useContext(MyProjectContext)

export default MyProjectPage
