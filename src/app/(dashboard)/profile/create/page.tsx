import { currentUser } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import { createProfileAction } from '@/utils/actions'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'

const CreateProfilePage = async () => {
  const user = await currentUser()

  if (user?.privateMetadata?.hasProfile) redirect('/all-members')

  return (
    <section className='mt-16 flex flex-col'>
      <h1 className='my-8 text-2xl font-semibold capitalize sm:text-6xl'> create association profile</h1>
      <div className='border-primary bg-muted rounded-lg border p-8'>
        <FormContainer action={createProfileAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <FormInput type='text' name='associationName' label='Association Name' />
            <FormInput type='text' name='associationCode' label='Association Code' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput type='text' name='firstDelegateFullName' label='First Delegate Name' />
            <MaskPhoneInput
              type='text'
              name='firstDelegatePhoneNumber'
              label='First Delegate Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='firstDelegateEmail' label='First Delegate Email' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput type='text' name='secondDelegateFullName' label='Second Delegate Name' />
            <MaskPhoneInput
              type='text'
              name='secondDelegatePhoneNumber'
              label='First Delegate Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='secondDelegateEmail' label='Second Delegate Email' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput type='text' name='thirdDelegateFullName' label='Third Delegate Name' />
            <MaskPhoneInput
              type='text'
              name='thirdDelegatePhoneNumber'
              label='First Delegate Phone Number'
              placeholder='(###) ###-####'
            />
            <FormInput type='text' name='thirdDelegateEmail' label='Third Delegate Email' />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <SubmitButton text='Create Profile' className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default CreateProfilePage
