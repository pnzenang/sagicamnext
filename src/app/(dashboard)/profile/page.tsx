import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import FormInput from '@/components/forms/FormInput'
import MaskPhoneInput from '@/components/forms/MaskPhoneInput'
import { fetchProfile, updateProfileAction } from '@/utils/actions'

const Profile = async () => {
  const profile = await fetchProfile()

  return (
    <section className='mt-8 flex max-w-full min-w-0 flex-col sm:mt-16'>
      <h1 className='my-8 text-2xl font-semibold capitalize sm:text-6xl'> update sponsor profile</h1>
      <div className='border-primary bg-muted max-w-full min-w-0 overflow-hidden rounded-lg border p-4 sm:p-8'>
        <FormContainer action={updateProfileAction}>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='sponsorFirstName'
              label='Sponsor First Name'
              defaultValue={profile.sponsorFirstName}
            />
            <FormInput
              type='text'
              name='sponsorLastAndMiddleName'
              label='Sponsor Last and Middle Names'
              defaultValue={profile.sponsorLastAndMiddleName}
            />
            <FormInput
              type='text'
              name='sponsorCode'
              label='Sponsor 4-letter Code'
              defaultValue={profile.sponsorCode}
            />
          </div>
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <FormInput
              type='text'
              name='sponsorPhoneNumber'
              label='Sponsor Phone Number'
              placeholder='(###) ###-####'
              defaultValue={profile.sponsorPhoneNumber}
            />
            <FormInput type='text' name='sponsorEmail' label='Sponsor Email' defaultValue={profile.sponsorEmail} />
            <SubmitButton text='Update Profile' className='mt-3 w-full' />
          </div>
        </FormContainer>
      </div>
    </section>
  )
}

export default Profile
