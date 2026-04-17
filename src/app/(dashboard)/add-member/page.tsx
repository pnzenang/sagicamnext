import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { createMemberAction, fetchProfile } from '@/utils/actions'
import { delegateRecommendation, memberStatus } from '@/utils/types'

const AddMember = async () => {
  const user = await fetchProfile()

  console.log(user)

  return (
    <section className='mt-16 flex flex-col'>
      <h1 className='my-8 text-2xl font-semibold capitalize sm:text-6xl'> add loved one</h1>
      <div className='border-primary bg-muted rounded-lg border p-8'>
        <FormContainer action={createMemberAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <FormInput type='text' name='firstName' label='member first names' />
            <FormInput type='text' name='lastAndMiddleNames' label='member last and middle names(last name first)' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <MaskDateInput type='text' name='dateOfBirth' label='member date of birth' placeholder='MM / DD / YYYY' />
            <FormInput type='text' name='countryOfBirth' label='member country of birth' />
            <FormInput type='text' name='nameOfBeneficiary' label='Name fo Beneficiary' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <FormInput
              type='text'
              name='associationName'
              label='member association name'
              defaultValue={user.associationName}
            />
            <FormInput
              type='text'
              name='associationCode'
              label='member association code'
              defaultValue={user.associationCode}
            />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <FormSelect
              label='delegate recommendation'
              items={Object.values(delegateRecommendation)}
              name='delegateRecommendation'
              defaultValue={delegateRecommendation.confirm}
            />
            <FormSelect
              label='member status'
              name='memberStatus'
              items={[memberStatus.Pending]}
              defaultValue={memberStatus.Pending}
            />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <SubmitButton text='add member' className='mt-4 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default AddMember
