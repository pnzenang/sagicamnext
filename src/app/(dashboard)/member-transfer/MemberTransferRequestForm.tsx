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

type MemberTransferSponsorOption = {
  sponsorCode: string
  sponsorFirstName: string
  sponsorLastAndMiddleName: string
}

const maxVisibleMembers = 10

const getMemberNameSearchValue = (member: MemberTransferMemberOption) =>
  `${member.firstName} ${member.lastAndMiddleNames}`.toLowerCase()

const getSponsorLabel = (sponsor: MemberTransferSponsorOption) =>
  `${sponsor.sponsorCode} - ${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}`.trim()

const getSponsorSearchValue = (sponsor: MemberTransferSponsorOption) => getSponsorLabel(sponsor).toLowerCase()

const MemberTransferRequestForm = ({
  members,
  sponsors
}: {
  members: MemberTransferMemberOption[]
  sponsors: MemberTransferSponsorOption[]
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState('')
  const [selectedSponsorCode, setSelectedSponsorCode] = useState('')

  const selectedMember = useMemo(
    () => members.find(member => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )

  const selectedSponsor = useMemo(
    () => sponsors.find(sponsor => sponsor.sponsorCode === selectedSponsorCode) ?? null,
    [selectedSponsorCode, sponsors]
  )

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) return members

    return members.filter(member => getMemberNameSearchValue(member).includes(normalizedSearch))
  }, [members, searchQuery])

  const filteredSponsors = useMemo(() => {
    const normalizedSearch = sponsorSearchQuery.trim().toLowerCase()

    if (!normalizedSearch) return sponsors

    return sponsors.filter(sponsor => getSponsorSearchValue(sponsor).includes(normalizedSearch))
  }, [sponsorSearchQuery, sponsors])

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

  const handleSponsorSearchChange = (nextSearchQuery: string) => {
    setSponsorSearchQuery(nextSearchQuery)

    const selectedSponsorStillMatches =
      selectedSponsor && getSponsorSearchValue(selectedSponsor).includes(nextSearchQuery.trim().toLowerCase())

    if (!selectedSponsorStillMatches) {
      setSelectedSponsorCode('')
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
              Search by loved one name, select the receiving sponsor, and send the request for approval.
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
                placeholder='Search first, last, or middle name'
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
              <p className='text-muted-foreground rounded-md border bg-muted/30 p-3 text-sm'>
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
                        'grid min-w-0 gap-1 rounded-md border bg-background/70 p-3 text-left text-sm transition-colors hover:border-primary/60 hover:bg-muted/40',
                        !isTransferAllowed && 'cursor-not-allowed opacity-60 hover:border-border hover:bg-background/70',
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

          <div className='grid gap-2 rounded-md border bg-muted/30 p-3 sm:grid-cols-2'>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Current loved one</p>
              <p className='mt-1 font-extrabold break-words'>
                {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastAndMiddleNames}` : 'Select a loved one'}
              </p>
            </div>
            <div className='min-w-0'>
              <p className='text-muted-foreground text-xs font-semibold'>Present sponsor code</p>
              <p className='mt-1 font-extrabold break-words'>{selectedMember ? selectedMember.sponsorCode : 'N/A'}</p>
            </div>
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='receiving-sponsor-search'>Search receiving sponsors</Label>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id='receiving-sponsor-search'
                type='search'
                value={sponsorSearchQuery}
                onChange={event => handleSponsorSearchChange(event.target.value)}
                placeholder='Search sponsor name or code'
                className='pl-9'
              />
            </div>
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='receiving-sponsor-code'>Receiving sponsor</Label>
            <select
              id='receiving-sponsor-code'
              name='receivingSponsorCode'
              required
              value={selectedSponsorCode}
              onChange={event => setSelectedSponsorCode(event.target.value)}
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='' disabled>
                {filteredSponsors.length === 0 ? 'No matching sponsors' : 'Select receiving sponsor'}
              </option>
              {filteredSponsors.map(sponsor => (
                <option key={sponsor.sponsorCode} value={sponsor.sponsorCode}>
                  {getSponsorLabel(sponsor)}
                </option>
              ))}
            </select>
            <p className='text-muted-foreground text-xs'>
              {filteredSponsors.length} sponsor{filteredSponsors.length === 1 ? '' : 's'} found.
            </p>
          </div>

          <SubmitButton text='Send transfer request' className='h-9 w-full text-sm normal-case sm:w-fit' />
        </FormContainer>
      </CardContent>
    </Card>
  )
}

export default MemberTransferRequestForm
