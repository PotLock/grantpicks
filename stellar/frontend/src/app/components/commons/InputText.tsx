import { InputProps } from '@/types/form'
import clsx from 'clsx'
import { forwardRef, useState } from 'react'

const InputText = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			value,
			name,
			placeholder,
			className,
			type,
			required,
			onChange,
			onKeyDown,
			disabled,
			customLabel,
			label,
			labelIcon,
			hintLabel,
			preffixIcon,
			suffixIcon,
			errorMessage,
			textAlign = 'left',
			isStopPropagation,
		},
		ref,
	) => {
		const [focus, setFocus] = useState<boolean>(false)
		return (
			<div className={label ? `gap-y-[10px]` : `gap-y-0`}>
				{customLabel ||
					(label && (
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
					))}
				<div className="relative mb-1">
					{disabled && (
						<div className="absolute inset-0 z-20 bg-grantpicks-black-50/50 cursor-not-allowed rounded-xl" />
					)}
					{preffixIcon && (
						<div className="absolute left-0 pl-3 inset-y-0 flex items-center justify-center">
							{preffixIcon}
						</div>
					)}
					<input
						ref={ref}
						disabled={disabled}
						type={type}
						value={value}
						name={name}
						required={required}
						style={{
							paddingLeft: preffixIcon ? `40px` : `12px`,
							paddingRight: suffixIcon ? `40px` : `12px`,
						}}
						className={clsx(
							`py-3 px-3 outline-none flex-1 bg-white rounded-xl w-full text-grantpicks-black-950 placeholder-grantpicks-black-400 focus:shadow-xl ${className}`,
							focus
								? 'shadow-md border border-grantpicks-black-400'
								: 'shadow-none',
							errorMessage
								? `border border-red-500`
								: `border border-grantpicks-black-200`,
							textAlign === 'left'
								? `text-left`
								: textAlign === 'center'
									? `text-center`
									: `text-right`,
						)}
						onFocus={() => setFocus(true)}
						onBlur={() => setFocus(false)}
						placeholder={placeholder}
						onChange={onChange}
						onKeyDown={onKeyDown}
						onClick={(e) => isStopPropagation && e.stopPropagation()}
					/>
					{suffixIcon && (
						<div className="absolute right-0 pr-3 inset-y-0 flex items-center justify-center">
							{suffixIcon}
						</div>
					)}
				</div>
				{hintLabel && (
					<p className="text-xs font-normal text-grantpicks-black-600 mb-1 cursor-default">
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

export default InputText

InputText.displayName = 'InputText'
