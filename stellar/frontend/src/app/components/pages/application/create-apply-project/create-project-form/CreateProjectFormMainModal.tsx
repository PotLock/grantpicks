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
	createProject,
	ICreateProjectParams,
	IGetProjectsResponse,
} from '@/services/on-chain/project-registry'
import { useWallet } from '@/app/providers/WalletProvider'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { Network } from '@/types/on-chain'
import { parseToStroop } from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { useModalContext } from '@/app/providers/ModalProvider'

const CreateProjectFormContext = createContext<ICreateProjectFormContext>({
	data: DEFAULT_CREATE_PROJECT_DATA,
	setData: () => {},
	step: 1,
	setStep: () => {},
	onClose: () => {},
	onProceedApply: () => Promise.resolve(),
})

const CreateProjectFormMainModal = ({ isOpen, onClose }: BaseModalProps) => {
	const [dataForm, setDataForm] = useState<ICreateProjectForm>(
		DEFAULT_CREATE_PROJECT_DATA,
	)
	const { dismissPageLoading, openPageLoading } = useGlobalContext()
	const [step, setStep] = useState<number>(1)
	const { stellarPubKey, stellarKit } = useWallet()
	const { setSuccessCreateProjectModalProps } = useModalContext()

	const onProceedApply = async () => {
		try {
			openPageLoading()
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
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
					denomiation: f.denomination,
					description: f.description,
					amount: parseToStroop(f.amount),
					funded_ms: BigInt(f.date.getTime() as number),
				})),
				image_url: DEFAULT_IMAGE_URL,
				payout_address: stellarPubKey,
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
			const txCreateProject = await createProject(
				stellarPubKey,
				params,
				contracts,
			)
			const txHashCreateProject = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txCreateProject,
				stellarPubKey,
			)
			if (txHashCreateProject) {
				setSuccessCreateProjectModalProps((prev) => ({
					...prev,
					isOpen: true,
					createProjectRes: txCreateProject.result,
					txHash: txHashCreateProject,
				}))
				setDataForm(DEFAULT_CREATE_PROJECT_DATA)
				dismissPageLoading()
				onClose()
			}
		} catch (error: any) {
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
			<Modal isOpen={isOpen} onClose={onClose}>
				<div className="w-11/12 md:w-[560px] mx-auto bg-white rounded-xl border border-black/10 shadow p-2">
					<div className="py-4 px-4 md:px-6 flex items-center justify-center">
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
