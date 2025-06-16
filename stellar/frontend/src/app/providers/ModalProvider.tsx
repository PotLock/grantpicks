'use client'

import React, { useContext, useState } from 'react'
import { ModalContext } from '../contexts/ModalContext'
import {
	IApplyProjectToRoundModalProps,
	IModalContextProps,
	ISuccessAppplyProjectToRoundModalProps,
	IVoteConfirmationModalContextProps,
	ISuccessCreateProjectModalProps,
	ISuccessCreateRoundModalProps,
	ISuccessFundRoundModalProps,
	ISuccessUpdateRoundModalProps,
	IVideoPlayerModalProps,
	ChainId,
} from '@/types/context'
import dynamic from 'next/dynamic'

const SuccessFundRoundModal = dynamic(() => import('../components/pages/application/SuccessFundRoundModal'))
const ApplyProjectModal = dynamic(() => import('../components/pages/application/create-apply-project/ApplyProjectModal'))
const CreateProjectFormMainModal = dynamic(() => import('../components/pages/application/create-apply-project/create-project-form/CreateProjectFormMainModal'))
const VoteConfirmationModal = dynamic(() => import('../components/pages/application/VoteConfirmationModal'))
const SuccessCreateRoundModal = dynamic(() => import('../components/pages/create-round/SuccessCreateRoundModal'))
const SuccessEditRoundModal = dynamic(() => import('../components/pages/application/edit-round/SuccessEditRoundModal'))
const SuccessCreateProjectModal = dynamic(() => import('../components/pages/application/create-apply-project/SuccessCreateProjectModal'))
const SuccessApplyProjectModal = dynamic(() => import('../components/pages/application/create-apply-project/SuccessApplyProjectModal'))
const VideoPlayerModal = dynamic(() => import('../components/commons/VideoPlayerModal'))

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [successCreateRoundProps, setSuccessCreateRoundProps] =
		useState<ISuccessCreateRoundModalProps>({
			isOpen: false,
			createRoundRes: undefined,
			txHash: '',
		})
	const [successCreateProjectProps, setSuccessCreateProjectProps] =
		useState<ISuccessCreateProjectModalProps>({
			isOpen: false,
			createProjectRes: undefined,
			txHash: '',
		})
	const [successUpdateRoundProps, setSuccessUpdateRoundProps] =
		useState<ISuccessUpdateRoundModalProps>({
			isOpen: false,
			updateRoundRes: undefined,
			txHash: '',
		})
	const [successFundRoundProps, setSuccessFundRoundProps] =
		useState<ISuccessFundRoundModalProps>({
			isOpen: false,
			doc: undefined,
			txHash: undefined,
			amount: '',
		})
	const [successApplyProjectToRoundProps, setSuccessApplyProjectToRoundProps] =
		useState<ISuccessAppplyProjectToRoundModalProps>({
			isOpen: false,
			applyProjectRes: undefined,
			roundData: undefined,
			txHash: '',
		})
	const [applyProjectInitProps, setApplyProjectInitProps] =
		useState<IApplyProjectToRoundModalProps>({
			isOpen: false,
			round_id: undefined,
			roundData: undefined,
		})
	const [voteConfirmationProps, setVoteConfirmationProps] =
		useState<IVoteConfirmationModalContextProps>({
			isOpen: false,
			doc: undefined,
			chainId: ChainId.STELLAR,
		})
	const [createProjectFormMainProps, setCreateProjectFormMainProps] =
		useState<IModalContextProps>({
			isOpen: false,
		})
	const [videoPlayerProps, setVideoPlayerProps] =
		useState<IVideoPlayerModalProps>({
			isOpen: false,
			videoUrl: '',
		})

	return (
		<ModalContext.Provider
			value={{
				setSuccessFundRoundModalProps: setSuccessFundRoundProps,
				setSuccessCreateRoundModalProps: setSuccessCreateRoundProps,
				setSuccessUpdateRoundModalProps: setSuccessUpdateRoundProps,
				setSuccessCreateProjectModalProps: setSuccessCreateProjectProps,
				setSuccessApplyProjectInitProps: setSuccessApplyProjectToRoundProps,
				successFundRoundModalProps: successFundRoundProps,
				setApplyProjectInitProps,
				setVoteConfirmationProps,
				setCreateProjectFormMainProps,
				setVideoPlayerProps,
			}}
		>
			{children}
			{successCreateRoundProps.isOpen && (
				<SuccessCreateRoundModal
					isOpen={successCreateRoundProps.isOpen}
					createRoundRes={successCreateRoundProps.createRoundRes}
					txHash={successCreateRoundProps.txHash}
					onClose={() =>
						setSuccessCreateRoundProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{successUpdateRoundProps.isOpen && (
				<SuccessEditRoundModal
					isOpen={successUpdateRoundProps.isOpen}
					updateRoundRes={successUpdateRoundProps.updateRoundRes}
					txHash={successUpdateRoundProps.txHash}
					onClose={() =>
						setSuccessUpdateRoundProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{successFundRoundProps.isOpen && (
				<SuccessFundRoundModal
					isOpen={successFundRoundProps.isOpen}
					amount={successFundRoundProps.amount}
					doc={successFundRoundProps.doc}
					txHash={successFundRoundProps.txHash}
					onClose={() =>
						setSuccessFundRoundProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{successCreateProjectProps.isOpen && (
				<SuccessCreateProjectModal
					isOpen={successCreateProjectProps.isOpen}
					createProjectRes={successCreateProjectProps.createProjectRes}
					txHash={successCreateProjectProps.txHash}
					onClose={() =>
						setSuccessCreateProjectProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{applyProjectInitProps.isOpen && (
				<ApplyProjectModal
					isOpen={applyProjectInitProps.isOpen}
					round_id={applyProjectInitProps.round_id}
					roundData={applyProjectInitProps.roundData}
					onClose={() =>
						setApplyProjectInitProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{successApplyProjectToRoundProps.isOpen && (
				<SuccessApplyProjectModal
					isOpen={successApplyProjectToRoundProps.isOpen}
					applyProjectRes={successApplyProjectToRoundProps.applyProjectRes}
					roundData={successApplyProjectToRoundProps.roundData}
					txHash={successApplyProjectToRoundProps.txHash}
					onClose={() =>
						setSuccessApplyProjectToRoundProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{voteConfirmationProps.isOpen && (
				<VoteConfirmationModal
					isOpen={voteConfirmationProps.isOpen}
					data={voteConfirmationProps.doc}
					chainId={voteConfirmationProps.chainId}
					onClose={() =>
						setVoteConfirmationProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{createProjectFormMainProps.isOpen && (
				<CreateProjectFormMainModal
					isOpen={createProjectFormMainProps.isOpen}
					onClose={() =>
						setCreateProjectFormMainProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
			{videoPlayerProps.isOpen && (
				<VideoPlayerModal
					isOpen={videoPlayerProps.isOpen}
					videoUrl={videoPlayerProps.videoUrl}
					onClose={() =>
						setVideoPlayerProps((prev) => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
		</ModalContext.Provider>
	)
}

export const useModalContext = () => useContext(ModalContext)

export default ModalProvider
