import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import { createProfileAction } from '@/utils/actions'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import db from '@/utils/db'

const fetchExistingProfileId = async (userId: string) => {
  try {
    const profile = await db.profile.findUnique({
      where: {
        clerkId: userId
      },
      select: {
        id: true
      }
    })

    return profile?.id ?? null
  } catch (error) {
    console.error('Unable to load existing sponsor profile during profile creation', error)

    return null
  }
}

const CreateProfilePage = async () => {
  const { userId } = await auth()

  if (!userId) redirect('/')

  const profileId = await fetchExistingProfileId(userId)

  if (profileId) redirect('/navigation-instructions')

  return (
    <section className='mt-8 flex max-w-full min-w-0 flex-col sm:mt-16'>
      <h1 className='my-8 text-2xl font-semibold capitalize sm:text-6xl'> create sponsor profile</h1>
      <p className='pb-4 text-sm sm:text-lg'>
        If you already had a 4-letter code with SAGICAM, use that code so you can see your existing member, if had one
        but don&apos;t remember, please contact the admin by dialing 1(804)-214-6390
      </p>
      <div className='border-primary bg-muted max-w-full min-w-0 overflow-hidden rounded-lg border p-4 sm:p-8'>
        <FormContainer action={createProfileAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput type='text' name='sponsorFirstName' label='Sponsor First Name' />
            <FormInput type='text' name='sponsorLastAndMiddleName' label='Sponsor Last and Middle Names' />
            <FormInput type='text' name='sponsorCode' label='Sponsor 4-letter Code' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <MaskPhoneInput
              type='text'
              name='sponsorPhoneNumber'
              label='Sponsor Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='sponsorEmail' label='Sponsor Email' />
            <SubmitButton text='Create Profile' className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default CreateProfilePage
