/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchProfile } from '@/utils/actions'

const NavigationInstructions = async () => {
  const user = await fetchProfile()

  return <div className='text-4xl'>NavigationInstructions</div>
}

export default NavigationInstructions
