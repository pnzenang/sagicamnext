import day from 'dayjs'

import { registrationPaymentDeadlineDays } from '@/utils/registration-payment-deadline'
import type { MemberType } from '@/utils/types'

const registrationDuesColumn = `Registration Dues (${registrationPaymentDeadlineDays} days)` as const

export const memberTableExportColumns = [
  'Code',
  'Matriculation',
  'Last Names',
  'First Name',
  'Longevity(Days)',
  'Recommendation',
  'Status',
  registrationDuesColumn
] as const

export type MemberTableExportRow = Record<(typeof memberTableExportColumns)[number], number | string>

export const memberTableWorksheetColumnWidths = [
  { wch: 14 },
  { wch: 18 },
  { wch: 24 },
  { wch: 18 },
  { wch: 14 },
  { wch: 18 },
  { wch: 18 },
  { wch: 28 }
]

const getTextValue = (value: unknown) => (value == null ? '' : String(value))

export const getMemberTableExportRow = ({
  member,
  recommendation,
  registrationDues
}: {
  member: MemberType
  recommendation: unknown
  registrationDues: string
}): MemberTableExportRow => ({
  Code: member.sponsorCode,
  Matriculation: member.memberMatriculationNumber,
  'Last Names': member.lastAndMiddleNames,
  'First Name': member.firstName,
  'Longevity(Days)': day(Date.now()).diff(day(member.createdAt), 'days'),
  Recommendation: getTextValue(recommendation),
  Status: member.memberStatus,
  [registrationDuesColumn]: registrationDues
})

const escapeHtml = (value: number | string) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const getMemberTablePrintableDocument = ({
  generatedAt,
  rows,
  title
}: {
  generatedAt: string
  rows: MemberTableExportRow[]
  title: string
}) => {
  const headerCells = memberTableExportColumns.map(column => `<th>${escapeHtml(column)}</th>`).join('')

  const bodyRows = rows
    .map(
      row => `
        <tr>
          ${memberTableExportColumns.map(column => `<td>${escapeHtml(row[column])}</td>`).join('')}
        </tr>
      `
    )
    .join('')

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: landscape; margin: 0.45in; }
          * { box-sizing: border-box; }
          body { color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 10px; margin: 0; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          p { margin: 0 0 14px; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          th, td { border: 1px solid #d1d5db; padding: 6px 7px; text-align: left; vertical-align: top; word-break: break-word; }
          th { background: #e5e7eb; font-weight: 700; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .meta { color: #4b5563; font-size: 10px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">${rows.length} loved one${rows.length === 1 ? '' : 's'} | Generated ${escapeHtml(
          generatedAt
        )}</p>
        <table>
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>`
}
