'use client'

import { useMemo, useState } from 'react'

import { Search, UserRound } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitNameChangeRequestAction } from '@/utils/actions'

type NameChangeMemberOption = {
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  sponsorCode: string
}

const selectClassName =
  'border-input bg-background ring-offset-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const getMemberSearchValue = (member: NameChangeMemberOption) =>
  `${member.firstName} ${member.lastAndMiddleNames} ${member.memberMatriculationNumber} ${member.sponsorCode}`.toLowerCase()

const SponsorNameChangeProposalForm = ({ members }: { members: NameChangeMemberOption[] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')

  const selectedMember = useMemo(
    () => members.find(member => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) return members

    return members.filter(member => getMemberSearchValue(member).includes(normalizedSearch))
  }, [members, searchQuery])

  const handleSearchChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)

    const selectedMemberStillMatches =
      selectedMember && getMemberSearchValue(selectedMember).includes(nextSearchQuery.trim().toLowerCase())

    if (!selectedMemberStillMatches) {
      setSelectedMemberId('')
    }
  }

  return (
    <Card className='rounded-lg py-0'>
      <CardHeader className='border-b px-4 py-4'>
        <div className='flex items-start gap-3'>
          <UserRound className='text-primary mt-1 size-5 shrink-0' />
          <div className='min-w-0'>
            <CardTitle className='text-lg break-words'>Propose a name change</CardTitle>
            <p className='text-muted-foreground mt-1 text-xs'>
              Choose the loved one, enter the corrected name, and submit it for admin review.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4'>
        <FormContainer action={submitNameChangeRequestAction} className='grid gap-3' refreshOnMessage>
          <div className='grid gap-1.5'>
            <Label htmlFor='name-change-search'>Search loved ones</Label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id='name-change-search'
                type='search'
                value={searchQuery}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder='Search by name, matriculation, or sponsor code'
                className='pl-9'
              />
            </div>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='name-change-member'>Loved one</Label>
            <select
              id='name-change-member'
              name='memberId'
              required
              className={selectClassName}
              value={selectedMemberId}
              onChange={event => setSelectedMemberId(event.target.value)}
            >
              <option value='' disabled>
                {filteredMembers.length === 0 ? 'No loved ones match your search' : 'Select a loved one'}
              </option>
              {filteredMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastAndMiddleNames} - {member.memberMatriculationNumber}
                </option>
              ))}
            </select>
          </div>
          <div className='rounded-md border bg-muted/30 p-3'>
            <p className='text-muted-foreground text-xs font-semibold'>Current name</p>
            {selectedMember ? (
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember.firstName} {selectedMember.lastAndMiddleNames}
              </p>
            ) : (
              <p className='text-muted-foreground mt-1 text-sm'>Select a loved one to see the current name.</p>
            )}
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='grid gap-1.5'>
              <Label htmlFor='requested-first-name'>Proposed given names</Label>
              <Input id='requested-first-name' name='requestedFirstName' required />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='requested-last-name'>Proposed last and middle names</Label>
              <Input id='requested-last-name' name='requestedLastAndMiddleNames' required />
            </div>
          </div>
          <SubmitButton text='Submit for admin review' className='h-9 w-full text-sm normal-case sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default SponsorNameChangeProposalForm
