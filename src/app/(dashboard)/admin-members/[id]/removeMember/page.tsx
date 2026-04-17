import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { createRemovedMemberActionAdmin, fetchProfile, fetchSingleMemberDetailsForAdmin } from '@/utils/actions'
import { reasonForLeaving } from '@/utils/types'
import { TiWarning } from 'react-icons/ti'
const RemoveMember = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetailsForAdmin(id)

  const { firstName, lastAndMiddleNames, dateOfBirth, countryOfBirth, memberMatriculationNumber } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='mb-5'>
        <div className='my-1 flex flex-row'>
          <TiWarning className='size-8 items-center text-red-500 sm:size-15' />
          <h1 className='text-2xl font-semibold text-red-600 capitalize sm:text-6xl'> member Removal </h1>
        </div>
        <p className='text-xs text-red-500 sm:text-lg'>
          Check your entry well before submission, the process is not reversible.
        </p>
      </div>
      <div className='border-destructive rounded-lg border bg-red-800/40 p-8'>
        <FormContainer action={createRemovedMemberActionAdmin}>
          <div>
            {/* <input type='hidden' name='id' value={id} /> */}
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='member first names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='member last and middle names(last name first)'
                defaultValue={lastAndMiddleNames}
              />
              <FormInput type='text' name='dateOfBirth' label='member date of birth' defaultValue={dateOfBirth} />
            </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <input type='hidden' name='id' value={id} />

              <FormInput
                type='text'
                name='countryOfBirth'
                label='member country of birth'
                defaultValue={countryOfBirth}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='matriculation'
                defaultValue={memberMatriculationNumber}
              />
              <FormInput
                type='text'
                name='associationName'
                label='member association name'
                defaultValue={profile.associationName}
              />
            </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <input type='hidden' name='id' value={id} />

              <FormInput
                type='text'
                name='associationCode'
                label='member association code'
                defaultValue={profile.associationCode}
              />
              <FormSelect
                label='reason for leaving'
                items={Object.values(reasonForLeaving)}
                name='reasonForLeaving'
                defaultValue={reasonForLeaving.NoReason}
              />
              <SubmitButton text='withdraw member' className='mt-4 w-full bg-red-500 hover:bg-red-800' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default RemoveMember
