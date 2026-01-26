import React from 'react'
import clsx from 'clsx'

interface StepIndicatorProps {
	currentStep: number
	steps: string[]
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
	return (
		<div className="flex items-center justify-between mb-8 md:mb-12">
			{steps.map((step, index) => {
				const stepNumber = index + 1
				const isActive = stepNumber === currentStep
				const isCompleted = stepNumber < currentStep

				return (
					<React.Fragment key={step}>
						<div className="flex flex-col items-center relative flex-1">
							<div
								className={clsx(
									'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 z-10',
									isActive
										? 'bg-grantpicks-black-950 text-white'
										: isCompleted
											? 'bg-grantpicks-black-950 text-white'
											: 'bg-grantpicks-black-100 text-grantpicks-black-400',
								)}
							>
								{isCompleted ? '✓' : stepNumber}
							</div>
							<p
								className={clsx(
									'text-xs mt-2 font-semibold uppercase tracking-wider text-center absolute -bottom-6 w-max',
									isCompleted
										? 'text-grantpicks-black-950'
										: isActive
											? 'text-grantpicks-black-700'
											: 'text-grantpicks-black-400',
								)}
							>
								{step}
							</p>
						</div>
						{index < steps.length - 1 && (
							<div
								className={clsx(
									'h-[2px] flex-1 mx-2 mb-4 transition-colors duration-300',
									isActive ? 'bg-grantpicks-green-500' : 'bg-grantpicks-black-100',
								)}
							/>
						)}
					</React.Fragment>
				)
			})}
		</div>
	)
}

export default StepIndicator
