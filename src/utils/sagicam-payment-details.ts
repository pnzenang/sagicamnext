export const sagicamBusinessName = 'Active Solidarity Ltd'
export const sagicamZelleEmail = 'info@sagiusa.org'

export const sagicamZellePaymentUrl =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQUNUSVZFIFNPTElEQVJJVFkgTFREIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiaW5mb0BzYWdpdXNhLm9yZyJ9'

export const sagicamZelleQrCodeUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'

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

export const getPaymentCenterMethodHref = (paymentType: PaymentCenterType, paymentMethod: PaymentCenterMethod) =>
  `/payment-center/${paymentType}/${paymentMethod}`
