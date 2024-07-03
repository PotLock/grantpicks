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
			hintLabel,
			errorMessage,
			textAlign = 'left',
		},
		ref,
	) => {
		const [focus, setFocus] = useState<boolean>(false)
		return (
			<div className={label ? `gap-y-[10px]` : `gap-y-0`}>
				{label && (
					<p className="font-semibold text-grantpicks-black-950 mb-2 cursor-default">
						{label}
						{required && <span className="text-red-500">*</span>}
					</p>
				)}
				<div className="relative mb-1">
					<textarea
						ref={ref}
						disabled={disabled}
						value={value}
						name={name}
						rows={4}
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
					/>
				</div>
				{hintLabel && (
					<p className="text-xs font-normal text-grantpicks-black-600 mb-2 pl-3 cursor-default">
						{hintLabel}
					</p>
				)}
				{errorMessage && (
					<p className="flex items-center text-xs text-red-500 pl-3 cursor-default">
						{errorMessage}
					</p>
				)}
			</div>
		)
	},
)

export default InputTextArea

InputTextArea.displayName = 'InputTextArea'
