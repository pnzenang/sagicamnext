'use client'

import FormfacadeEmbed from '@formfacade/embed-react'

const ButtonIconDemo = () => {
  // const user = await fetchProfile()
  return (
    <section className='max-w-full min-w-0 overflow-hidden'>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLScMuWZqCrASebj-ICri_7N2LC6-lcludF3N9bVHpWV7TarEzg/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRCfxI6ydIQ259MnPJrSmq9f6tZfVfPS-JT9kq34dHnJxxePhct1aFvkhltWfvhLB835a8kmaWU5Z_6/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-90 w-full max-w-full min-w-0 rounded-lg border'
      >
        {' '}
      </iframe>
    </section>
  )
}

export default ButtonIconDemo
