'use client'
import { fetchProfile } from '@/utils/actions'
import FormfacadeEmbed from '@formfacade/embed-react'
const NameChangeDocumentation = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <div className='bg-muted mx-auto my-2 max-w-7xl rounded-lg border p-4'>
        <h1 className='text-muted-foreground py-3 text-sm font-bold sm:text-3xl lg:text-5xl'>
          SAGICAM NAME CHANGE FORM
        </h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, Enter the name that you would like to change, and the correct information as it should be.{' '}
          <br /> In case of name change, please upload the name change documentation, which shouldn't be the new Id card
          or the new passport of the member, but the official name change document.
        </h1>
      </div>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSe8VUH5w9o-FJroGWfd2xkxjqbZ0vZTVBSIfWR8zOnU4lqKzQ/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vTNIfaFxRUEzcloDV7zTX4PNpdIX8_EVamCYdZCA3Bi2Z-04neVplvWtX4BSwvrt5wX7iwJUEnQj5j6/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-100 w-full max-w-7xl rounded-lg border'
      >
        {' '}
      </iframe>
    </section>
  )
}

export default NameChangeDocumentation
