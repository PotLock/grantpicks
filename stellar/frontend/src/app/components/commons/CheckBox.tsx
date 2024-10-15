import { CheckboxProps } from '@/types/form'
import { ChangeEvent, HTMLAttributes } from 'react'

const Checkbox = ({
	parentClassName,
	className,
	checked,
	onChange,
	label,
	disabled = false,
	name,
	value,
  onChecked
}: CheckboxProps) => {
	return (
		<div className={`${parentClassName} flex items-center space-x-2`}>
			<input
				type="checkbox"
				name={name}
				checked={checked}
				onChange={(e: ChangeEvent<HTMLInputElement>) => {
					onChange(e)
					
          if(onChecked && value) {
            onChecked(value, e.target.checked)
          }
				}}
				disabled={disabled}
				value={value}
				className={`h-4 w-4 cursor-pointer checked:accent-grantpicks-black-950 ${className}`}
			/>
			<p className="text-grantpicks-black-950 font-normal text-sm">{label}</p>
		</div>
	)
}

export default Checkbox
