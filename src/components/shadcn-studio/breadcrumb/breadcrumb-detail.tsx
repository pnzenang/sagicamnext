import { HomeIcon, Users } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const BreadcrumbSlashSeparatorDemo = ({ name }: { name: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/all-members' className='flex items-center gap-2'>
            <Users className='size-4 capitalize' />
            All-Members
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator> / </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage className='capitalize'> {name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbSlashSeparatorDemo
