import { FooterLinkType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: t('Trading'),
    items: [
      {
        label: t('Forum'),
        href: 'https://docs.godex.exchange/contact-us',
      },
      {
        label: t('Voting'),
        href: 'https://docs.godex.exchang/brand',
      },
      {
        label: t('Announcements'),
        href: 'https://medium.com/goswap',
      },
    ],
  },
  {
    label: t('About US'),
    items: [
      {
        label: t('Documents'),
        href: 'https://docs.godex.exchang/contact-us',
      },
      {
        label: t('Go Token'),
        href: 'https://docs.godex.exchang/brand',
      },
      {
        label: t('Whitepaper'),
        href: 'https://medium.com/goswap',
      },
      {
        label: t('Roadmap'),
        href: 'https://docs.godex.exchang/contact-us/telegram',
      },
    ],
  },
  {
    label: t('Support'),
    items: [
      {
        label: t('Help Center'),
        href: 'https://docs.godex.exchang/contact-us/customer-support',
      },
      {
        label: t('Contact Us'),
        href: 'https://docs.godex.exchang/help/troubleshooting',
      },
    ],
  },
  {
    label: t('Pages'),
    items: [
      {
        label: 'Exchange',
        href: 'https://github.com/goswap',
      },
      {
        label: t('Farming'),
        href: 'https://docs.godex.exchang',
      },
      {
        label: t('Staking'),
        href: 'https://app.gitbook.com/@goswap-1/s/goswap/code/bug-bounty',
      },
      {
        label: t('Liquidity'),
        href: 'https://docs.godex.exchang/help/faq#is-goswap-safe-has-goswap-been-audited',
      },
    ],
  },
  {
    label: t('Blog'),
    items: [
      {
        label: t('News'),
        href: 'https://docs.godex.exchang',
      },
      {
        label: t('FAQ'),
        href: 'https://app.gitbook.com/@goswap-1/s/goswap/code/bug-bounty',
      },
    ],
  },
]
