import { Resend } from 'resend'

type LovedOneConfirmationEmailInput = {
  sponsorEmail: string
  sponsorFirstName: string
  lovedOneFirstName: string
  lovedOneLastAndMiddleNames: string
  dateOfBirth: string
  sponsorCode: string
  memberMatriculationNumber: string
}

type LovedOneRemovalConfirmationEmailInput = {
  sponsorEmail: string
  sponsorFirstName: string
  lovedOneFirstName: string
  lovedOneLastAndMiddleNames: string
  dateOfBirth: string
  sponsorCode: string
  memberMatriculationNumber: string
  reasonForLeaving: string
}

type DeathAnnouncementConfirmationEmailInput = {
  sponsorEmail: string
  sponsorFirstName: string
  lovedOneFirstName: string
  lovedOneLastAndMiddleNames: string
  dateOfDeath: string
  placeOfDeath: string
  sponsorCode: string
  memberMatriculationNumber: string
  contributionStatus: string
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const createLovedOneConfirmationHtml = ({
  sponsorFirstName,
  lovedOneFirstName,
  lovedOneLastAndMiddleNames,
  dateOfBirth,
  sponsorCode,
  memberMatriculationNumber
}: LovedOneConfirmationEmailInput) => {
  const lovedOneName = `${escapeHtml(lovedOneFirstName)} ${escapeHtml(lovedOneLastAndMiddleNames)}`

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 640px;">
      <p>Hello ${escapeHtml(sponsorFirstName)},</p>
      <p>
        This email confirms that you added <strong>${lovedOneName}</strong> as a loved one in SAGICAM.
      </p>
      <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Matriculation number</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(memberMatriculationNumber)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Date of birth</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(dateOfBirth)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Sponsor code</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(sponsorCode)}</td>
        </tr>
      </table>
      <p>
        Please remember to send and record the registration payment and anticipated contribution totaling $40 from the Registration Payments
        section of your sponsor dashboard.
      </p>
      <p>Thank you,<br />SAGICAM</p>
    </div>
  `
}

const createLovedOneRemovalConfirmationHtml = ({
  sponsorFirstName,
  lovedOneFirstName,
  lovedOneLastAndMiddleNames,
  dateOfBirth,
  sponsorCode,
  memberMatriculationNumber,
  reasonForLeaving
}: LovedOneRemovalConfirmationEmailInput) => {
  const lovedOneName = `${escapeHtml(lovedOneFirstName)} ${escapeHtml(lovedOneLastAndMiddleNames)}`

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 640px;">
      <p>Hello ${escapeHtml(sponsorFirstName)},</p>
      <p>
        This email confirms that <strong>${lovedOneName}</strong> has been removed from your SAGICAM loved ones list.
      </p>
      <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Matriculation number</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(memberMatriculationNumber)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Date of birth</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(dateOfBirth)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Sponsor code</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(sponsorCode)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Reason</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(reasonForLeaving)}</td>
        </tr>
      </table>
      <p>If this removal was made in error, please contact SAGICAM support.</p>
      <p>Thank you,<br />SAGICAM</p>
    </div>
  `
}

const createDeathAnnouncementConfirmationHtml = ({
  sponsorFirstName,
  lovedOneFirstName,
  lovedOneLastAndMiddleNames,
  dateOfDeath,
  placeOfDeath,
  sponsorCode,
  memberMatriculationNumber,
  contributionStatus
}: DeathAnnouncementConfirmationEmailInput) => {
  const lovedOneName = `${escapeHtml(lovedOneFirstName)} ${escapeHtml(lovedOneLastAndMiddleNames)}`

  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 640px;">
      <p>Hello ${escapeHtml(sponsorFirstName)},</p>
      <p>
        This email confirms that the death of <strong>${lovedOneName}</strong> has been announced in SAGICAM.
      </p>
      <table style="border-collapse: collapse; margin: 24px 0; width: 100%;">
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Matriculation number</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(memberMatriculationNumber)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Date of death</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(dateOfDeath)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Place of death</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(placeOfDeath)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Sponsor code</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(sponsorCode)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 10px; font-weight: bold;">Contribution status</td>
          <td style="border: 1px solid #e5e7eb; padding: 10px;">${escapeHtml(contributionStatus)}</td>
        </tr>
      </table>
      <p>SAGICAM will review the announcement and follow the regular contribution process.</p>
      <p>Thank you,<br />SAGICAM</p>
    </div>
  `
}

const sendTransactionalEmail = async ({
  html,
  subject,
  to
}: {
  html: string
  subject: string
  to: string
}) => {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    console.warn('Skipping confirmation email because RESEND_API_KEY or RESEND_FROM_EMAIL is missing.')

    return
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html
    })

    if (!error) return

    console.error('Failed to send confirmation email:', error)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
}

export const sendLovedOneConfirmationEmail = async (input: LovedOneConfirmationEmailInput) => {
  const lovedOneName = `${input.lovedOneFirstName} ${input.lovedOneLastAndMiddleNames}`

  await sendTransactionalEmail({
    to: input.sponsorEmail,
    subject: `SAGICAM loved one added: ${lovedOneName}`,
    html: createLovedOneConfirmationHtml(input)
  })
}

export const sendLovedOneRemovalConfirmationEmail = async (input: LovedOneRemovalConfirmationEmailInput) => {
  const lovedOneName = `${input.lovedOneFirstName} ${input.lovedOneLastAndMiddleNames}`

  await sendTransactionalEmail({
    to: input.sponsorEmail,
    subject: `SAGICAM loved one removed: ${lovedOneName}`,
    html: createLovedOneRemovalConfirmationHtml(input)
  })
}

export const sendDeathAnnouncementConfirmationEmail = async (input: DeathAnnouncementConfirmationEmailInput) => {
  const lovedOneName = `${input.lovedOneFirstName} ${input.lovedOneLastAndMiddleNames}`

  await sendTransactionalEmail({
    to: input.sponsorEmail,
    subject: `SAGICAM death announcement received: ${lovedOneName}`,
    html: createDeathAnnouncementConfirmationHtml(input)
  })
}
