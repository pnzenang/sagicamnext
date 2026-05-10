import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { createMemberAction, fetchProfile } from '@/utils/actions'
import { delegateRecommendation, memberStatus } from '@/utils/types'

const AddMember = async () => {
  const sponsor = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <h1 className='my-2 text-2xl font-semibold capitalize sm:text-6xl'> add loved one</h1>
      <p className='pb-4 text-sm sm:text-lg'>
        <span className='text-primary font-bold'>Please read first: </span>
        Adding the loved ones is the first step toward their registration, the waiting period is at least 60 days within
        witch,{' '}
        <span className='font-bold'>
          {' '}
          their $10 registration fees and $30 anticipated contribution should be received by the admin before they start
          participating in the program. Also, if the registration fees is not received withing the 60 days, the loved
          one will be removed from our database.
        </span>{' '}
        When you are ready to pay their registration and their anticipated contribution, go to{' '}
        <span className='font-bold'>Registration Payments</span> in the sidebar to send and records the registration
        payments of the loved ones you are registering.{' '}
        <span className='text-primary font-bold'>Not following these steps may delay your registration.</span>
      </p>
      <div className='border-primary bg-muted rounded-lg border p-8'>
        <FormContainer action={createMemberAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput type='text' name='firstName' label='Loved one Given name' />
            <FormInput type='text' name='lastAndMiddleNames' label='Loved one last Family names' />

            <MaskDateInput
              type='text'
              name='dateOfBirth'
              label='Loved one date of birth'
              placeholder='MM / DD / YYYY'
            />
            <FormInput type='text' name='countryOfBirth' label='Loved one city of birth' />
            <FormInput type='text' name='nameOfBeneficiary' label='Beneficiary Name' />

            <FormInput type='text' name='sponsorCode' label='Sponsor Code' defaultValue={sponsor.sponsorCode} />

            <FormSelect
              label='sponsor recommendation'
              items={Object.values(delegateRecommendation)}
              name='delegateRecommendation'
              defaultValue={delegateRecommendation.confirm}
            />
            <FormSelect
              label='loved one status'
              name='memberStatus'
              items={[memberStatus.Pending]}
              defaultValue={memberStatus.Pending}
            />

            <SubmitButton text='add loved one' className='mt-4 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default AddMember
