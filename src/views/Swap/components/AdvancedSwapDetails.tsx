import React from 'react'
import { Trade, TradeType } from '@pancakeswap/sdk'
import { Text } from '@pancakeswap/uikit'
import { Field } from 'state/swap/actions'
import { useTranslation } from 'contexts/Localization'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from 'utils/prices'
import { AutoColumn } from 'components/Layout/Column'
import QuestionHelper from 'components/QuestionHelper'
import { DoubleCurrencyLogo } from 'components/Logo'
import { RowBetween, RowFixed } from 'components/Layout/Row'
// import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const { t } = useTranslation()
  const { /* priceImpactWithoutFee, */ realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)
  const helper = false
  const price = trade?.executionPrice

  return (
    <AutoColumn style={{ padding: '0 16px' }}>
      <RowBetween>
        <RowFixed>
          <DoubleCurrencyLogo currency0={price?.baseCurrency} currency1={price?.quoteCurrency} />
          <Text fontSize="14px" color="textSubtle">
            {price?.baseCurrency.symbol}/{price?.quoteCurrency.symbol}
          </Text>
        </RowFixed>
        <Text color="primary">
          1 {price?.baseCurrency?.symbol} = {price?.toSignificant(6)} {price?.quoteCurrency?.symbol}
        </Text>
      </RowBetween>
      <RowBetween>
        <Text fontSize="14px" color="textSubtle">{t('Slippage Tolerance')}</Text>
        <Text color="primary">
          {allowedSlippage / 100}%
        </Text>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <Text fontSize="14px" color="textSubtle">
            {isExactIn ? t('Minimum received') : t('Maximum sold')}
          </Text>
          {helper && <QuestionHelper
            text={t(
              'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
            )}
            ml="4px"
          />}
        </RowFixed>
        <RowFixed>
          <Text fontSize="14px" color="primary">
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? '-'}
          </Text>
        </RowFixed>
      </RowBetween>
      {/* <RowBetween>
        <RowFixed>
          <Text fontSize="14px" color="textSubtle">
            {t('Price Impact')}
          </Text>
          <QuestionHelper
            text={t('The difference between the market price and estimated price due to trade size.')}
            ml="4px"
          />
        </RowFixed>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </RowBetween> */}
      <RowBetween>
        <RowFixed>
          <Text fontSize="14px" color="textSubtle">
            {t('Liquidity Provider Fee')}
          </Text>
          {helper && <QuestionHelper
            text={
              <>
                <Text mb="12px">{t('For each trade a %amount% fee is paid', { amount: '0.25%' })}</Text>
                <Text>- {t('%amount% to LP token holders', { amount: '0.17%' })}</Text>
                <Text>- {t('%amount% to the Treasury', { amount: '0.03%' })}</Text>
                <Text>- {t('%amount% towards CAKE buyback and burn', { amount: '0.05%' })}</Text>
              </>
            }
            ml="4px"
          />}
        </RowFixed>
        <Text fontSize="14px" color="primary">
          {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
        </Text>
      </RowBetween>
    </AutoColumn>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const { t } = useTranslation()
  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <AutoColumn gap="0px">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 16px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Text fontSize="14px" color="textSubtle">
                    {t('Route')}
                  </Text>
                  <QuestionHelper
                    text={t('Routing through these tokens resulted in the best price for your trade.')}
                    ml="4px"
                  />
                </span>
                <SwapRoute trade={trade} />
              </RowBetween>
            </>
          )}
        </>
      )}
    </AutoColumn>
  )
}
