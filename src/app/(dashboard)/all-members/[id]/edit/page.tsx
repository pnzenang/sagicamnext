import { date } from 'zod'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import { fetchProfile, fetchSingleMemberDetails, updateMemberDetailsAction } from '@/utils/actions'
import { delegateRecommendation, memberStatus } from '@/utils/types'

const EditMemberDetailPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfBirth,
    sponsorCode,
    clerkId,
    nameOfBeneficiary,
    memberMatriculationNumber
  } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='my-4 flex flex-col'>
        <h1 className='text-primary text-3xl font-semibold capitalize sm:text-6xl'>
          {' '}
          view and update member&apos;s details{' '}
        </h1>
        <p className='text-primary text-xs sm:text-lg'>
          Here, you can change the member&apos;s date of birth, the beneficiary&apos;s names or country of birth, but to
          edit the name you need to the name change link in the sidebar.
        </p>
      </div>
      <div className='border-primary bg-muted rounded-lg border p-8'>
        <FormContainer action={updateMemberDetailsAction}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='Loved one given names' value={firstName} readOnly />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='Loved one last and middle names(last name first)'
                value={lastAndMiddleNames}
                readOnly
              />

              <FormInput type='text' name='dateOfBirth' label='Loved one date of birth' defaultValue={dateOfBirth} />
              <FormInput
                type='text'
                name='countryOfBirth'
                label='Loved one country of birth'
                defaultValue={countryOfBirth}
              />
              <FormInput
                type='text'
                name='nameOfBeneficiary'
                label='Name fo Beneficiary'
                defaultValue={nameOfBeneficiary}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='Loved one Matriculation Number'
                defaultValue={memberMatriculationNumber}
              />

              <FormInput type='text' name='sponsorCode' label='sponsor code' value={sponsorCode} readOnly />

              <FormSelect
                label='sponsor recommendation'
                items={Object.values(delegateRecommendation)}
                name='delegateRecommendation'
                defaultValue={member.delegateRecommendation}
              />
              <FormSelect
                label='loved one status at registration'
                name='memberStatus'
                items={[memberStatus.Pending]}
                defaultValue={memberStatus.Pending}
              />
              <SubmitButton text='Update member Information' className='mt-4 w-full' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default EditMemberDetailPage
