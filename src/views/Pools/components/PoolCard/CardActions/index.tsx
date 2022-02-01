import BigNumber from 'bignumber.js'
import React from 'react'
// import styled from 'styled-components'
import { BIG_ZERO } from 'utils/bigNumber'
import { ButtonMenu } from '@pancakeswap/uikit'
// import { useTranslation } from 'contexts/Localization'
import { PoolCategory } from 'config/constants/types'
import { DeserializedPool } from 'state/types'
import ApprovalAction from './ApprovalAction'
import StakeActions from './StakeActions'
import HarvestActions from './HarvestActions'

// const InlineText = styled(Text)`
//   display: inline;
// `

interface CardActionsProps {
  pool: DeserializedPool
  stakedBalance: BigNumber
}

const CardActions: React.FC<CardActionsProps> = ({ pool, stakedBalance }) => {
  const { sousId, earningToken, poolCategory, userData, earningTokenPrice } = pool
  // Pools using native BNB behave differently than pools using a token
  const isBnbPool = poolCategory === PoolCategory.BINANCE
  // const { t } = useTranslation()
  const allowance = userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO
  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO
  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  const needsApproval = !allowance.gt(0) && !isBnbPool
  const isStaked = stakedBalance.gt(0)
  // const isLoading = !userData
  return (
    <ButtonMenu fullWidth activeIndex={0} scale="md" variant="subtle">
      {needsApproval ? (
        <ApprovalAction pool={pool} />
      ) : (
        <StakeActions
          // isLoading={isLoading}
          pool={pool}
          earnings={earnings}
          stakingTokenBalance={stakingTokenBalance}
          // stakedBalance={stakedBalance}
          isBnbPool={isBnbPool}
          isStaked={isStaked}
        />
      )}
      <HarvestActions
        earnings={earnings}
        earningToken={earningToken}
        sousId={sousId}
        earningTokenPrice={earningTokenPrice}
        isBnbPool={isBnbPool}
        // isLoading={isLoading}
      />
    </ButtonMenu>
  )
}

export default CardActions
