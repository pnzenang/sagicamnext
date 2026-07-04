const sagicamLogoUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775889433/sagicam_bkoygk.svg'

export const authAppearance = {
  layout: {
    logoImageUrl: sagicamLogoUrl
  },
  elements: {
    card: "[&_a[href*='clerk.com']]:hidden",
    cardBox: 'shadow-none',
    footerPages: 'hidden',
    logoBox: 'mx-auto mb-4 flex justify-center',
    logoImage: 'h-16 w-auto object-contain',
    rootBox: 'mx-auto'
  }
}
