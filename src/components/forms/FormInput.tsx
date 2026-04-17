import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormInputProps = {
  name: string
  type: string
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  readOnly?: boolean
}

const FormInput = (props: FormInputProps) => {
  const { label, type, name, defaultValue, placeholder, value, readOnly } = props

  return (
    <div className='mb-2'>
      <Label htmlFor={name} className='mb-1 capitalize'>
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        readOnly={readOnly}
        className='border-primary border uppercase'
      />
    </div>
  )
}

export default FormInput
