import Modal from '@/app/components/commons/Modal'
import IconProject from '@/app/components/svgs/IconProject'
import { ICreateProjectForm, ICreateProjectFormContext } from '@/types/context'
import { BaseModalProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { createContext, useContext, useState } from 'react'
import CreateProjectStep1 from './CreateProjectStep1'
import CreateProjectStep2 from './CreateProjectStep2'
import CreateProjectStep3 from './CreateProjectStep3'
import CreateProjectStep4 from './CreateProjectStep4'
import CreateProjectStep5 from './CreateProjectStep5'
import {
	DEFAULT_CREATE_PROJECT_DATA,
	DEFAULT_IMAGE_URL,
} from '@/constants/project'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import {
	ICreateProjectParams,
	IGetProjectsResponse,
} from '@/services/stellar/project-registry'
import { useWallet } from '@/app/providers/WalletProvider'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { useModalContext } from '@/app/providers/ModalProvider'
import IconClose from '@/app/components/svgs/IconClose'
import { localStorageConfigs } from '@/configs/local-storage'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { RegistrationStatus } from 'lists-client'
import { NearSocialGPProject } from '@/services/near/type'
import { useSearchParams } from 'next/navigation'
import { usePotlockService } from '@/services/potlock'

const CreateProjectFormContext = createContext<ICreateProjectFormContext>({
	data: DEFAULT_CREATE_PROJECT_DATA,
	setData: () => { },
	step: 1,
	setStep: () => { },
	onClose: () => { },
	onProceedApply: () => Promise.resolve(),
})

const CreateProjectFormMainModal = ({ isOpen, onClose }: BaseModalProps) => {
	const searchParams = useSearchParams()
	const potlockApi = usePotlockService()
	const [dataForm, setDataForm] = useState<ICreateProjectForm>(
		DEFAULT_CREATE_PROJECT_DATA,
	)
	const { dismissPageLoading, openPageLoading } = useGlobalContext()
	const [step, setStep] = useState<number>(1)
	const { stellarKit, nearWallet } = useWallet()
	const { setSuccessCreateProjectModalProps, setApplyProjectInitProps } =
		useModalContext()
	const storage = useAppStorage()

	const onProceedApply = async () => {
		let roundData: any
		try {
			openPageLoading()

			if (searchParams.get('apply_round')) {
				roundData = await potlockApi.getRound(
					Number(searchParams.get('apply_round')),
				)
			}

			if (storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}


				const params: ICreateProjectParams = {
					name: dataForm.title,
					overview: dataForm.description,
					admins: dataForm.team_member.map((mem) => mem),
					contacts: dataForm.contacts.map((c) => ({
						name: c.platform,
						value: c.link_url,
					})),
					contracts: dataForm.smart_contracts.map((sm) => ({
						name: sm.chain,
						contract_address: sm.address,
					})),
					fundings: dataForm.funding_histories.map((f) => ({
						source: f.source,
						denomination: f.denomination,
						description: f.description,
						amount: BigInt(f.amount),
						funded_ms: BigInt(f.date.getTime() as number),
					})),
					image_url: DEFAULT_IMAGE_URL,
					// payout_address: storage.my_address || '',
					repositories: dataForm.github_urls.map((g) => ({
						label: 'github',
						url: g,
					})),
					video_url: dataForm.video.url,
					team_members: dataForm.team_member.map((mem) => ({
						name: mem,
						value: mem,
					})),
				}

				const isRegistered = await contracts.lists_contract.is_registered({
					registrant_id: storage.my_address || '',
					list_id: BigInt(process.env.PROJECTS_LIST_ID || '1'),
					required_status: undefined,
				})

				if (!isRegistered) {
					const txRegisterList = await contracts.lists_contract.register_batch({
						submitter: storage.my_address || '',
						list_id: BigInt(process.env.PROJECTS_LIST_ID || '1'),
						notes: 'Register new project',
						registrations: undefined,
					})

					await contracts.signAndSendTx(
						stellarKit as StellarWalletsKit,
						txRegisterList.toXDR(),
						storage.my_address || '',
					)
				}


				const txCreateProject = await contracts.project_contract.apply({
					applicant: storage.my_address || '',
					project_params: params,
				})


				const txHashCreateProject = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txCreateProject.toXDR(),
					storage.my_address || '',
				)

				if (txHashCreateProject) {
					setSuccessCreateProjectModalProps((prev) => ({
						...prev,
						isOpen: true,
						createProjectRes: txCreateProject.result,
						txHash: txHashCreateProject,
					}))
					setDataForm(DEFAULT_CREATE_PROJECT_DATA)
					localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_1)
					localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_2)
					localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_3)
					localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_4)
					localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_5)
					dismissPageLoading()
					onClose()
				}
			} else {
				const contracts = storage.getNearContracts(nearWallet)

				if (!contracts) {
					return
				}

				const params: NearSocialGPProject = {
					name: dataForm.title,
					overview: dataForm.description,
					contacts: dataForm.contacts.map((c) => ({
						name: c.platform,
						value: c.link_url,
					})),
					owner: storage.my_address || '',
					contracts: dataForm.smart_contracts.map((sm) => ({
						name: sm.chain,
						contract_address: sm.address,
					})),
					fundings: dataForm.funding_histories.map((f) => ({
						source: f.source,
						denomination: f.denomination,
						description: f.description,
						amount: f.amount.toString(),
						funded_ms: parseInt(f.date.getTime().toString()),
					})),
					image_url: DEFAULT_IMAGE_URL,
					payout_address: storage.my_address || '',
					repositories: dataForm.github_urls.map((g) => ({
						label: 'github',
						url: g,
					})),
					video_url: dataForm.video.url,
					team_members: dataForm.team_member,
				}

				const txCreateProject = await contracts.near_social.setProjectData(
					storage.my_address || '',
					params,
					true,
				)

				const listId = process.env.NEAR_PROJECTS_LIST_ID || '1'

				const txRegisterList = await contracts.lists.registerList(listId, true)

				await contracts.near_social.sendTransactions([
					txRegisterList,
					txCreateProject,
				])

				if (searchParams.has('apply_round')) {
					setApplyProjectInitProps((prev) => ({
						...prev,
						isOpen: true,
						round_id: BigInt(searchParams.get('apply_round') as string),
						roundData: roundData,
					}))
				} else {
					setSuccessCreateProjectModalProps((prev) => ({
						...prev,
						isOpen: true,
						createProjectRes: params as unknown as IGetProjectsResponse,
						txHash: undefined,
					}))
				}
				setDataForm(DEFAULT_CREATE_PROJECT_DATA)
				localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_1)
				localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_2)
				localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_3)
				localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_4)
				localStorage.removeItem(localStorageConfigs.CREATE_PROJECT_STEP_5)
				dismissPageLoading()
				onClose()
			}
		} catch (error: any) {
			console.error(error)
			console.log('error', error?.message)
			toast.error(error?.message || 'Something went wrong', {
				style: toastOptions.error.style,
			})
			dismissPageLoading()
		}
	}

	return (
		<CreateProjectFormContext.Provider
			value={{
				data: dataForm,
				step,
				setStep,
				setData: setDataForm,
				onClose,
				onProceedApply,
			}}
		>
			<Modal isOpen={isOpen} onClose={onClose} closeOnBgClick>
				<div className="w-11/12 md:w-[560px] mx-auto bg-white rounded-xl border border-black/10 shadow p-2">
					<div className="relative py-4 px-4 md:px-6 flex items-center justify-center">
						<IconClose
							size={24}
							className="fill-grantpicks-black-400 absolute right-0 top-0 cursor-pointer transition hover:opacity-80"
							onClick={() => {
								onClose()
							}}
						/>
						<p className="text-3xl md:text-4xl lg:text-[40px] font-black text-grantpicks-black-950 uppercase text-center">
							Create New Project
						</p>
					</div>
					<div
						className={clsx(`border-2 border-black`)}
						style={{
							width: `${(step / 5) * 100}%`,
						}}
					/>
					{step === 1 && <CreateProjectStep1 />}
					{step === 2 && <CreateProjectStep2 />}
					{step === 3 && <CreateProjectStep3 />}
					{step === 4 && <CreateProjectStep4 />}
					{step === 5 && <CreateProjectStep5 />}
				</div>
			</Modal>
		</CreateProjectFormContext.Provider>
	)
}

export const useCreateProject = () => useContext(CreateProjectFormContext)

export default CreateProjectFormMainModal
