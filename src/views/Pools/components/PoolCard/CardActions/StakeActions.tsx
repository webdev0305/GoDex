import React from 'react'
import { useModal, ButtonMenuItem } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
// import { getBalanceNumber } from 'utils/formatBalance'
import { DeserializedPool } from 'state/types'
// import Balance from 'components/Balance'
import NotEnoughTokensModal from '../Modals/NotEnoughTokensModal'
import StakeModal from '../Modals/StakeModal'

interface StakeActionsProps {
  pool: DeserializedPool
  stakingTokenBalance: BigNumber
  // stakedBalance: BigNumber
  isBnbPool: boolean
  isStaked: ConstrainBoolean
  // isLoading?: boolean
  earnings?: BigNumber
}

const StakeAction: React.FC<StakeActionsProps> = ({
  pool,
  earnings,
  stakingTokenBalance,
  // stakedBalance,
  isBnbPool,
  isStaked,
  // isLoading = false,
}) => {
  const { stakingToken, stakingTokenPrice, isFinished } = pool
  const { t } = useTranslation()
  // const stakedTokenBalance = getBalanceNumber(stakedBalance, stakingToken.decimals)
  // const stakedTokenDollarBalance = getBalanceNumber(
  //   stakedBalance.multipliedBy(stakingTokenPrice),
  //   stakingToken.decimals,
  // )

  const [onPresentTokenRequired] = useModal(<NotEnoughTokensModal tokenSymbol={stakingToken.symbol} />)

  const [onPresentStake] = useModal(
    <StakeModal
      isBnbPool={isBnbPool}
      pool={pool}
      earnings={earnings}
      stakingTokenBalance={stakingTokenBalance}
      stakingTokenPrice={stakingTokenPrice}
    />,
  )

  // const [onPresentUnstake] = useModal(
  //   <StakeModal
  //     stakingTokenBalance={stakingTokenBalance}
  //     isBnbPool={isBnbPool}
  //     pool={pool}
  //     earnings={earnings}        
  //     stakingTokenPrice={stakingTokenPrice}
  //     isRemovingStake
  //   />,
  // )

  // const { targetRef, tooltip, tooltipVisible } = useTooltip(
  //   t('You’ve already staked the maximum amount you can stake in this pool!'),
  //   { placement: 'bottom' },
  // )

  // const reachStakingLimit = stakingLimit.gt(0) && userData.stakedBalance.gte(stakingLimit)

  return (
    <ButtonMenuItem style={{background:'#1EBF8D'}} disabled={isFinished} onClick={stakingTokenBalance.gt(0) ? onPresentStake : onPresentTokenRequired}>
      {isStaked?t('Manage'):t('Stake')}
    </ButtonMenuItem>
  )  
}

export default StakeAction
