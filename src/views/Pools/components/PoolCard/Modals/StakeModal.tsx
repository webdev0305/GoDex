import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Modal,
  Text,
  Flex,
  Button,
  AutoRenewIcon,
  ButtonMenu,
  ButtonMenuItem,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import BigNumber from 'bignumber.js'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { ModalInput } from 'components/Modal'
import { CurrencyLogo } from 'components/Logo'
import { getFullDisplayBalance, getDecimalAmount } from 'utils/formatBalance'
import { DeserializedPool } from 'state/types'
// import { getInterestBreakdown } from 'utils/compoundApyHelpers'
import PercentageButton from './PercentageButton'
import useStakePool from '../../../hooks/useStakePool'
import useUnstakePool from '../../../hooks/useUnstakePool'
import HarvestActions from '../CardActions/HarvestActions'

interface StakeModalProps {
  isBnbPool: boolean
  pool: DeserializedPool
  stakingTokenBalance: BigNumber
  stakingTokenPrice: number
  isRemovingStake?: boolean
  onDismiss?: () => void
  earnings?: BigNumber
}

// const StyledLink = styled(Link)`
//   width: 100%;
// `

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

const StakeModal: React.FC<StakeModalProps> = ({
  isBnbPool,
  pool,
  earnings,
  stakingTokenBalance,
  stakingTokenPrice,
  isRemovingStake = false,
  onDismiss,
}) => {
  const { sousId, stakingToken, earningTokenPrice, apr, userData, stakingLimit, earningToken } = pool
  
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { onStake } = useStakePool(sousId, isBnbPool)
  const { onUnstake } = useUnstakePool(sousId, pool.enableEmergencyWithdraw)
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const [hasReachedStakeLimit, setHasReachedStakedLimit] = useState(false)
  // const [percent, setPercent] = useState(0)
  const [showRoiCalculator, setShowRoiCalculator] = useState(false)
  const getCalculatedStakingLimit = () => {
    if (actionIndex===1) {
      return userData.stakedBalance
    }
    return stakingLimit.gt(0) && stakingTokenBalance.gt(stakingLimit) ? stakingLimit : stakingTokenBalance
  }
  const fullDecimalStakeAmount = getDecimalAmount(new BigNumber(stakeAmount), stakingToken.decimals)
  const userNotEnoughToken = isRemovingStake
    ? userData.stakedBalance.lt(fullDecimalStakeAmount)
    : userData.stakingTokenBalance.lt(fullDecimalStakeAmount)

  // const usdValueStaked = new BigNumber(stakeAmount).times(stakingTokenPrice)
  // const formattedUsdValueStaked = !usdValueStaked.isNaN() && formatNumber(usdValueStaked.toNumber())

  // const interestBreakdown = getInterestBreakdown({
  //   principalInUSD: !usdValueStaked.isNaN() ? usdValueStaked.toNumber() : 0,
  //   apr,
  //   earningTokenPrice,
  // })
  // const annualRoi = interestBreakdown[3] * pool.earningTokenPrice
  // const formattedAnnualRoi = formatNumber(annualRoi, annualRoi > 10000 ? 0 : 2, annualRoi > 10000 ? 0 : 2)

  const getTokenLink = stakingToken.address ? `/swap?outputCurrency=${stakingToken.address}` : '/swap'
  const [actionIndex, setActionIndex] = useState<number>(0)

  useEffect(() => {
    if (stakingLimit.gt(0) && !isRemovingStake) {
      setHasReachedStakedLimit(fullDecimalStakeAmount.plus(userData.stakedBalance).gt(stakingLimit))
    }
    // setActionIndex(isRemovingStake?1:0)
  }, [
    stakeAmount,
    stakingLimit,
    userData,
    stakingToken,
    isRemovingStake,
    setHasReachedStakedLimit,
    fullDecimalStakeAmount,
  ])

  const max = getCalculatedStakingLimit()
  const fullBalance = getFullDisplayBalance(max)

  const handleSelectMax = useCallback(() => {
    setStakeAmount(fullBalance)
  }, [setStakeAmount, fullBalance])

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setStakeAmount(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setStakeAmount],
  )
  
  // const handleStakeInputChange = (input: string) => {
  //   if (input) {
  //     const convertedInput = getDecimalAmount(new BigNumber(input), stakingToken.decimals)
  //     const percentage = Math.floor(convertedInput.dividedBy(getCalculatedStakingLimit()).multipliedBy(100).toNumber())
  //     setPercent(Math.min(percentage, 100))
  //   } else {
  //     setPercent(0)
  //   }
  //   setStakeAmount(input)
  // }

  const handleChangePercent = (sliderPercent: number) => {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = getCalculatedStakingLimit().dividedBy(100).multipliedBy(sliderPercent)
      const amountToStake = getFullDisplayBalance(percentageOfStakingMax, stakingToken.decimals, stakingToken.decimals)
      setStakeAmount(amountToStake)
    } else {
      setStakeAmount('')
    }
    // setPercent(sliderPercent)
  }

  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
      if (actionIndex===1) {
        // unstaking
        console.log(stakeAmount)
        await onUnstake(stakeAmount, stakingToken.decimals)
        toastSuccess(
          `${t('Unstaked')}!`,
          t('Your %symbol% earnings have also been harvested to your wallet!', {
            symbol: earningToken.symbol,
          }),
        )
      } else {
        // staking
        await onStake(stakeAmount, stakingToken.decimals)
        toastSuccess(
          `${t('Staked')}!`,
          t('Your %symbol% funds have been staked in the pool!', {
            symbol: stakingToken.symbol,
          }),
        )
      }
      setPendingTx(false)
      onDismiss()
    } catch (e) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
    }
  }

  if (showRoiCalculator) {
    return (
      <RoiCalculatorModal
        earningTokenPrice={earningTokenPrice}
        stakingTokenPrice={stakingTokenPrice}
        apr={apr}
        linkLabel={t('Get %symbol%', { symbol: stakingToken.symbol })}
        linkHref={getTokenLink}
        stakingTokenBalance={userData.stakedBalance.plus(stakingTokenBalance)}
        stakingTokenSymbol={stakingToken.symbol}
        earningTokenSymbol={earningToken.symbol}
        onBack={() => setShowRoiCalculator(false)}
        initialValue={stakeAmount}
      />
    )
  }

  // const StyledModal = styled(Modal)`
  //   padding: 10px;
  //   > :first-child {
  //     display: none;
  //   }
  // `

  const StyledTable = styled.table`
    width: 100%;
    color: white;
    line-height: 2em;
    margin: 2em 0;
    th {
      color: #8B95A8;
      text-align: left;
      &:last-child {
        text-align: right;
      }
    }
    td {
      text-align: left;
      vertical-align: middle;
      &:last-child {
        text-align: right;
      }
      img {
        vertical-align: middle;
      }
    }
  `

  return (
    <Modal
      minWidth="500px"
      title={null}
      onDismiss={onDismiss}
      headerBackground={theme.colors.gradients.cardHeader}
    >
      <ButtonMenu activeIndex={actionIndex} scale="md" variant="subtle" onItemClick={(i)=>setActionIndex(i)}>
        <ButtonMenuItem>
          {t('Stake')}
        </ButtonMenuItem>
        <ButtonMenuItem>
          {t('Unstake')}
        </ButtonMenuItem>
      </ButtonMenu>
      {actionIndex===0?
      <>
        <RowBetween my="20px">
          <Text color="#8B95A8">APY</Text>
          <Text>{apr?.toFixed(2)}%</Text>
        </RowBetween>
        {pool.harvest && <RowBetween mb="20px">
          <Text color="#8B95A8">Claimable Rewards</Text>
          <RowFixed>
            <Text color="primary">
              {earnings?.dividedBy(1e18).toFixed(3)} {earningToken?.symbol}
            </Text>
            <Text>
              -
              ${earnings?.dividedBy(1e18).multipliedBy(earningTokenPrice).toFixed(3)}
            </Text>
          </RowFixed>
        </RowBetween>}
        {pool.harvest && <HarvestActions
          earnings={earnings}
          earningToken={earningToken}
          sousId={sousId}
          earningTokenPrice={earningTokenPrice}
          isBnbPool={isBnbPool}
        />}
        <Flex alignItems="center" justifyContent="space-between" my="16px">
          <Text color="#8B95A8">{t('Stake')}</Text>
        </Flex>
        <ModalInput
          value={stakeAmount}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={fullBalance}
          symbol={stakingToken.symbol}
          // addLiquidityUrl={addLiquidityUrl}
          inputTitle={t('Stake')}
        />
      </>:
      <>
        <StyledTable>
          <tr>
            <th>Token</th>
            <th>APY</th>
            <th>Claimable Reward</th>
          </tr>
          <tr>
            <td><CurrencyLogo size="32px"/></td>
            <td>{apr?.toFixed(2)}%</td>
            <td>{earnings?.dividedBy(1e18).toFixed(3)}</td>
          </tr>
        </StyledTable>
        {pool.harvest && <HarvestActions
          earnings={earnings}
          earningToken={earningToken}
          sousId={sousId}
          earningTokenPrice={earningTokenPrice}
          isBnbPool={isBnbPool}
        />}
        <Flex alignItems="center" justifyContent="space-between" my="16px">
          <Text color="#8B95A8">{t('Untake')}</Text>
        </Flex>
        <ModalInput
          value={stakeAmount}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={getFullDisplayBalance(userData.stakedBalance,18,8)}
          symbol={stakingToken.symbol}
          // addLiquidityUrl={addLiquidityUrl}
          inputTitle={t('Stake')}
        />
        <Flex alignItems="center" justifyContent="space-between" mt="8px">
          <PercentageButton onClick={() => handleChangePercent(25)}>25%</PercentageButton>
          <PercentageButton onClick={() => handleChangePercent(50)}>50%</PercentageButton>
          <PercentageButton onClick={() => handleChangePercent(75)}>75%</PercentageButton>
          <PercentageButton onClick={() => handleChangePercent(100)}>{t('Max')}</PercentageButton>
        </Flex>
      </>}
      {/* {stakingLimit.gt(0) && !isRemovingStake && (
        <Text color="secondary" bold mb="24px" style={{ textAlign: 'center' }} fontSize="16px">
          {t('Max stake for this pool: %amount% %token%', {
            amount: getFullDisplayBalance(stakingLimit, stakingToken.decimals, 0),
            token: stakingToken.symbol,
          })}
        </Text>
      )}
      {hasReachedStakeLimit && (
        <Text color="failure" fontSize="12px" style={{ textAlign: 'right' }} mt="4px">
          {t('Maximum total stake: %amount% %token%', {
            amount: getFullDisplayBalance(new BigNumber(stakingLimit), stakingToken.decimals, 0),
            token: stakingToken.symbol,
          })}
        </Text>
      )}
      {userNotEnoughToken && (
        <Text color="failure" fontSize="12px" style={{ textAlign: 'right' }} mt="4px">
          {t('Insufficient %symbol% balance', {
            symbol: stakingToken.symbol,
          })}
        </Text>
      )}
      <Text ml="auto" color="textSubtle" fontSize="12px" mb="8px">
        {t('Balance: %balance%', {
          balance: getFullDisplayBalance(getCalculatedStakingLimit(), stakingToken.decimals),
        })}
      </Text> */}
      {/* <Slider
        min={0}
        max={100}
        value={percent}
        onValueChanged={handleChangePercent}
        name="stake"
        valueLabel={`${percent}%`}
        step={1}
      /> */}
      <RowBetween my="20px">
        <Text color="#8B95A8">Amount Staked</Text>
        <RowFixed>
          <Text color="primary">
            {getFullDisplayBalance(userData.stakedBalance,18,3)} {stakingToken?.symbol}
          </Text>
          <Text>
            -
            ${getFullDisplayBalance(userData.stakedBalance?.multipliedBy(stakingTokenPrice),18,2)}
          </Text>
        </RowFixed>
      </RowBetween>
      {/* {!isRemovingStake && (
        <Flex mt="24px" alignItems="center" justifyContent="space-between">
          <Text mr="8px" color="textSubtle">
            {t('Annual ROI at current rates')}:
          </Text>
          <AnnualRoiContainer alignItems="center" onClick={() => setShowRoiCalculator(true)}>
            <AnnualRoiDisplay>${formattedAnnualRoi}</AnnualRoiDisplay>
            <IconButton variant="text" scale="sm">
              <CalculateIcon color="textSubtle" width="18px" />
            </IconButton>
          </AnnualRoiContainer>
        </Flex>
      )} */}
      <Button
        isLoading={pendingTx}
        endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
        onClick={handleConfirmClick}
        disabled={!stakeAmount || parseFloat(stakeAmount) === 0 || hasReachedStakeLimit || userNotEnoughToken}
        mt="24px"
      >
        {pendingTx ? t('Confirming') : t('Confirm')}
      </Button>
    </Modal>
  )
}

export default StakeModal
