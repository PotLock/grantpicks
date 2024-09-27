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
	textAlign = 'center',
}: ButtonProps) => {
	const getColor = () => {
		if (color === 'black-950') return 'bg-grantpicks-black-950 text-white'
		else if (color === 'black') return 'bg-black text-white'
		else if (color === 'disabled') return 'bg-grantpicks-black-200 text-white'
		else if (color === 'white')
			return 'bg-white border border-grantpicks-black-400 text-grantpicks-black-950'
		else if (color === 'transparent')
			return 'bg-transparent text-grantpicks-black-950'
		else if (color === 'alpha-50')
			return 'bg-grantpicks-alpha-50/5 text-grantpicks-black-950'
		else if (color === 'red') return 'bg-grantpicks-red-600 text-white'
		else if (color === 'purple') return 'purple-button text-white'
	}

	return (
		<button
			style={style}
			className={clsx(
				'transition duration-300 ease-in-out hover:brightness-125 font-semibold relative rounded-full px-4 py-2',
				getColor(),
				isFullWidth && `w-full`,
				isDisabled && `cursor-not-allowed brightness-75 hover:brightness-75`,
				isLoading && 'cursor-wait',
				className,
			)}
			onClick={(e) => !isDisabled && onClick(e)}
			disabled={isDisabled || isLoading}
			type={type}
		>
			<div
				className={clsx(
					`flex items-center`,
					textAlign === 'left'
						? `justify-start`
						: textAlign === 'center'
							? `justify-center`
							: `justify-end`,
				)}
			>
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
