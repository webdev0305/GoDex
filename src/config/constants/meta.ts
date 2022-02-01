import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'GoDex',
  description:
    'The most popular AMM on BSC by user count! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by GoDex), NFTs, and more, on a platform you can trust.',
  image: 'https://pancakeswap.finance/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else if (path.startsWith('/nfts/collections')) {
    basePath = '/nfts/collections'
  } else if (path.startsWith('/nfts/profile')) {
    basePath = '/nfts/profile'
  } else if (path.startsWith('/pancake-squad')) {
    basePath = '/pancake-squad'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('GoDex')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('GoDex')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('GoDex')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('GoDex')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('GoDex')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('GoDex')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('GoDex')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('GoDex')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('GoDex')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('GoDex')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('GoDex')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('GoDex')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('GoDex')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('GoDex')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('GoDex')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('GoDex')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('GoDex')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('GoDex')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('GoDex Info & Analytics')}`,
        description: 'View statistics for GoDex exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('GoDex Info & Analytics')}`,
        description: 'View statistics for GoDex exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Tokens')} | ${t('GoDex Info & Analytics')}`,
        description: 'View statistics for GoDex exchanges.',
      }
    case '/nfts':
      return {
        title: `${t('Overview')} | ${t('GoDex')}`,
      }
    case '/nfts/collections':
      return {
        title: `${t('Collections')} | ${t('GoDex')}`,
      }
    case '/nfts/profile':
      return {
        title: `${t('Your Profile')} | ${t('GoDex')}`,
      }
    case '/pancake-squad':
      return {
        title: `${t('Pancake Squad')} | ${t('GoDex')}`,
      }
    default:
      return null
  }
}
