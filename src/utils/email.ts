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
        Please remember to record the registration payment and anticipated contribution from the Registration Payments
        section of your sponsor dashboard.
      </p>
      <p>Thank you,<br />SAGICAM</p>
    </div>
  `
}

export const sendLovedOneConfirmationEmail = async (input: LovedOneConfirmationEmailInput) => {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    console.warn('Skipping loved one confirmation email because RESEND_API_KEY or RESEND_FROM_EMAIL is missing.')

    return
  }

  const resend = new Resend(apiKey)
  const lovedOneName = `${input.lovedOneFirstName} ${input.lovedOneLastAndMiddleNames}`

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: input.sponsorEmail,
      subject: `SAGICAM loved one added: ${lovedOneName}`,
      html: createLovedOneConfirmationHtml(input)
    })

    if (!error) return

    console.error('Failed to send loved one confirmation email:', error)
  } catch (error) {
    console.error('Failed to send loved one confirmation email:', error)
  }
}
