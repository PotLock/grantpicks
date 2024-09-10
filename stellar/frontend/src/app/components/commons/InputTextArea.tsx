import { InputProps, InputTextAreaProps } from '@/types/form'
import clsx from 'clsx'
import { forwardRef, useState } from 'react'

const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
	(
		{
			value,
			name,
			placeholder,
			className,
			onChange,
			disabled,
			required,
			label,
			labelIcon,
			rows = 4,
			hintLabel,
			errorMessage,
			textAlign = 'left',
			maxLength,
		},
		ref,
	) => {
		const [focus, setFocus] = useState<boolean>(false)
		return (
			<div className={label ? `gap-y-[10px]` : `gap-y-0`}>
				{label && (
					<div className="flex gap-x-1">
						<p
							className={clsx(
								`font-semibold text-sm mb-2 cursor-default`,
								disabled
									? `text-grantpicks-black-300`
									: `text-grantpicks-black-950`,
							)}
						>
							{label}
							{required && <span className="text-red-500 ml-1">*</span>}
						</p>
						{labelIcon && <div className="z-50">{labelIcon}</div>}
					</div>
				)}
				<div className="relative mb-1">
					{disabled && (
						<div className="absolute inset-0 z-20 bg-grantpicks-black-50/50 cursor-not-allowed rounded-xl" />
					)}
					<textarea
						ref={ref}
						disabled={disabled}
						value={value}
						name={name}
						rows={rows}
						className={clsx(
							`py-3 px-3 outline-none flex-1 bg-white rounded-xl w-full text-grantpicks-black-950 placeholder-grantpicks-black-400 focus:shadow-xl ${className}`,
							focus
								? 'shadow-xl border border-grantpicks-black-400'
								: 'shadow-none',
							errorMessage
								? `border border-red-500`
								: `border border-grantpicks-black-200`,
							textAlign === 'left'
								? `text-left`
								: textAlign === 'center'
									? 'text-center'
									: 'text-right',
						)}
						onFocus={() => setFocus(true)}
						onBlur={() => setFocus(false)}
						placeholder={placeholder}
						onChange={onChange}
						maxLength={maxLength}
					/>
				</div>
				{hintLabel && (
					<p className="text-xs font-normal text-grantpicks-black-600 mb-2 pl-3 cursor-default">
						{hintLabel}
					</p>
				)}
				{errorMessage && (
					<p className="flex items-center text-xs text-red-500 cursor-default">
						{errorMessage}
					</p>
				)}
			</div>
		)
	},
)

export default InputTextArea

InputTextArea.displayName = 'InputTextArea'
