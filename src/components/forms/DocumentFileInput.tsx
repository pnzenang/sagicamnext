'use client'

import type { ComponentProps } from 'react'

import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { documentationFileTooLargeMessage, maxDocumentationFileSize } from '@/utils/document-upload'

const DocumentFileInput = ({ onChange, ...props }: Omit<ComponentProps<typeof Input>, 'type'>) => (
  <Input
    {...props}
    type='file'
    onChange={event => {
      const file = event.target.files?.[0]

      if (file && file.size > maxDocumentationFileSize) {
        toast(documentationFileTooLargeMessage)
        event.target.value = ''

        return
      }

      onChange?.(event)
    }}
  />
)

export default DocumentFileInput
