'use client'
import FormfacadeEmbed from '@formfacade/embed-react'
import { fetchProfile } from '@/utils/actions'

const ContributionsPayments = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSfaNbszEn1G3SHQJSdqmgNvjw0X8xvbtRKIryAabYiCFaZCHQ/classic.js/?div=ff-compose '
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vTisW8_PRJbQxFSfQxoIBia6XTvUWaR-VZDT0_3jFunhrs23CijXxlnJztcbxToqZ1qJjri2qlkhJyT/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-130 w-full max-w-19/20 rounded-lg border py-10'
      ></iframe>
    </section>
  )
}

export default ContributionsPayments
