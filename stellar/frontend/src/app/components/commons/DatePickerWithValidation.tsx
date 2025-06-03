import DatePicker from 'react-datepicker'
import IconCalendar from '../svgs/IconCalendar'
import { toast } from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

interface DatePickerWithValidationProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  required?: boolean
  placeholder?: string
  className?: string
  wrapperClassName?: string
  onDateChange?: (date: Date | null) => void
  validateDuration?: {
    endDate: Date | null
    minHoursDiff: number
  }
}

export const DatePickerWithValidation = <T extends FieldValues>({
  name,
  control,
  label,
  disabled = false,
  minDate = new Date(),
  maxDate,
  required = false,
  placeholder = 'Select Date',
  className = 'border border-grantpicks-black-200 text-black rounded-xl w-full h-12',
  wrapperClassName = 'w-full mb-1',
  onDateChange,
  validateDuration,
}: DatePickerWithValidationProps<T>) => {
  return (
    <div>
      {label && (
        <p className="text-base text-black font-semibold mb-2">{label}</p>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        render={({ field, formState: { errors } }) => (
          <DatePicker
            disabled={disabled}
            showIcon
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            selected={field.value as Date | null}
            minDate={minDate}
            maxDate={maxDate}
            icon={
              <div className="flex items-center mt-2 pr-2">
                <IconCalendar size={20} className="fill-grantpicks-black-400" />
              </div>
            }
            calendarIconClassName="flex items-center"
            placeholderText={placeholder}
            isClearable={true}
            onChange={(date) => {
              field.onChange(date)
              onDateChange?.(date)

              if (validateDuration && date && validateDuration.endDate) {
                const startDate = new Date(date)
                const endDate = validateDuration.endDate
                const hoursDiff = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

                if (hoursDiff < validateDuration.minHoursDiff) {
                  toast.error(`Duration must be at least ${validateDuration.minHoursDiff} hours`, {
                    style: toastOptions.error.style,
                  })
                  field.onChange(null)
                  return
                }
              }
            }}
            className={className}
            wrapperClassName={wrapperClassName}
          />
        )}
      />
    </div>
  )
} 