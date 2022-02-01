import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Modal,
  Text,
  Flex,
  LinkExternal,
} from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
// import { getBalanceNumber } from 'utils/formatBalance'
import { getInterestBreakdown } from 'utils/compoundApyHelpers'
// import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import RoiCalculatorFooter from './RoiCalculatorFooter'
// import RoiCard from './RoiCard'
// import useRoiCalculatorReducer, { CalculatorMode, EditingCurrency } from './useRoiCalculatorReducer'
// import AnimatedArrow from './AnimatedArrow'

interface RoiCalculatorModalProps {
  onDismiss?: () => void
  onBack?: () => void
  earningTokenPrice: number
  apr: number
  displayApr?: string
  linkLabel: string
  linkHref: string
  stakingTokenBalance: BigNumber
  stakingTokenSymbol: string
  stakingTokenPrice: number
  earningTokenSymbol?: string
  multiplier?: string
  autoCompoundFrequency?: number
  performanceFee?: number
  isFarm?: boolean
  initialValue?: string
}

const StyledModal = styled(Modal)`
  width: 500px;
  padding: 20px;
  button {
    border: none;
  }
`

// const ScrollableContainer = styled.div`
//   padding: 24px;
//   max-height: 500px;
//   overflow-y: auto;
//   ${({ theme }) => theme.mediaQueries.sm} {
//     max-height: none;
//   }
// `

// const FullWidthButtonMenu = styled(ButtonMenu)<{ disabled?: boolean }>`
//   width: 100%;

//   & > button {
//     width: 100%;
//   }

//   opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
// `

const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({
  onDismiss,
  onBack,
  earningTokenPrice,
  apr,
  // displayApr,
  // linkLabel,
  linkHref,
  // stakingTokenBalance,
  // stakingTokenSymbol,
  // stakingTokenPrice = 1000,
  // multiplier,
  // initialValue,
  // earningTokenSymbol = 'CAKE',
  // autoCompoundFrequency = 0,
  performanceFee = 0,
  // isFarm = false,
}) => {
  const { t } = useTranslation()
  // const { account } = useActiveWeb3React()
  // const balanceInputRef = useRef<HTMLInputElement | null>(null)

  // const {
  //   state,
  //   setPrincipalFromUSDValue,
  //   setPrincipalFromTokenValue,
  //   setStakingDuration,
  //   toggleCompounding,
  //   toggleEditingCurrency,
  //   setCompoundingFrequency,
  //   setCalculatorMode,
  //   setTargetRoi,
  // } = useRoiCalculatorReducer(stakingTokenPrice, earningTokenPrice, apr, autoCompoundFrequency, performanceFee)

  const [interestBreakdown,setInterestBreakdown] = useState<number[]>() // useRef<number[]>()
  
  useEffect(() => {
    if(apr) setInterestBreakdown(getInterestBreakdown({
      principalInUSD: 1000,
      apr,
      earningTokenPrice,
      compoundFrequency: 0,
      performanceFee,
    }))
  }, [apr,earningTokenPrice,performanceFee])

  // const { compounding, activeCompoundingIndex, stakingDuration, editingCurrency } = state.controls
  // const { principalAsUSD, principalAsToken } = state.data

  // // Auto-focus input on opening modal
  // useEffect(() => {
  //   if (balanceInputRef.current) {
  //     balanceInputRef.current.focus()
  //   }
  // }, [])

  // // If user comes to calculator from staking modal - initialize with whatever they put in there
  // useEffect(() => {
  //   if (initialValue) {
  //     setPrincipalFromTokenValue(initialValue)
  //   }
  // }, [initialValue, setPrincipalFromTokenValue])

  // const { targetRef, tooltip, tooltipVisible } = useTooltip(
  //   isFarm
  //     ? t('“My Balance” here includes both LP Tokens in your wallet, and LP Tokens already staked in this farm.')
  //     : t(
  //         '“My Balance” here includes both %assetSymbol% in your wallet, and %assetSymbol% already staked in this pool.',
  //         { assetSymbol: stakingTokenSymbol },
  //       ),
  //   { placement: 'top-end', tooltipOffset: [20, 10] },
  // )

  // const onBalanceFocus = () => {
  //   setCalculatorMode(CalculatorMode.ROI_BASED_ON_PRINCIPAL)
  // }

  // const editingUnit = editingCurrency === EditingCurrency.TOKEN ? stakingTokenSymbol : 'USD'
  // const editingValue = editingCurrency === EditingCurrency.TOKEN ? principalAsToken : principalAsUSD
  // const conversionUnit = editingCurrency === EditingCurrency.TOKEN ? 'USD' : stakingTokenSymbol
  // const conversionValue = editingCurrency === EditingCurrency.TOKEN ? principalAsUSD : principalAsToken
  // const onUserInput = editingCurrency === EditingCurrency.TOKEN ? setPrincipalFromTokenValue : setPrincipalFromUSDValue

  const StyledTable = styled.table`
    width: 100%;
    color: white;
    line-height: 2em;
    margin-bottom: 1em;
    thead {
      th {
        color: #8B95A8;
        &:first-child {
          text-align: left;
        }
        &:last-child {
          text-align: right;
        }
      }
    }
    td {
      text-align: center;
      &:first-child {
        text-align: left;
      }
      &:last-child {
        text-align: right;
      }
    }
  `

  const getROI = (index, decimals = 2) => {
    const v = interestBreakdown
    if(v) {
      return Number(v[index]*earningTokenPrice/10).toFixed(decimals)
    }
    return '-'
  }

  const getROIToken = (index) => {
    const v = interestBreakdown
    if(v)
      return v[index]
    return '-'
  }

  const getROIUSD = (index, decimals = 2) => {
    const v = interestBreakdown
    if(v)
      return Number(v[index]*earningTokenPrice).toFixed(decimals)
    return '-'
  }

  return (
    <StyledModal
      title={t('ROI')}
      onDismiss={onBack || onDismiss}
      onBack={onBack ?? null}
      headerBackground="none"
    >
      <StyledTable>
        <thead>
          <tr>
            <th>Timeframe</th>
            <th>ROI</th>
            <th>
              <Flex alignItems="center" justifyContent="flex-end">
                <Text color="primary" mr="0.5em">GO</Text>
                per
                <Text color="white" ml="0.5em">$1000</Text>
              </Flex>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1d</td>
            <td>{getROI(0)}%</td>
            <td>{getROIToken(0)} (${getROIUSD(0)})</td>
          </tr>
          <tr>
            <td>7d</td>
            <td>{getROI(1)}%</td>
            <td>{getROIToken(1)} (${getROIUSD(1)})</td>
          </tr>
          <tr>
            <td>30d</td>
            <td>{getROI(2)}%</td>
            <td>{getROIToken(2)} (${getROIUSD(2)})</td>
          </tr>
          <tr>
            <td>365d(APY)</td>
            <td>{getROI(3)}%</td>
            <td>{getROIToken(3)} (${getROIUSD(3)})</td>
          </tr>
        </tbody>
      </StyledTable>
      <Text small color="#8B95A8" textAlign="center">
        Calculated based on current rates. Compounding once daily. Rates are estimates provided for your convenience only, and by no means represent guaranteed returns.
      </Text>
      <Flex justifyContent="center" mt="24px">
        <LinkExternal href={linkHref}>Get LP Tokens</LinkExternal>
      </Flex>
    </StyledModal>
  )
}

export default RoiCalculatorModal
