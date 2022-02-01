import React from 'react'
import { Price } from '@pancakeswap/sdk'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
// import { StyledBalanceMaxMini } from './styleds'

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)
  const { t } = useTranslation()
  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `1 ${price?.baseCurrency?.symbol} = %rate% ${price?.quoteCurrency?.symbol}`
    : `1 ${price?.quoteCurrency?.symbol} = %rate% ${price?.baseCurrency?.symbol}`

  return (
    <Text textAlign="center" color="#8B95A8" onClick={() => setShowInverted(!showInverted)}>
      {show && t(label,{rate:formattedPrice ?? '-'})}
    </Text>
  )
}
