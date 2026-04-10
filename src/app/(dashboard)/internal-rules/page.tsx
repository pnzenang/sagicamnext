/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchProfile } from '@/utils/actions'

const InternalRules = async () => {
  const user = await fetchProfile()

  return <div className='text-4xl'>Internal Rules</div>
}

export default InternalRules
