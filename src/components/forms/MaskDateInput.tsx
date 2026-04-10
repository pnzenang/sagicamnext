'use client'

import { withMask } from 'use-mask-input'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormInputProps = {
  name: string
  type: string
  label?: string
  defaultValue?: string
  placeholder?: string
}

const MaskDateInput = (props: FormInputProps) => {
  const { label, type, name, defaultValue, placeholder } = props

  return (
    <div className='mb-2'>
      <Label htmlFor={name} className='mb-1 capitalize'>
        {label || name}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        className='border-primary border uppercase'
        ref={withMask('datetime', {
          placeholder: 'MM/DD/YYYY',
          showMaskOnHover: false,
          inputFormat: 'MM/DD/YYYY',
          outputFormat: 'MM/DD/YYYY'
        })}
      />
    </div>
  )
}

export default MaskDateInput
