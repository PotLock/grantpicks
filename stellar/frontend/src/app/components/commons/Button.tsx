import { ButtonProps } from '@/types/button'
import clsx from 'clsx'
import IconLoading from '../svgs/IconLoading'

const Button = ({
	children,
	color = 'black-950',
	onClick,
	isDisabled,
	isFullWidth,
	isLoading,
	className,
	style,
	icon,
	iconPosition,
	type = 'button',
}: ButtonProps) => {
	const getColor = () => {
		if (color === 'black-950') return 'bg-grantpicks-black-950 text-white'
		else if (color === 'black') return 'bg-black text-white'
		else if (color === 'disabled') return 'bg-grantpicks-black-200 text-white'
		else if (color === 'white')
			return 'bg-white border border-grantpicks-black-400 text-grantpicks-black-950'
		else if (color === 'transparent')
			return 'bg-white text-grantpicks-black-950'
		else if (color === 'alpha-50')
			return 'bg-grantpicks-alpha-50/5 text-grantpicks-black-950'
	}

	// const getSize = () => {
	// 	if (size === 'sm') return 'px-3 py-2 text-sm'
	// 	else if (size === 'md') return 'px-4 py-3 text-base'
	// 	if (size === 'xl') return 'px-6 py-3 text-lg'
	// }

	// const getRounded = () => {
	// 	if (rounded === 'md') return 'rounded-md'
	// 	else if (rounded === 'xl') return 'rounded-xl'
	// 	if (rounded === 'full') return 'rounded-full'
	// }

	return (
		<button
			style={style}
			className={clsx(
				'transition duration-300 ease-in-out hover:opacity-70 font-semibold relative rounded-full px-4 py-2',
				getColor(),
				// getRounded(),
				isFullWidth && `w-full`,
				isDisabled && `cursor-not-allowed opacity-60 hover:bg-opacity-50`,
				isLoading && 'cursor-wait',
				className,
			)}
			onClick={(e) => !isDisabled && onClick(e)}
			disabled={isDisabled || isLoading}
			type={type}
		>
			<div className="flex items-center justify-center">
				{iconPosition === 'left' && <div className="pr-2">{icon}</div>}
				{children}
				{iconPosition === 'right' && <div className="pl-2">{icon}</div>}
				{isLoading && (
					<div className="pl-2">
						<IconLoading
							size={20}
							className={
								color === 'disabled' || color === 'white'
									? 'fill-black'
									: `fill-white`
							}
						/>
					</div>
				)}
			</div>
		</button>
	)
}

export default Button
