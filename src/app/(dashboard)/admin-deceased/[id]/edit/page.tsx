import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import {
  createDeceasedMemberAction,
  fetchProfile,
  fetchSingleDeceasedMemberDetails,
  updateDeceasedMemberDetailsActionAdmin
} from '@/utils/actions'
import { contributionStatus } from '@/utils/types'

const EditCaseStatus = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const deceasedMember = await fetchSingleDeceasedMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    countryOfBirth,
    nameOfBeneficiary,
    memberMatriculationNumber,

    placeOfDeath,
    dateOfDeath,
    sponsorCode,
    createdAt
  } = deceasedMember

  // const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='my-4 flex flex-col'>
        <h1 className='text-xl font-semibold text-purple-600 capitalize sm:text-6xl'> Edit Case Status </h1>
      </div>
      <div className='rounded-lg border border-purple-800 bg-purple-300/50 p-8'>
        <FormContainer action={updateDeceasedMemberDetailsActionAdmin}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='loved one first names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='loved one last and middle names'
                defaultValue={lastAndMiddleNames}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='Matriculation'
                defaultValue={memberMatriculationNumber}
              />

              <FormInput
                type='text'
                name='registrationDate'
                label='registration date'
                defaultValue={createdAt.toLocaleDateString()}

                // placeholder='MM/DD/YYYY'
              />

              <FormInput
                type='text'
                name='countryOfBirth'
                label='loved one city of birth'
                defaultValue={countryOfBirth}
              />

              <FormInput
                type='text'
                name='nameOfBeneficiary'
                label='Beneficiary Name'
                defaultValue={nameOfBeneficiary}
              />

              <FormInput type='text' name='associationCode' label='sponsor code' defaultValue={sponsorCode} />
              <FormInput
                type='text'
                name='placeOfDeath'
                label="loved one's place of death"
                defaultValue={placeOfDeath}
              />

              <FormInput type='text' name='dateOfDeath' label='loved one date of death' defaultValue={dateOfDeath} />
              <FormSelect
                name='contributionStatus'
                label='Contribution Status'
                items={Object.values(contributionStatus)}
                defaultValue={deceasedMember.contributionStatus}
              />
              <SubmitButton text="post loved one's death" className='mt-4 w-full bg-purple-800 hover:bg-purple-900' />
            </div>
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default EditCaseStatus
