'use client'

import Button from '@/app/components/commons/Button'
import EvaluationGuideModal from '@/app/components/pages/round-vote/EvaluationGuideModal'
import IsNotVotedSection from '@/app/components/pages/round-vote/IsNotVotedSection'
import IsVotedSection from '@/app/components/pages/round-vote/IsVotedSection'
import ProjectDetailDrawer from '@/app/components/pages/round-vote/ProjectDetailDrawer'
import RoundVoteLayout from '@/app/components/pages/round-vote/RoundVoteLayout'
import IconArrowLeft from '@/app/components/svgs/IconArrowLeft'
import IconArrowRight from '@/app/components/svgs/IconArrowRight'
import IconEye from '@/app/components/svgs/IconEye'
import IconMaximize from '@/app/components/svgs/IconMaximize'
import IconPause from '@/app/components/svgs/IconPause'
import IconPlay from '@/app/components/svgs/IconPlay'
import { useModalContext } from '@/app/providers/ModalProvider'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const RoundVotePage = () => {
	const params = useParams<{ roundId: string }>()
	const [showEvalGuide, setShowEvalGuide] = useState<boolean>(false)
	const [showProjectDetailDrawer, setShowProjectDetailDrawer] =
		useState<boolean>(false)
	const [hasVoted, setHasVoted] = useState<boolean>(false)

	useEffect(() => {
		setShowEvalGuide(true)
	}, [])

	return (
		<RoundVoteLayout>
			{!hasVoted ? (
				<IsNotVotedSection
					setShowEvalGuide={setShowEvalGuide}
					setShowProjectDetailDrawer={setShowProjectDetailDrawer}
					setHasVoted={setHasVoted}
				/>
			) : (
				<IsVotedSection />
			)}
			<ProjectDetailDrawer
				isOpen={showProjectDetailDrawer}
				onClose={() => setShowProjectDetailDrawer(false)}
				projectData={undefined}
			/>
			<EvaluationGuideModal
				isOpen={showEvalGuide}
				onClose={() => setShowEvalGuide(false)}
			/>
		</RoundVoteLayout>
	)
}

export default RoundVotePage
