import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '../ui/label'

type FormSelectProps = {
  name: string
  items: string[]
  label?: string
  defaultValue?: string
}

const FormSelect = ({ name, items, label, defaultValue }: FormSelectProps) => {
  return (
    <div>
      <Label className='mb-1 capitalize'>{label || name}</Label>
      <Select defaultValue={defaultValue} name={name} required>
        <SelectTrigger className='border-primary w-full border uppercase'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map(item => {
            return (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export default FormSelect
