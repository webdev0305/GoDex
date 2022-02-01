import React from 'react'
import { useModal, ButtonMenuItem } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance, getBalanceNumber, formatNumber } from 'utils/formatBalance'
// import Balance from 'components/Balance'
import CollectModal from '../Modals/CollectModal'
import { useHarvestPool, useHarvestTime } from '../../../hooks/useHarvestPool'

interface HarvestActionsProps {
  earnings: BigNumber
  earningToken: Token
  sousId: number
  earningTokenPrice: number
  isBnbPool: boolean
  // isLoading?: boolean
}

const HarvestActions: React.FC<HarvestActionsProps> = ({
  earnings,
  earningToken,
  sousId,
  isBnbPool,
  earningTokenPrice,
  // isLoading = false,
}) => {
  const { t } = useTranslation()
  const earningTokenBalance = getBalanceNumber(earnings, earningToken.decimals)
  const formattedBalance = formatNumber(earningTokenBalance, 3, 3)

  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)

  const fullBalance = getFullDisplayBalance(earnings, earningToken.decimals)
  const hasEarnings = earnings.toNumber() > 0
  const isCompoundPool = sousId === 0

  const harvestTime = useHarvestTime(sousId)
  const [onPresentCollect] = useModal(
    <CollectModal
      formattedBalance={formattedBalance}
      fullBalance={fullBalance}
      earningToken={earningToken}
      earningsDollarValue={earningTokenDollarBalance}
      sousId={sousId}
      isBnbPool={isBnbPool}
      isCompoundPool={isCompoundPool}
    />,
  )

  return (
    <ButtonMenuItem disabled={!hasEarnings || !harvestTime} onClick={onPresentCollect}>
      {isCompoundPool ? t('Collect') : t('Harvest')}
      <svg xmlns="http://www.w3.org/2000/svg" width="20.227" height="20.227" viewBox="0 0 20.227 20.227" style={{marginLeft:'8px'}}>
        <g transform="translate(-2.25 -2.25)">
          <path d="M20.981,18v9.363H6V18" transform="translate(-1.127 -5.637)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
          <path d="M3,10.5H21.727v4.682H3Z" transform="translate(0 -2.818)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
          <path d="M18,24.545V10.5" transform="translate(-5.637 -2.818)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
          <path d="M14.054,7.682H9.841A2.341,2.341,0,0,1,9.841,3C13.118,3,14.054,7.682,14.054,7.682Z" transform="translate(-1.691)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
          <path d="M18,7.682h4.214a2.341,2.341,0,1,0,0-4.682C18.936,3,18,7.682,18,7.682Z" transform="translate(-5.637)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        </g>
      </svg>
    </ButtonMenuItem>
  )
}

export default HarvestActions
