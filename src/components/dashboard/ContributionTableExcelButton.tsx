'use client'

import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

import type {
  PublishedContributionDeathRow,
  PublishedContributionGroupRow
} from '@/components/dashboard/PublishedContributionTables'
import { Button } from '@/components/ui/button'

const currencyCellFormat = '$#,##0.00;[Red]-$#,##0.00'

type ExcelColumn<T> = {
  currency?: boolean
  header: string
  value: (row: T) => number | string
  width: number
}

const deathColumns: ExcelColumn<PublishedContributionDeathRow>[] = [
  { header: 'Matriculation', value: row => row.memberMatriculationNumber, width: 16 },
  { header: 'First Name', value: row => row.firstName, width: 20 },
  { header: 'Last Name', value: row => row.lastAndMiddleNames, width: 26 },
  { header: 'Registration Date', value: row => row.registrationDate, width: 18 },
  { header: 'Date of Death', value: row => row.dateOfDeath, width: 16 },
  { header: 'Sponsor Code', value: row => row.sponsorCode, width: 14 },
  { header: 'Sponsor Name', value: row => row.sponsorName, width: 26 },
  { currency: true, header: 'Amount to Contribute', value: row => row.amountToContribute, width: 20 },
  { header: 'Death Certificate', value: row => (row.deathCertificate ? 'Yes' : 'No'), width: 16 },
  { header: 'Deceased Picture', value: row => (row.deceasedPicture ? 'Yes' : 'No'), width: 16 }
]

const getGroupColumns = (addedMonthYearLabel: string): ExcelColumn<PublishedContributionGroupRow>[] => [
  { header: 'Sponsor Code', value: row => row.sponsorCode, width: 14 },
  { header: 'Sponsor Name', value: row => row.sponsorName, width: 26 },
  { header: 'Vested Loved Ones', value: row => row.vestedMembersCount, width: 18 },
  { currency: true, header: 'Account Before Contribution', value: row => row.accountBeforeContribution, width: 26 },
  { currency: true, header: 'Amount Owed', value: row => row.amountOwed, width: 16 },
  {
    currency: true,
    header: `Amount Added ${addedMonthYearLabel}`,
    value: row => row.amountAddedThisMonth,
    width: 22
  },
  { currency: true, header: 'Account After Contribution', value: row => row.accountAfterContribution, width: 26 }
]

const buildWorksheet = <T,>(rows: T[], columns: ExcelColumn<T>[]) => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    columns.map(column => column.header),
    ...rows.map(row => columns.map(column => column.value(row)))
  ])

  worksheet['!cols'] = columns.map(column => ({ wch: column.width }))

  columns.forEach((column, columnIndex) => {
    if (!column.currency) return

    rows.forEach((_, rowIndex) => {
      const cell = worksheet[XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex + 1 })]

      if (cell) cell.z = currencyCellFormat
    })
  })

  return worksheet
}

const getSafeFileName = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

type ContributionTableExcelButtonProps = {
  addedMonthYearLabel: string
  deaths: PublishedContributionDeathRow[]
  groups: PublishedContributionGroupRow[]
  tableLabel: string
}

const ContributionTableExcelButton = ({
  addedMonthYearLabel,
  deaths,
  groups,
  tableLabel
}: ContributionTableExcelButtonProps) => {
  const handleExport = () => {
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, buildWorksheet(deaths, deathColumns), 'Deceased Loved Ones')
    XLSX.utils.book_append_sheet(workbook, buildWorksheet(groups, getGroupColumns(addedMonthYearLabel)), 'Sponsors')
    XLSX.writeFile(workbook, `${getSafeFileName(tableLabel) || 'contribution-table'}.xlsx`)
  }

  return (
    <Button
      type='button'
      variant='outline'
      className='w-fit print:hidden'
      onClick={handleExport}
      disabled={deaths.length === 0 && groups.length === 0}
    >
      <FileSpreadsheet />
      Export Excel
    </Button>
  )
}

export default ContributionTableExcelButton
