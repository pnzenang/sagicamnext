import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import MaskDateInput from '@/components/forms/MaskDateInput'
import {
  createDeceasedMemberAction,
  createDeceasedMemberActionAdmin,
  fetchProfile,
  fetchSingleMemberDetails,
  fetchSingleMemberDetailsForAdmin
} from '@/utils/actions'
import { contributionStatus, delegateRecommendation, memberStatus } from '@/utils/types'
import { TiWarning } from 'react-icons/ti'
import { BsSignStopFill } from 'react-icons/bs'
import { RiArrowGoBackLine } from 'react-icons/ri'
import Link from 'next/link'

const DeathAnnouncement = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const member = await fetchSingleMemberDetails(id)

  const {
    firstName,
    lastAndMiddleNames,
    dateOfBirth,
    countryOfBirth,
    clerkId,
    nameOfBeneficiary,
    memberMatriculationNumber,
    createdAt
  } = member

  const profile = await fetchProfile()

  return (
    <section className='mt-16 flex flex-col'>
      <div className='mb-5'>
        <div className='my-1 flex flex-row'>
          <TiWarning className='size-8 items-center text-purple-500 sm:size-15' />
          <h1 className='text-2xl font-semibold text-purple-600 capitalize sm:text-6xl'> Death Announcement </h1>
        </div>
        <p className='text-xs text-purple-500 sm:text-lg'>
          Check your entry well before submission, the process is not reversible.
        </p>
      </div>
      <div className='rounded-lg border border-purple-800 bg-purple-300/50 p-8'>
        <FormContainer action={createDeceasedMemberAction}>
          <div>
            <input type='hidden' name='id' value={id} />
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <FormInput type='text' name='firstName' label='member first names' defaultValue={firstName} />
              <FormInput
                type='text'
                name='lastAndMiddleNames'
                label='member last and middle names(last name first)'
                defaultValue={lastAndMiddleNames}
              />
              <FormInput
                type='text'
                name='memberMatriculationNumber'
                label='Matriculation'
                defaultValue={memberMatriculationNumber}
              />
            </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <input type='hidden' name='id' value={id} />
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
                label='member country of birth'
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
                name='associationName'
                label='member association name'
                defaultValue={profile.associationName}
              />
              <FormInput
                type='text'
                name='associationCode'
                label='member association code'
                defaultValue={profile.associationCode}
              />
              <FormInput type='text' name='placeOfDeath' label="member's place of death" />
            </div>
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <input type='hidden' name='id' value={id} />

              <MaskDateInput type='text' name='dateOfDeath' label="member's date of death" placeholder='MM/DD/YYYY' />
              <FormSelect
                name='contributionStatus'
                label='Contribution Status'
                items={Object.values(contributionStatus)}
                defaultValue={contributionStatus.review}
              />
              {member.memberStatus === memberStatus.Vested && (
                <SubmitButton text="post member's death" className='mt-4 w-full bg-purple-800 hover:bg-purple-900' />
              )}
            </div>
            {member.memberStatus !== memberStatus.Vested && (
              <div className='mt-10 flex items-center justify-center gap-1 sm:flex-row'>
                <BsSignStopFill className='size-8 items-center text-red-500' />{' '}
                <h1 className='text-center text-sm font-semibold text-red-500 sm:text-lg'>
                  You can not announce the death of {member.lastAndMiddleNames} {member.firstName} because he or she was
                  not vested yet.
                </h1>
                <Link href='/all-members' className='text-red-500 hover:underline'>
                  Back to Members List
                  <RiArrowGoBackLine className='inline' />
                </Link>
              </div>
            )}
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default DeathAnnouncement
