'use client'
import FormfacadeEmbed from '@formfacade/embed-react'

import { fetchProfile } from '@/utils/actions'

const NameChangeDocumentation = () => {
  // const user = await fetchProfile()
  return (
    <section className='max-w-full min-w-0 overflow-hidden'>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSe1L9nKauAHSyK_WP8w24OSiWPk8_MGv7zTlayDyIHhG44K-w/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vR1kdnA-WBoLRTfLFG-uGxE7kdeZ1-kPxSaX9c_jB4v0TYWI09OhFVoC7Rg97l-odQU7WDSq56ovtwP/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-100 w-full max-w-full min-w-0 rounded-lg border'
      >
        {' '}
      </iframe>
    </section>
  )
}

export default NameChangeDocumentation
