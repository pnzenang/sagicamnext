import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import LogoSmall from '@/components/logoSmall'
import db from '@/utils/db'
import { createProfileAction } from '@/utils/actions'

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
    <section className='bg-muted flex min-h-dvh w-full items-center justify-center px-4 py-10'>
      <div className='bg-background w-full max-w-5xl rounded-lg border p-4 shadow-sm sm:p-8'>
        <div className='mb-8 flex flex-col items-center text-center'>
          <LogoSmall className='size-20' />
          <h1 className='mt-4 text-2xl font-semibold capitalize sm:text-4xl'>create sponsor profile</h1>
          <p className='text-muted-foreground mt-3 max-w-3xl text-sm sm:text-base'>
            If you already had a 4-letter code with SAGICAM, use that code so you can see your existing member. If
            you had one but don&apos;t remember, please contact the admin by dialing 1(804)-214-6390.
          </p>
        </div>
        <FormContainer action={createProfileAction}>
          <div className='grid gap-4 md:grid-cols-3'>
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
