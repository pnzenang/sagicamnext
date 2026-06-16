import { TiWarning } from 'react-icons/ti'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { createRemovedMemberActionAdmin, fetchProfile, fetchSingleMemberDetailsForAdmin } from '@/utils/actions'
import { reasonForLeaving } from '@/utils/types'

const RemoveMember = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetailsForAdmin(id)

  const { firstName, lastAndMiddleNames, dateOfBirth, countryOfBirth, memberMatriculationNumber, sponsorCode } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-8 flex max-w-full min-w-0 flex-col sm:mt-16'>
      <div className='mb-5'>
        <div className='my-1 flex flex-row'>
          <TiWarning className='size-8 items-center text-red-500 sm:size-15' />
          <h1 className='text-2xl font-semibold text-red-600 capitalize sm:text-6xl'> member Removal </h1>
        </div>
        <p className='text-xs text-red-500 sm:text-lg'>
          Check your entry well before submission, the process is not reversible.
        </p>
      </div>
      <div className='border-destructive max-w-full min-w-0 overflow-hidden rounded-lg border bg-red-800/40 p-4 sm:p-8'>
        <FormContainer action={createRemovedMemberActionAdmin}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='Loved one first names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='loved one last and middle names'
                defaultValue={lastAndMiddleNames}
              />
              <FormInput type='text' name='dateOfBirth' label='loved one date of birth' defaultValue={dateOfBirth} />

              <FormInput
                type='text'
                name='countryOfBirth'
                label='loved one city of birth'
                defaultValue={countryOfBirth}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='matriculation'
                defaultValue={memberMatriculationNumber}
              />

              <FormInput type='text' name='sponsorCode' label='sponsor code' defaultValue={sponsorCode} />
              <FormSelect
                label='reason for leaving'
                items={Object.values(reasonForLeaving)}
                name='reasonForLeaving'
                defaultValue={reasonForLeaving.NoReason}
              />
              <SubmitButton text='withdraw Loved one' className='mt-4 w-full bg-red-500 hover:bg-red-800' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default RemoveMember
