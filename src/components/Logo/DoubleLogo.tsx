import { Currency } from '@pancakeswap/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from './CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean }>`
  display: flex;
  flex-direction: row-reverse;
  margin-right: ${({ margin }) => margin && '4px'};
  img {
    border-radius: 50%;
  }
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
  inverted?: boolean
}

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 20,
  margin = false,
  inverted = false,
}: DoubleCurrencyLogoProps) {
  return (
    <Wrapper margin={margin}>
      {(inverted?currency1:currency0) && <CurrencyLogo currency={(inverted?currency1:currency0)} size={`${size.toString()}px`} style={{ marginLeft:`-${(size/4).toString()}px` }} />}
      {(inverted?currency0:currency1) && <CurrencyLogo currency={(inverted?currency0:currency1)} size={`${size.toString()}px`} />}
    </Wrapper>
  )
}
