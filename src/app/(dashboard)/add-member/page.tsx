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
    <section className='mt-8 flex max-w-full min-w-0 flex-col sm:mt-16'>
      <h1 className='my-2 text-2xl font-semibold capitalize sm:text-6xl'> add loved one</h1>
      <p className='pb-4 text-sm sm:text-lg'>
        Adding the loved ones is the first step toward their registration, the waiting period is at least 30 days within
        witch,{' '}
        <span className='font-bold'>
          {' '}
          their $10 registration fees and $30 anticipated contribution should be received by the admin before they start
          participating in the program. Also, if the registration fees is not received withing the 60 days, the loved
          one will be removed from our database.
        </span>
        <br />
        <br />
        When you are ready to pay for their registration fee and their anticipated contribution, click on the
        <span className='font-bold'> Registration Payments</span> link in the sidebar to record the registration, upload
        the screenshot of the members to register for, and the proof of payment of the registration fee and anticipated
        contribution. This will help us track the payments of the loved ones you are registering. <br />
        <br />
        <span className='text-primary font-bold'>Not following the steps above may delay your registration.</span>
      </p>
      <div className='border-primary bg-muted max-w-full min-w-0 overflow-hidden rounded-lg border p-4 sm:p-8'>
        <FormContainer action={createMemberAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput type='text' name='firstName' label='Loved one Given name' />
            <FormInput type='text' name='lastAndMiddleNames' label='Loved one Family names' />

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
