import { MenuItemsType, DropdownMenuItemType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
// import { nftsBaseUrl } from 'views/Nft/market/constants'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Home'),
    href: '/',
    showItemsOnMobile: false,
    icon: 'MenuHome'
  },
  {
    label: t('Exchange'),
    href: '/swap',
    showItemsOnMobile: false,
    icon: 'MenuExchange'
  },
  {
    label: t('Liquidity'),
    href: '/liquidity',
    showItemsOnMobile: false,
    icon: 'MenuLiquidity'
  },
  {
    label: t('Pools'),
    href: '/pools',
    showItemsOnMobile: false,
    icon: 'MenuPools'
  },
  {
    label: t('Farms'),
    href: '/farms',
    showItemsOnMobile: false,
    icon: 'MenuFarms'
  },
  {
    label: t('Document'),
    href: 'https://docs.godex.exchange',
    type: DropdownMenuItemType.EXTERNAL_LINK,
    showItemsOnMobile: true,
    icon: 'MenuDocument'
  },
  
]

export default config
