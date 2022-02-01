import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { ButtonMenuItem, useModal, Modal} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'
import useToast from 'hooks/useToast'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { useWeb3React } from '@web3-react/core'
// import { usePriceCakeBusd } from 'state/farms/hooks'
// import Balance from 'components/Balance'
import useHarvestFarm from '../../hooks/useHarvestFarm'

interface FarmCardActionsProps {
  earnings?: BigNumber
  canHarvest?: boolean
  pid?: number
}
const StyledModal = styled(Modal)`
padding: 10px;
> :first-child {
  display: none;
}
`
const HarvestAction: React.FC<FarmCardActionsProps> = ({ earnings, canHarvest, pid }) => {
  const { account } = useWeb3React()
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const [pendingTx, setPendingTx] = useState(false)
  const { onReward } = useHarvestFarm(pid)
  // const cakePrice = usePriceCakeBusd()
  const dispatch = useAppDispatch()
  const rawEarningsBalance = account ? getBalanceAmount(earnings) : BIG_ZERO
  // const displayBalance = rawEarningsBalance.toFixed(3, BigNumber.ROUND_DOWN)
  // const earningsBusd = rawEarningsBalance ? rawEarningsBalance.multipliedBy(cakePrice).toNumber() : 0
// console.log(earnings)

const HarvestTimeLockModel = () => {
  const [actionIndex, setActionIndex] = useState<number>(0)
  return <StyledModal title={t('Harvest Not Available')}>
    <span style={{color: 'white'}}>Harvest Not Available</span>
  </StyledModal>
}

const [onHarvestLock] = useModal(
  <HarvestTimeLockModel />
)

  return (
    <ButtonMenuItem
      disabled={rawEarningsBalance.eq(0) || pendingTx || !canHarvest}
      onClick={async () => {
        // if(!canHarvest) 
        onHarvestLock()
        // setPendingTx(true)
        // try {
        //   await onReward()
        //   toastSuccess(
        //     `${t('Harvested')}!`,
        //     t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'CAKE' }),
        //   )
        // } catch (e) {
        //   toastError(
        //     t('Error'),
        //     t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
        //   )
        //   console.error(e)
        // } finally {
        //   setPendingTx(false)
        // }
        // dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
      }}
    >
      {pendingTx ? t('Harvesting') : t('Harvest')}
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

export default HarvestAction
