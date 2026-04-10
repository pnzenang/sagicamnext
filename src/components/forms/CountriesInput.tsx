import { formattedCountries } from '@/utils/countries'
import { Label } from '../ui/label'
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '../ui/select'

const name = 'country'

const CountriesInput = ({ defaultValue }: { defaultValue?: string }) => {
  return (
    <div className='mb-3'>
      <Label htmlFor={name} className='mb-1 capitalize'>
        country of birth
      </Label>
      <Select defaultValue={defaultValue || formattedCountries[0].name} name={name} required>
        <SelectTrigger id={name} className='border-primary w-full border'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className=''>
          {formattedCountries.map(item => {
            return (
              <SelectItem key={item.code} value={item.code}>
                {item.name}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export default CountriesInput
