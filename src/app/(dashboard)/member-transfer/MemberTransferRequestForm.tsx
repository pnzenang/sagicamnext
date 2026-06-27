'use client'

import { useMemo, useState } from 'react'

import { ArrowLeftRight, Search } from 'lucide-react'

import FormContainer from '@/components/forms/FormContainer'
import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { submitMemberTransferRequestAction } from '@/utils/actions'

type MemberTransferMemberOption = {
  firstName: string
  id: string
  lastAndMiddleNames: string
  memberMatriculationNumber: string
  memberStatus: string
  sponsorCode: string
}

const maxVisibleMembers = 10

const getMemberNameSearchValue = (member: MemberTransferMemberOption) =>
  `${member.firstName} ${member.lastAndMiddleNames} ${member.memberMatriculationNumber} ${member.sponsorCode}`.toLowerCase()

const MemberTransferRequestForm = ({
  members,
  receivingSponsorCode
}: {
  members: MemberTransferMemberOption[]
  receivingSponsorCode: string
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')

  const selectedMember = useMemo(
    () => members.find(member => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) return members

    return members.filter(member => getMemberNameSearchValue(member).includes(normalizedSearch))
  }, [members, searchQuery])

  const displayedMembers = filteredMembers.slice(0, maxVisibleMembers)
  const hiddenMatchCount = filteredMembers.length - displayedMembers.length

  const handleSearchChange = (nextSearchQuery: string) => {
    setSearchQuery(nextSearchQuery)

    const selectedMemberStillMatches =
      selectedMember && getMemberNameSearchValue(selectedMember).includes(nextSearchQuery.trim().toLowerCase())

    if (!selectedMemberStillMatches) {
      setSelectedMemberId('')
    }
  }

  return (
    <Card className='rounded-lg py-0'>
      <CardHeader className='border-b px-4 py-4'>
        <div className='flex items-start gap-3'>
          <ArrowLeftRight className='text-primary mt-1 size-5 shrink-0' />
          <div className='min-w-0'>
            <CardTitle className='text-lg break-words'>Request a member transfer</CardTitle>
            <p className='text-muted-foreground mt-1 text-xs'>
              Search for the loved one you want to bring into your sponsor group.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='px-4 py-4'>
        <FormContainer action={submitMemberTransferRequestAction} className='grid gap-3' refreshOnMessage>
          <input type='hidden' name='memberId' value={selectedMemberId} />
          <div className='grid gap-1.5'>
            <Label htmlFor='member-transfer-search'>Search loved ones by name</Label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id='member-transfer-search'
                type='search'
                value={searchQuery}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder='Search name, matriculation, or sponsor code'
                className='pl-9'
              />
            </div>
          </div>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-semibold'>Select loved one</p>
              <p className='text-muted-foreground text-xs'>
                {filteredMembers.length} match{filteredMembers.length === 1 ? '' : 'es'}
              </p>
            </div>
            {filteredMembers.length === 0 ? (
              <p className='text-muted-foreground bg-muted/30 rounded-md border p-3 text-sm'>
                No loved ones match your search.
              </p>
            ) : (
              <div className='grid max-h-72 gap-2 overflow-y-auto pr-1'>
                {displayedMembers.map(member => {
                  const isSelected = selectedMemberId === member.id
                  const isTransferAllowed = member.memberStatus === 'vested'

                  return (
                    <button
                      key={member.id}
                      type='button'
                      aria-pressed={isSelected}
                      disabled={!isTransferAllowed}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={cn(
                        'bg-background/70 hover:border-primary/60 hover:bg-muted/40 grid min-w-0 gap-1 rounded-md border p-3 text-left text-sm transition-colors',
                        !isTransferAllowed &&
                          'hover:border-border hover:bg-background/70 cursor-not-allowed opacity-60',
                        isSelected && 'border-primary bg-primary/10'
                      )}
                    >
                      <span className='font-extrabold break-words'>
                        {member.firstName} {member.lastAndMiddleNames}
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        Matriculation: {member.memberMatriculationNumber} · Present sponsor: {member.sponsorCode}
                      </span>
                      {!isTransferAllowed ? (
                        <span className='text-xs font-semibold text-red-700 dark:text-red-300'>
                          Transfer is not allowed on non-vested members.
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )}
            {hiddenMatchCount > 0 ? (
              <p className='text-muted-foreground text-xs'>
                Showing first {maxVisibleMembers} matches. Keep typing to narrow the search.
              </p>
            ) : null}
          </div>

          <div className='bg-muted/30 grid gap-2 rounded-md border p-3 sm:grid-cols-2'>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Selected loved one</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember
                  ? `${selectedMember.firstName} ${selectedMember.lastAndMiddleNames}`
                  : 'Select a loved one'}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Present sponsor code</p>
              <p className='mt-1 font-extrabold break-words'>{selectedMember ? selectedMember.sponsorCode : 'N/A'}</p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Receiving sponsor code</p>
              <p className='mt-1 font-extrabold break-words'>{receivingSponsorCode}</p>
            </div>
          </div>

          <SubmitButton text='Send release request' className='h-9 w-full text-sm normal-case sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default MemberTransferRequestForm
