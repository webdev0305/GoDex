import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
// import styled from 'styled-components'
import { Text, Button } from '@pancakeswap/uikit'
import { ModalInput } from 'components/Modal'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { useTranslation } from 'contexts/Localization'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { getFullDisplayBalance,/* formatNumber, formatBigNumberToFixed, getBalanceNumber */ } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
// import { getInterestBreakdown } from 'utils/compoundApyHelpers'
// import { Token } from '@pancakeswap/sdk'
import HarvestAction from './FarmCard/HarvestAction'

// const AnnualRoiContainer = styled(Flex)`
//   cursor: pointer;
// `

// const AnnualRoiDisplay = styled(Text)`
//   width: 72px;
//   max-width: 72px;
//   overflow: hidden;
//   text-align: right;
//   text-overflow: ellipsis;
// `

interface DepositModalProps {
  max: BigNumber
  stakedBalance: BigNumber
  multiplier?: string
  lpPrice: BigNumber
  lpLabel?: string
  onConfirm: (amount: string) => void
  onDismiss?: () => void
  tokenName?: string
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
  cakePrice?: BigNumber,
  farm?: any
}

const DepositContent: React.FC<DepositModalProps> = ({
  max,
  stakedBalance,
  onConfirm,
  onDismiss,
  tokenName = '',
  multiplier,
  displayApr,
  lpPrice,
  lpLabel,
  apr,
  addLiquidityUrl,
  cakePrice,
  farm,
}) => {
  const [val, setVal] = useState('')
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const lpTokensToStake = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

  // const usdToStake = lpTokensToStake.times(lpPrice)

  // const interestBreakdown = getInterestBreakdown({
  //   principalInUSD: !lpTokensToStake.isNaN() ? usdToStake.toNumber() : 0,
  //   apr,
  //   earningTokenPrice: cakePrice.toNumber(),
  // })

  // const annualRoi = cakePrice.times(interestBreakdown[3])
  // const formattedAnnualRoi = formatNumber(
  //   annualRoi.toNumber(),
  //   annualRoi.gt(10000) ? 0 : 2,
  //   annualRoi.gt(10000) ? 0 : 2,
  // )

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  if (showRoiCalculator) {
    return (
      <RoiCalculatorModal
        linkLabel={t('Get %symbol%', { symbol: lpLabel })}
        stakingTokenBalance={stakedBalance.plus(max)}
        stakingTokenSymbol={tokenName}
        stakingTokenPrice={lpPrice.toNumber()}
        earningTokenPrice={cakePrice.toNumber()}
        apr={apr}
        multiplier={multiplier}
        displayApr={displayApr}
        linkHref={addLiquidityUrl}
        isFarm
        initialValue={val}
        onBack={() => setShowRoiCalculator(false)}
      />
    )
  }

  return (
    <>
      <RowBetween my="20px">
        <Text color="#8B95A8">APY</Text>
        <Text>{apr?.toFixed(2)}%</Text>
      </RowBetween>
      {farm?.earnings?.gt(0) && <RowBetween mb="20px">
        <Text color="#8B95A8">Claimable Rewards</Text>
        <RowFixed>
          <Text color="primary">
            {farm?.earnings?.toPrecision()} {farm?.earningToken?.symbol}
          </Text>
          <Text>
            -
            ${farm?.earnings?.multipliedBy(cakePrice).toFixed(3)}
          </Text>
        </RowFixed>
      </RowBetween>}
      {farm?.earnings?.gt(0) && <HarvestAction earnings={farm?.earnings} pid={farm?.pid} />}
      <Text color="#8B95A8" mb="20px">Stake</Text>
      <ModalInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
        addLiquidityUrl={addLiquidityUrl}
        inputTitle={t('Stake')}
      />
      <RowBetween my="20px">
        <Text color="#8B95A8">Amount Staked</Text>
        <RowFixed>
          <Text color="primary">
            {stakedBalance?.dividedBy(1e18).toPrecision()} {farm?.lpSymbol}
          </Text>
          {/* <Text>
            -
            ${stakedBalance?.multipliedBy(cakePrice).toFixed(3)}
          </Text> */}
        </RowFixed>
      </RowBetween>
      {/* <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          {t('Annual ROI at current rates')}:
        </Text>
        <AnnualRoiContainer alignItems="center" onClick={() => setShowRoiCalculator(true)}>
          <AnnualRoiDisplay>${formattedAnnualRoi}</AnnualRoiDisplay>
          <IconButton variant="text" scale="sm">
            <CalculateIcon color="textSubtle" width="18px" />
          </IconButton>
        </AnnualRoiContainer>
      </Flex> */}
      {/* <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
        {t('Cancel')}
      </Button> */}
      <Button
        width="100%"
        disabled={
          pendingTx || !lpTokensToStake.isFinite() || lpTokensToStake.eq(0) || lpTokensToStake.gt(fullBalanceNumber)
        }
        onClick={async () => {
          setPendingTx(true)
          try {
            await onConfirm(val)
            toastSuccess(t('Staked!'), t('Your funds have been staked in the farm'))
            // onDismiss()
          } catch (e) {
            toastError(
              t('Error'),
              t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
            )
            console.error(e)
          } finally {
            setPendingTx(false)
          }
        }}
      >
        {pendingTx ? t('Staking') : t('Stake')}
      </Button>
      {/* </ModalActions> */}
      {/* <LinkExternal href={addLiquidityUrl} style={{ alignSelf: 'center' }}>
        {t('Get %symbol%', { symbol: tokenName })}
      </LinkExternal> */}
    </>
  )
}

export default DepositContent
