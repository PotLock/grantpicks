import { GPRound } from '@/models/round'
import { useForm } from 'react-hook-form'
import Switch from 'react-switch'
import { UpdateApplicationConfig } from '@/types/form'
import { subDays } from 'date-fns'
import Button from '../../commons/Button'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { useWallet } from '@/app/providers/WalletProvider'
import { DatePickerWithValidation } from '../../commons/DatePickerWithValidation'
import { useRoundDuration } from '../../hooks/RoundDurationHook'

interface TimePeriodDrawerProps {
  doc: GPRound
  mutateRounds: any
}

export const TimePeriodDrawer = ({ doc, mutateRounds }: TimePeriodDrawerProps) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateApplicationConfig>({
    mode: 'onChange',
    defaultValues: {
      allow_applications: doc.allow_applications,
      application_start: doc.application_start ? new Date(doc.application_start) : null,
      application_end: doc.application_end ? new Date(doc.application_end) : null,
      voting_start: new Date(doc.voting_start),
      voting_end: new Date(doc.voting_end),
    },
  })
  const { stellarPubKey, stellarKit } = useWallet()
  const storage = useAppStorage()
  const { handleUpdateApplicationDuration, handleUpdateVotingDuration } = useRoundDuration({
    storage,
    stellarPubKey,
    stellarKit: stellarKit as StellarWalletsKit,
    doc,
    mutateRounds
  })

  // Compute duration validation flags
  const minDurationMs = 24 * 60 * 60 * 1000
  const applicationStart = watch().application_start
  const applicationEnd = watch().application_end
  const votingStart = watch().voting_start
  const votingEnd = watch().voting_end
  const isApplicationDurationTooShort =
    !!watch().allow_applications &&
    applicationStart instanceof Date &&
    applicationEnd instanceof Date &&
    Math.abs(applicationEnd.getTime() - applicationStart.getTime()) < minDurationMs
  const isVotingDurationTooShort =
    votingStart instanceof Date &&
    votingEnd instanceof Date &&
    Math.abs(votingEnd.getTime() - votingStart.getTime()) < minDurationMs


  return <div className="bg-white flex w-full flex-col h-full overflow-y-auto">
    <div className="bg-white flex flex-col w-full h-full overflow-y-auto">
      <h2 className="text-2xl text-black mb-2 font-bold">Update Round Duration</h2>
      <p className="text-sm text-black mb-10">Update the duration of the round. The duration must be at least 24 hours apart, and the application period must end before the voting period begins. <br />
        <i className='text-black pt-2'>NOTE: YOU CAN ONLY UPDATE THE DURATION OF THE ROUND IF THE APPLICATION OR VOTING PERIOD HAS NOT STARTED.</i></p>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <div className="w-full lg:w-2/4">
          <h3 className="text-base text-center text-black font-bold uppercase">Update Application Duration</h3>
          <div className="p-5 rounded-2xl shadow-md bg-white text-black mb-4 lg:mb-6">
            <div className="flex items-center justify-between pb-4 border-black/10">
              <p className="text-base text-black font-semibold">Allow Applications</p>
              <Switch
                checked={watch().allow_applications}
                onChange={async (checked: boolean) => {
                  setValue('allow_applications', checked)
                }}
                height={22}
                width={42}
                disabled={doc.application_start ? new Date(doc.application_start) < new Date() : false}
                checkedIcon={false}
                uncheckedIcon={false}
                offColor="#DCDCDC"
                onColor="#292929"
                handleDiameter={18}
              />
            </div>
          </div>
          <div {...register('application_start', { required: watch().allow_applications })}>
            <div className="space-y-4">
              <DatePickerWithValidation
                name="application_start"
                control={control}
                label="Application Start Date"
                disabled={!watch().allow_applications || (doc.application_start ? new Date(doc.application_start) < new Date() : false)}
                minDate={new Date()}
                maxDate={watch().application_end instanceof Date ? watch().application_end! : undefined}
                required={watch().allow_applications}
                placeholder="Start Date"
                validateDuration={{
                  endDate: watch().application_end,
                  minHoursDiff: 24
                }}
              />
              <DatePickerWithValidation
                name="application_end"
                control={control}
                label="Application End Date"
                disabled={!watch().allow_applications || (doc.application_start ? new Date(doc.application_start) < new Date() : false)}
                minDate={watch().application_start instanceof Date ? watch().application_start! : undefined}
                maxDate={subDays(watch().voting_start as Date, 0)}
                required={watch().allow_applications}
                placeholder="End Date"
                validateDuration={{
                  endDate: watch().application_start,
                  minHoursDiff: 24
                }}
              />
            </div>
          </div>
          <Button
            color="black-950"
            className="!py-3 mt-4"
            isFullWidth
            isDisabled={!watch().allow_applications || !watch().application_end ||
              (watch().application_end instanceof Date && (watch().application_end as Date).getTime() < new Date().getTime())
              || (doc.application_start ? new Date(doc.application_start) < new Date() : false)
              || isApplicationDurationTooShort
            }
            onClick={handleSubmit(handleUpdateApplicationDuration)}
          >
            Update Application Duration
          </Button>
        </div>
        <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
          <h3 className="text-base text-center text-black font-bold uppercase">Update Voting Duration</h3>
          <div className='space-y-4'>
            <DatePickerWithValidation
              name="voting_start"
              control={control}
              label="Voting Start Date"
              disabled={(doc.voting_start ? new Date(doc.voting_start) < new Date() : false)}
              minDate={new Date()}
              maxDate={watch().voting_end instanceof Date ? watch().voting_end! : undefined}
              required={watch().allow_applications}
              placeholder="Start Date"
              validateDuration={{
                endDate: watch().voting_end,
                minHoursDiff: 24
              }}
            />
            <DatePickerWithValidation
              name="voting_end"
              control={control}
              label="Voting End Date"
              disabled={(doc.voting_end ? new Date(doc.voting_end) < new Date() : false)}
              minDate={watch().voting_start instanceof Date ? watch().voting_start! : undefined}
              required={false}
              placeholder="End Date"
              validateDuration={{
                endDate: watch().voting_start,
                minHoursDiff: 24
              }}
            />
          </div>
          <Button
            color="black-950"
            className="!py-3 mt-4"
            isFullWidth
            isDisabled={
              (watch().voting_start instanceof Date && watch().voting_start.getTime() < new Date().getTime()) ||
              (watch().voting_end instanceof Date && watch().voting_end.getTime() < new Date().getTime()) ||
              isVotingDurationTooShort
            }
            onClick={handleSubmit(handleUpdateVotingDuration)}
          >
            Update Voting Duration
          </Button>
        </div>
      </div>
    </div>
  </div>
}
