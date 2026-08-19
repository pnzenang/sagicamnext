import { BsSignStopFill } from 'react-icons/bs'

import { TiWarning } from 'react-icons/ti'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import {
  createRemovedMemberAction,
  fetchSingleMemberDetails
} from '@/utils/actions'
import { memberStatus as memberStatusValues, reasonForLeaving } from '@/utils/types'

const RemoveMember = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfBirth,
    memberMatriculationNumber,
    sponsorCode,
    memberStatus
  } = member

  const currentDay = new Date().getDate()

  const canRemoveAnytime =
    memberStatus === memberStatusValues.Pending || memberStatus === memberStatusValues.Awaiting

  const canSubmitRemoval = canRemoveAnytime || currentDay <= 6 || currentDay >= 25

  return (
    <section className='mt-8 flex max-w-full min-w-0 flex-col sm:mt-16'>
      <div className='my flex flex-row items-center'>
        <TiWarning className='size-8 items-center text-red-500 sm:size-15' />
        <h1 className='text-3xl font-semibold text-red-600 capitalize sm:text-6xl'> loved one Removal </h1>
      </div>
      <div>
        {canSubmitRemoval ? (
          <p className='text-xs text-red-500 sm:text-lg'>
            Check your entry well before submission as the process is not reversible once submitted. Sorry to see your
            member go.
          </p>
        ) : null}
      </div>
      <div className='border-destructive max-w-full min-w-0 overflow-hidden rounded-lg border bg-red-800/40 p-4 py-8 sm:p-8 sm:py-12'>
        <FormContainer action={createRemovedMemberAction}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='loved one given names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='loved one last and middle names(last name first)'
                defaultValue={lastAndMiddleNames}
              />
              <FormInput type='text' name='dateOfBirth' label='loved one date of birth' defaultValue={dateOfBirth} />

              <FormInput
                type='text'
                name='countryOfBirth'
                label='loved one country of birth'
                defaultValue={countryOfBirth}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='matriculation'
                defaultValue={memberMatriculationNumber}
              />

              <FormInput type='text' name='sponsorCode' label='loved one sponsor code' defaultValue={sponsorCode} />
              <FormSelect
                label='reason for leaving'
                items={Object.values(reasonForLeaving)}
                name='reasonForLeaving'
                defaultValue={reasonForLeaving.NoReason}
              />
              {canSubmitRemoval && (
                <SubmitButton text='Withdraw Love One' className='mt-4 w-full bg-red-800 hover:bg-red-900' />
              )}
            </div>
            {!canSubmitRemoval && (
              <div className='mt-10 flex flex-col items-center justify-center gap-1 sm:flex-row'>
                <BsSignStopFill className='size-8 items-center text-red-500' />{' '}
                <h1 className='text-center text-sm font-semibold text-red-500 sm:text-lg'>
                  In order to ensure accuracy, SAGICAM prevents withdrawal between the 6th and the 25th of the month.
                  Please complete your withdrawals between the 25th and the 6th. Pending and Awaiting Publication loved
                  ones can be withdrawn any day.
                </h1>
              </div>
            )}
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default RemoveMember
