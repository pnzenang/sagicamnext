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
  ArrowLeftRight,
  FileStack
} from 'lucide-react'

import FAQ from '@/components/shadcn-studio/blocks/faq-component-08/faq-component-08'

// import { fetchProfile } from '@/utils/actions'

const tabsData = [
  {
    value: 'general',
    label: 'General Information',
    icon: BriefcaseBusinessIcon,
    faqs: [
      {
        question: 'What types of information can be learned in this page?',
        answer:
          "Here you can learn about the various processes and requirements for managing your loved ones' accounts."
      },
      {
        question: 'How do I use the navigation instructions provided on this page?',
        answer: 'Making sure to keep the page as a resource page for future reference. '
      },
      {
        question: 'How up to date are the information on the navigation instructions?',
        answer: 'We make sure to keep the information up to date as per the latest updates. '
      }
    ]
  },
  {
    value: 'Internal-Rules',
    label: 'Internal Rules and Regulations',
    icon: BookCheck,
    faqs: [
      {
        question: 'Where is located SAGICAM internal rules and regulations?',
        answer:
          'You can find the SAGICAM internal rules and regulations on your dashboard by clicking  on the link "internal-rules" on the left sidebar.'
      }
    ]
  },
  {
    value: 'add-member',
    label: 'Add Member',
    icon: UserPlus,
    faqs: [
      {
        question: 'What happen if I make mistake while adding a loved one?',
        answer:
          'If the information entered is incorrect, you can edit it before submitting the addition. but if you realized after submission, and if you made a mistake on the names you can delete the member and add them again, but if the incorrect information is not a name you can change by clicking on the 3 dots in front of the name and choose the "View and Edit Member\'s Details" link.'
      },
      {
        question: 'Where can I see the 3 dots?',
        answer:
          'On the left sidebar, click on the "AllMembers" link, where you will see your member and the 3 dots next to each.'
      }
    ]
  },
  {
    value: 'all-members',
    label: 'All Members',
    icon: Users,
    faqs: [
      {
        question: 'What kind of information can I find about my members?',
        answer:
          'You can find detailed information about each of your members, including their personal details, account status, and more, you can see more information by clicking on the 3 dots next to each member.'
      },
      {
        question: 'I see the information, now what?',
        answer:
          "Your loved ones' information shows his or her Longevity in days, the Recommendation, and mostly the member status, the longevity tell you for how long the member has been registered, the status is pending for those who have not yet been approved, vested for those who have been approved."
      },
      {
        question: 'What can I do with those information?',
        answer:
          'You should decide to send your loved ones registration fees and anticipated contributions of your newly registered members, after 60 days, the loved ones might be removed from the system if their registration fees and anticipated contributions are not received.'
      },
      {
        question: 'What about the status?',
        answer:
          'The member status indicates their current standing in the system. It can be pending or vested but if the members start participating in the program only when they are vested is 60 days at least and their status is vested.'
      },
      {
        question: 'How can I remove a loved one?',
        answer:
          'If you decide to remove a member, you need to click on the 3 dots next to the member and select "Remove Member". but make sure to double-check before proceeding, because once removed, the member will be permanently deleted from your association and will only be able to rejoin after a new registration and payment of returning member fees, where they will need to start over.'
      },
      {
        question: 'How can I announce the death of a member?',
        answer:
          'The death announcement is made by clicking on the 3 dots next to the member and selecting "Announce Member\'s Death", once again it is recommended to double-check the information before submission as the process is irreversible.'
      }
    ]
  },
  {
    value: 'death-announcement',
    label: 'Death Announcement',
    icon: Cross,
    faqs: [
      {
        question: 'How do I announce the death of a member?',
        answer:
          'The death announcement is made by clicking on the "All Members" link in the sidebar and then on the 3 dots on the member  row and selecting "Announce Member\'s Death", once again it is recommended to double-check the information before submission as the process is irreversible..'
      },
      {
        question: 'Can I announce the death of a member by email?',
        answer:
          "We don't currently support email announcements for member deaths. Please use the online portal or contact our support team for assistance."
      },
      {
        question: 'Why do we have this process of announcing the death of a member?',
        answer:
          'By announcing the death of the member on the portal , we ensure that the information is accurately recorded and that the appropriate actions are taken to update their status and notify relevant parties that are all other sponsors.'
      },
      {
        question: 'How can I submit the necessary documentation?',
        answer:
          'You should submit the necessary documentation through the online portal by clicking on the "Death Documentations" link in the sidebar.'
      },

      {
        question: 'How can I check the status of the death contribution of a member?',
        answer:
          'After submitting the death, you can check the status by navigating to the "Deceased Members" and see the death contribution status.'
      }
    ]
  },
  {
    value: 'death-documentation',
    label: 'Death Documentation',
    icon: FileStack,
    faqs: [
      {
        question: 'What are the documents to upload for the death documentations?',
        answer: (
          <ul className='list-disc space-y-1 pl-5'>
            <li>The deceased death certificate</li>
            <li>A deceased picture ID</li>
            <li>A deceased photo</li>
            <li>The funeral program</li>
          </ul>
        )
      },
      {
        question: 'How can I check the status of the death contribution of a member?',
        answer:
          'After submitting the death, you can check the status by navigating to the "Deceased Members" and see the death contribution status.'
      }
    ]
  },
  {
    value: 'remove-member',
    label: 'Remove Member',
    icon: Trash2,
    faqs: [
      {
        question: 'How can I remove a loved one?',
        answer:
          'If you decide to remove a member, first click on the "All Members" link in the sidebar and then click on the 3 dots on  the member\'s row and select "Remove Member". but make sure to double-check before proceeding, because once removed, the member will be permanently deleted from your association and will only be able to rejoin after a new registration and payment of returning member fees, where they will need to start over.'
      },
      {
        question: 'Can the member be reinstated after removal?',
        answer:
          'Once a member is removed, they cannot be reinstated automatically. They would need to go through the registration process again if they wish to rejoin.'
      },
      {
        question: 'When can I remove a member?',
        answer:
          'You can remove a member at any time, but it is recommended to do so only when necessary and after careful consideration. Also the system will prevent you from removing members during the first 8 days of the month.'
      },
      {
        question: 'Can I remove a member by email?',
        answer:
          'Not currently supported, we want to ensure the security and accuracy of member count that we have been struggling with all the time.'
      },
      {
        question: "Why can\'t I remove a member during that time?",
        answer:
          'We prevent removals during the first 8 days of the month to ensure data integrity and allow sufficient time for any necessary reviews or corrections on the contribution chart. So if you need to remove a member, please do so before the 1st of the month or wait until the 9th day of the month to proceed with the removal process.'
      }
    ]
  },
  {
    value: 'transferring-member ',
    label: 'Transfer Member',
    icon: ArrowLeftRight,
    faqs: [
      {
        question: 'How can I transfer a member from one association to our own?',
        answer:
          'To transfer a member from one association to your own, you need to edit the member\'s information and update their their Delegate recommendation and select "Transfer_In". but it won\'t be effective until the association where the member will be going from does the same thing and select "Transfer_Out". The admin will them finish the process of transferring the member.'
      },
      {
        question: 'Is my act alone be enough to transfer a member?',
        answer:
          'No, the transfer process requires cooperation from both associations one will select "Transfer_In" and the other will select "Transfer_Out" the member willing to be transferred should help facilitate the process by talking to both associations\'s delegates.'
      },
      {
        question: 'How can I transfer a member from SAGI to my SAGICAM account?',
        answer:
          'To transfer a member from SAGI to your SAGICAM account, you need to follow the same process as transferring any member between but select "Transfer_From_SAGI" at the registration of time .'
      },
      {
        question: "Why can\'t I remove a member during that time?",
        answer:
          'We prevent removals during the first 8 days of the month to ensure data integrity and allow sufficient time for any necessary reviews or corrections on the contribution chart. So if you need to remove a member, please do so before the 1st of the month or wait until the 9th day of the month to proceed with the removal process.'
      }
    ]
  },
  {
    value: 'contribution-and-payment',
    label: 'Contribution and Payment',
    icon: Wallet,
    faqs: [
      {
        question: 'Are we changing the way we handle contributions and payments?',
        answer:
          'Not really, we just want to improve the user experience, you make your payment as usual but report it on the contribution a payment chart to avoid any discrepancies as before.'
      },
      {
        question: 'What type of contributions are we making?',
        answer: 'We are making monthly contributions and registration fees and anticipated contributions.'
      },
      {
        question: 'Where do we get the information for contributions?',
        answer:
          'The link to the contributions and payment chart is located on the left sidebar, you can click on the link "Contributions" to access the chart and report your contributions and payments .'
      }
    ]
  },
  {
    value: 'name-change-and-documentation',
    label: 'Name Change and Documentation',
    icon: FolderPen,
    faqs: [
      {
        question: 'How do I process a name change?',
        answer:
          'Please click on the "Name Change" link in the sidebar to access the SAGICAM Name Change Form and go from there.'
      },
      {
        question: 'What documentation do I need to upload for a name change?',
        answer:
          "If the name change is due to a legal document, you will need to upload the official name change document, but if it's due to a typo or error, you do not need to upload any documentation."
      },
      {
        question: 'Can the name change be processed without documentation?',
        answer:
          'Yes, if the name change is due to a typo or error, you do not need to upload any documentation. but if the name change is due to a legal document, you will need to upload the official name change document for the change to be processed.'
      },
      {
        question: 'Can I just upload the new ID card or passport for the name change documentation?',
        answer:
          "No, you must upload the official name change document for the change to be processed, we don't have a way to verify name changes through ID cards or passports alone, we don't the member's previous Id card."
      }
    ]
  }
]

const FAQPage = () => {
  // const user = await fetchProfile()
  return <FAQ tabsData={tabsData} />
}

export default FAQPage
