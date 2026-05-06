'use client'
import FormfacadeEmbed from '@formfacade/embed-react'
import { fetchProfile } from '@/utils/actions'
import Link from 'next/link'
import Image from 'next/image'

const ContributionsPayments = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <div className='flex flex-col items-center justify-center gap-8 sm:flex-row'>
        <div>
          <Link href='https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQUNUSVZFIFNPTElEQVJJVFkgTFREIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiaW5mb0BzYWdpdXNhLm9yZyJ9'>
            <Image
              src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
              width={300}
              height={300}
              alt='QR-Code'
            />
          </Link>
        </div>
        <div>
          <FormfacadeEmbed
            formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSfaNbszEn1G3SHQJSdqmgNvjw0X8xvbtRKIryAabYiCFaZCHQ/classic.js/?div=ff-compose '
            onSubmitForm={() => console.log('Form submitted')}
          />
        </div>
      </div>
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vTisW8_PRJbQxFSfQxoIBia6XTvUWaR-VZDT0_3jFunhrs23CijXxlnJztcbxToqZ1qJjri2qlkhJyT/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-130 w-full max-w-19/20 rounded-lg border py-10'
      ></iframe>
    </section>
  )
}

export default ContributionsPayments
