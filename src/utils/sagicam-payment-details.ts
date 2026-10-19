export const sagicamBusinessName = 'Active Solidarity Ltd'
export const sagicamZelleEmail = 'info@sagiusa.org'

export const sagicamBankDetails = {
  accountNumber: '446008676977',
  bankName: 'BANK OF AMERICA',
  businessName: 'ACTIVE SOLIDARITY LTD',
  paperElectronicRoutingNumber: '052001633',
  wireRoutingNumber: '026009593'
} as const

export const getSagicamPaymentMemo = (sponsorCode: string) => `SAGICAM-${sponsorCode}`

export const paymentCenterTypes = ['contribution', 'registration'] as const
export type PaymentCenterType = (typeof paymentCenterTypes)[number]

export const paymentCenterMethods = ['zelle', 'bank-deposit'] as const
export type PaymentCenterMethod = (typeof paymentCenterMethods)[number]

export const isPaymentCenterType = (value: string): value is PaymentCenterType =>
  paymentCenterTypes.includes(value as PaymentCenterType)

export const isPaymentCenterMethod = (value: string): value is PaymentCenterMethod =>
  paymentCenterMethods.includes(value as PaymentCenterMethod)

const paymentTypeSegmentSuffix = '-payment'

export const parsePaymentCenterTypeSegment = (segment: string): PaymentCenterType | null => {
  if (!segment.endsWith(paymentTypeSegmentSuffix)) return null

  const paymentType = segment.slice(0, -paymentTypeSegmentSuffix.length)

  return isPaymentCenterType(paymentType) ? paymentType : null
}

export const getPaymentCenterMethodHref = (paymentType: PaymentCenterType, paymentMethod: PaymentCenterMethod) =>
  `/payment-center/${paymentType}${paymentTypeSegmentSuffix}/${paymentMethod}`
