import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import {
  createRemovedMemberAction,
  fetchProfile,
  fetchSingleMemberDetails,
  updateMemberDetailsAction
} from '@/utils/actions'
import { reasonForLeaving } from '@/utils/types'
import { BsSignStopFill } from 'react-icons/bs'
import { TiWarning } from 'react-icons/ti'

const RemoveMember = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const { firstName, lastAndMiddleNames, dateOfBirth, countryOfBirth, memberMatriculationNumber, sponsorCode } = member

  const profile = await fetchProfile()
  const currentDay = new Date().getDate()
  const shouldShow = currentDay <= 6 || currentDay >= 25
  return (
    <section className='mt-16 flex flex-col'>
      <div className='my flex flex-row items-center'>
        <TiWarning className='size-8 items-center text-red-500 sm:size-15' />
        <h1 className='text-3xl font-semibold text-red-600 capitalize sm:text-6xl'> loved one Removal </h1>
      </div>
      <div>
        {shouldShow ? (
          <p className='text-xs text-red-500 sm:text-lg'>
            Check your entry well before submission. Removed loved ones can be restored within 48 hours from the Removed
            Members page.
          </p>
        ) : null}
      </div>
      <div className='border-destructive rounded-lg border bg-red-800/40 p-8 py-12'>
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
              {shouldShow && (
                <SubmitButton text='Withdraw Love One' className='mt-4 w-full bg-red-800 hover:bg-red-900' />
              )}
            </div>
            {!shouldShow && (
              <div className='mt-10 flex flex-col items-center justify-center gap-1 sm:flex-row'>
                <BsSignStopFill className='size-8 items-center text-red-500' />{' '}
                <h1 className='text-center text-sm font-semibold text-red-500 sm:text-lg'>
                  In order to ensure accuracy, SAGICAM prevents withdrawal between the 6th and the 25th of the month.
                  Please complete your withdrawals between the 25th and the 6th.
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
