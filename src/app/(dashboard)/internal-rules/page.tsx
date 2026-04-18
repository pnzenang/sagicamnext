'use client'
import {
  BriefcaseBusinessIcon,
  FolderPen,
  BookCheck,
  Cross,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  ArrowLeftRight
} from 'lucide-react'

import FAQ from '@/components/shadcn-studio/blocks/faq-component-08/faq-component-08-bis'
// import { fetchProfile } from '@/utils/actions'

const tabsData = [
  {
    value: 'section1',
    label: 'SECTION 1: PREAMBLE',
    icon: BookCheck,
    faqs: [
      {
        question: '1.1. PURPOSE OF INTERNAL RULES & REGULATIONS',
        answer:
          "The purpose of these Internal Rules & Regulations is to ensure the efficient operation and proper functioning of the organization. These rules provide guidelines for maintaining the organization's vision, fostering a close and supportive relationship between the bureau/board and the delegates, resolving ambiguities, facilitating daily activities, and improving the management of the bureau/board. These Internal Rules & Regulations shall effectively serve as the Bylaws of this organization."
      },
      {
        question: '1.2. LIVING DOCUMENT',
        answer:
          'These Internal Rules & Regulations shall serve as a dynamic document for the organization’s officers, presidents of associations, and delegates. This is a comprehensive set of rules that every association/member is expected to adhere to. The Internal Rules & Regulations shall be made available to every SAGICAM sponsor of the organization through the website or provided via electronic mail.. '
      },
      {
        question: '1.3 SAGICAM',
        answer:
          'SAGICAM is a SAGI database comprising individuals residing in Cameroon, who will receive direct support from individuals who have registered them as family members for protection in the event of their demise.. '
      },
      {
        question: '1.4. SPONSOR',
        answer:
          'A sponsor is an individual residing in the United States who anticipates the need to intervene should a loved one living in Cameroon pass away, and who has taken the necessary steps to register them in SAGICAM to ensure participation in the mutual aid program organized among SAGICAM members.'
      },
      {
        question: '1.5 MEMBER',

        answer:
          'A member is the loved one of any sponsor, residing in Cameroon, and registered in the SAGICAM database.'
      }
    ]
  },
  {
    value: 'section2',
    label: 'SECTION 2: MISSION AND OBJECTIVE',
    icon: BookCheck,
    faqs: [
      {
        question: '2.1 What are the mission and objective of SAGICAM?',
        answer:
          'SAGICAM is a mutual aid program of SAGI, aiming to establish a network of individuals residing in Cameroon, supported by sponsors living or represented in the USA, who have registered loved ones for the purpose of mutual assistance.'
      },
      {
        question: '2.1 How does SAGICAM works?',
        answer:
          'In the event of the passing of a sponsor’s loved one in Cameroon, SAGICAM will verify the authenticity of the death and collect funds (donations) from fellow sponsors to assist the bereaved sponsor.'
      }
    ]
  },
  {
    value: 'section3',
    label: 'SECTION 3: OFFICERS',
    icon: BookCheck,
    faqs: [
      {
        question: 'How does SAGICAM operates?',
        answer:
          'SAGICAM is administered by SAGI Designated Officers who are responsible for registering sponsors and members, verifying the veracity of deaths of members occurring in Cameroon, and collecting funds for the bereaved sponsor(s).'
      }
    ]
  },
  {
    value: 'section4',
    label: 'SECTION 4: MONTHLY ASSEMBLY',
    icon: BookCheck,
    faqs: [
      {
        question: 'How Often do SAGICAM gather every month?',
        answer:
          'SAGICAM organizes monthly Assemblies to consult with sponsors regarding the effective functioning of the mutual aid program.'
      }
    ]
  },
  {
    value: 'section5',
    label: 'SECTION 5: BUREAU/BOARD MEETING',
    icon: BookCheck,
    faqs: [
      {
        question: 'How often does SAGICAM Meet?',
        answer:
          'The SAGICAM Bureau/Board convenes periodically for reviews, ensuring that the organization operates in a manner consistent with SAGICAM’s mission and objectives.'
      }
    ]
  },
  {
    value: 'section6',
    label: 'SECTION 6: EXTRAORDINARY BUREAU MEETING',
    icon: BookCheck,
    faqs: [
      {
        question: 'what is SAGICAM Pasture when a loved one pass away?',
        answer:
          'The SAGICAM Bureau/Board automatically convenes following the announcement of a SAGICAM member’s death for the purpose of organizing contributions.'
      }
    ]
  },
  {
    value: 'section7 ',
    label: 'SECTION 7: SPONSORSHIP',
    icon: BookCheck,
    faqs: [
      {
        question: 'How does sponsorship work in SAGICAM?',
        answer:
          'Sponsorship in SAGICAM is offered freely and voluntarily; however, only individuals residing or represented in the USA may sponsor loved ones living in Cameroon. All sponsors must adhere to SAGICAM’s rules and regulations. Sponsors will receive contributions in the event of the death of their loved ones. To qualify as a sponsor, an individual must reside or be represented in the USA.'
      }
    ]
  },
  {
    value: 'section8',
    label: 'SECTION 8: MATRICULATION',
    icon: BookCheck,
    faqs: [
      {
        question: '8.1 Matriculation and waiting period',
        answer:
          'Loved ones or members receive a matriculation number upon registration but are often vested  after a minimum 60-day waiting period. If the loved one passes away before he or she is vested  no contribution will be provided.'
      },
      {
        question: '8.2 Members matriculated by more that 1 sponsor',
        answer:
          'No loved one may possess two matriculation numbers, and it is the responsibility of each sponsor to ensure that their loved one is not registered more than once.'
      },
      {
        question: '8.3 Returning Members',
        answer:
          'Any loved one who was previously a SAGICAM member may be reinstated after remitting all missed contributions, in addition to a return fee, and observing a waiting period of ninety (90) days after SAGICAM receives the return fee payment..'
      },
      {
        question: '8.4 Loved ones Names and date of birth',
        answer:
          'Names and dates of birth of loved ones must be provided precisely as they appear on official documents and without abbreviations. Name changes for deceased individuals are not accepted after the death announcement..'
      }
    ]
  },
  {
    value: 'section9',
    label: 'SECTION 9: MEMBERSHIP',
    icon: BookCheck,
    faqs: [
      {
        question: 'Membership Acquisition',
        answer:
          'Upon creating an account, the sponsor may proceed with the registration of their loved ones. But the loved is vested only after a minimum of 60 days waiting period and after SAGICAM bureau received the members registration fee and the anticipated contribution'
      }
    ]
  },
  {
    value: 'section10',
    label: 'SECTION 10: MEMBER UPDATES',

    icon: BookCheck,
    faqs: [
      {
        question: '10.1 ADDITION AND REMOVAL',
        answer:
          'The addition and removal of loved ones are directly managed by the sponsor through their dashboard at www.sagicam.org..'
      },
      {
        question: '10.2. ADJUSTMENT FROM SAGI TO SAGICAM AND VICE VERSA',
        answer:
          'If a SAGICAM member relocates to the USA, they may be transferred to the SAGI database without a fee, but their membership with SAGI will be subject to the waiting period. If a SAGI member relocates to Cameroon, they may be transferred to the SAGICAM database without a fee, but their membership with SAGI will be subject to the waiting period.'
      },
      {
        question: '10.3. NAME CORRECTION, TRANSFER AND CONTACT',

        answer:
          'All requests for name corrections, transfers, and contact information changes must be submitted via the sponsor dashboard. Name corrections must be performed while the loved ones are still alive.'
      }
    ]
  },
  {
    value: 'section11',
    label: 'SECTION 11: RETURNING MEMBERS',

    icon: BookCheck,
    faqs: [
      {
        question: 'Returning Process',
        answer:
          'Returning members must remit all missed contributions, in addition to the returning fee, and observe a waiting period of sixty (60) days after SAGI’s receipt of the return fee payment and missed contributions.'
      }
    ]
  },
  {
    value: 'section12',
    label: 'SECTION 12: FRAUD',

    icon: BookCheck,
    faqs: [
      {
        question: '12.1. WHAT IS FRAUD?',

        answer:
          'Fraud includes, but is not limited to:A member possessing a SAGICAM matriculation number and not residing in Cameroon.Any falsified document.Any false statement.'
      },
      {
        question: '12.2. SANCTIONS',
        answer:
          'When fraud is suspected, the SAGICAM Bureau/Board may consider administering a caution or a penalty. The decision to impose a penalty will depend on individual circumstances.If the offense is deemed to disrupt or destabilize the organization, the offender’s membership will be terminated.If fraud is detected, the individual and/or member association responsible for the offense will be excluded from SAGI.'
      }
    ]
  },
  {
    value: 'section13',
    label: 'SECTION 13: LITIGATION',

    icon: BookCheck,
    faqs: [
      {
        question: '15.1. EXCLUSIVE FORUM PROVISION',
        answer:
          'The headquarters of SAGI are situated in Montgomery County, Maryland. Unless SAGI provides written consent for an alternative forum, the sole and exclusive forum for:(i) any derivative action or proceeding brought on behalf of SAGI,(ii) any action asserting a claim of breach of fiduciary duty owed by any director or officer of SAGI to the Organization or the Organization’s members (which are exclusively associations),(iii) any action asserting a claim against SAGI or any director or officer of SAGI arising pursuant to any provision of Maryland Law or the Certificate of Incorporation or these By-Laws (in each case, as they may be amended from time to time), or(iv) any action asserting a claim against SAGI or any director or officer of SAGI governed by the internal affairs doctrine, shall be the Circuit Court for Montgomery County (or if the Circuit Court for Montgomery County lacks subject matter jurisdiction, the federal district court for the District of Maryland).'
      },
      {
        question: '15.2. CLAIMS',
        answer:
          'Only sponsors or representatives of sponsors of loved ones are permitted to claim contributions for the death of a loved one or possess the right to an accounting and to challenge in court or through the general assembly.'
      },
      {
        question: '15.3. ATTORNEY FEES',
        answer:
          'In any litigation, arbitration, or other proceedings in which SAGI is the prevailing party, SAGI shall recover from the non-prevailing party its reasonable attorneys fees incurred.'
      }
    ]
  },
  {
    value: 'section15',
    label: 'SECTION 15: DEATH OF A MEMBER',

    icon: BookCheck,
    faqs: [
      {
        question: '15.1. DEATH ANNOUNCEMENT',
        answer:
          'The death is to be announced on the sponsor dashboard  with the  NB. No documentation is required when reporting the death to SAGICAM.'
      },
      {
        question: '15.2. CONTRIBUTION AMOUNTS',
        answer:
          'The contribution amount is contingent upon the timeliness of the death announcement to SAGICAM and the duration of the loved one’s enrollment in the SAGICAM database, as stipulated in the table below'
      },
      {
        question: '15.3 The member was not vested',

        answer: 'there will be no contribution if the member was not vested.'
      },
      {
        question:
          '15.4 The Member has a longevity of less than 6 month and the death announced with 10 days of the member passing',
        answer: 'SAGICAM will contribute $1000'
      },
      {
        question:
          '15.5 The Member has a longevity of  6 months  or more but less than a year and the death announced with 10 days of the member passing',
        answer: 'SAGICAM will contribute $2000'
      },
      {
        question:
          '15.6 The Member has a longevity of  12 months  or more  and the death announced with 10 days  of the member passing',
        answer: 'SAGICAM will contribute $6000'
      },
      {
        question:
          '15.7 The Member is vested but the death was announced more that 10 days and less than 31 days after the person passes',
        answer:
          'SAGICAM will contribute $500 if the member has a longevity of less than 1 year and $1000 if the member has a longevity of 1 year or more '
      },
      {
        question: '15.8 The death was announced after 30 days of the member passing',
        answer: 'SAGICAM will not contribute '
      },
      {
        question: '15.9. REQUIRED DOCUMENTATION ',
        answer:
          'Death certificate (Cause of death may be redacted)-SAGICAM Matriculation Number-Picture of the deceased-Government Picture ID-Evidence that the loved one and the sponsor are in good standing with SAGICAM (i.e., no outstanding unpaid invoices).Detailed address of the family’s location where the death occurred.'
      },
      {
        question: '15.10. CONTRIBUTION PROCESS ',
        answer:
          'One contribution is made each month, encompassing all verified deaths that occurred prior to the contribution. The amount to be contributed is divided among all active members at the time of contribution.'
      },
      {
        question: '15.11 CONTRIBUTED FUNDS ',
        answer:
          'To prevent undue delay in the bereaved sponsor receiving their contribution, SAGICAM mandates all members to remit an anticipated contribution, ensuring that funds are consistently available upon death verification.'
      },
      {
        question: '15.12. ADMINISTRATIVE FORMALITIES ',
        answer:
          'SAGICAM does not handle paperwork; this responsibility falls to the sponsor concerned with the death. Consequently, SAGICAM does not retain any documents pertaining to deaths  '
      },
      {
        question: '15.13. NOT ELIGIBLE FOR CONTRIBUTION ',
        answer:
          'Deaths are not eligible for contributions under the following circumstances:  => a. The individual died within the waiting period before a matriculation number could be assigned. => b. The Sponsor or the loved one is NOT IN GOOD STANDING due to non-contribution or non-payment of any SAGI fees => c. The name on the individual’s death certificate differs from the name in SAGICAM’s database. =>d. The death was announced more than 30 days after the sponsor’s passing.'
      },

      {
        question: '15.14. CONTRIBUTION MODES',

        answer:
          'Contributions may be made through any of the following methods:Bank deposit/transfer into one of SAGI’s bank accounts, details of which are provided with the contribution list. Online application using SAGI’s email: info@sagiusa.org and name: Active Solidarity Ltd.'
      },
      {
        question: '15.15. CONTRIBUTION FORMALITIES',

        answer:
          'Bank deposits must precisely match the amount appearing on the contribution list. It is crucial not to disregard cents, as this corresponds to the association bank code. The deposit receipt must be sent via email after any deposit into SAGI accounts.'
      },
      {
        question: '15.16 SAGICAM TESTIMONY',

        answer:
          'Each bereaved sponsor anticipating a contribution from SAGICAM is encouraged to offer a brief testimony to SAGI during a Farewell ceremony (Celebration of life) organized for '
      }
    ]
  },
  {
    value: 'section16',
    label: 'SECTION 16. DISBURSEMENT',

    icon: BookCheck,
    faqs: [
      {
        question: 'SAGICAM OBLIGATION',
        answer: 'SAGICAM shall disburse the amount collected in section 15 above to assist the bereaved sponsor. '
      }
    ]
  },
  {
    value: 'section17',
    label: 'SECTION 17: PENALTIES',

    icon: BookCheck,
    faqs: [
      {
        question: '17.1 RETURNING FEE',
        answer:
          'All returning members must pay a returning fee penalty of $150.00 in addition to any missed contributions.'
      },
      {
        question: '17.2 LATE FEE',
        answer:
          'Any sponsor failing to honor their contribution (donation) by the due date will incur a late fee of $100.00 and will not be part of the next contribution until he or she takes care of the missing contribution and late fee.'
      },
      {
        question: '17.3 EXCLUSION',
        answer:
          'Any sponsor failing to pay their contribution (including late fees) 24 hours after the due date may be excluded from the next contribution and may be removed from SAGI.'
      }
    ]
  },
  {
    value: 'section18',
    label: 'SECTION 18: SAGICAM FEES',

    icon: BookCheck,
    faqs: [
      {
        question: '18.1. ADMINISTRATION FEES?',
        answer:
          'Every individual belonging to a member association of SAGI must pay an administration fee equivalent to $2.00 per month, due at the time of contribution.'
      },

      {
        question: '18.2. MATRICULATION FEES',
        answer: 'YEvery new loved one must make a one-time payment of $10.'
      },
      {
        question: '18.3. ANTICIPATED CONTRIBUTION',
        answer: 'Upon registration, each member should send an anticipated contribution of $30.'
      }
    ]
  },
  {
    value: 'section19',
    label: 'SECTION 19: AMENDMENTS TO THE INTERNAL RULES & REGULATIONS.',

    icon: BookCheck,
    faqs: [
      {
        question:
          'SAGICAM Internal Rules & Regulations may be amended and modified by a majority vote of the Bureau/Board. The Internal Rules & Regulations are established by the members of the, SAGICAM Bureau/Board and the SPONSORS present during meetings convened for amendments.',
        answer: ''
      }
    ]
  }
]

const FAQPage = () => {
  // const user = await fetchProfile()
  return <FAQ tabsData={tabsData} />
}

export default FAQPage
