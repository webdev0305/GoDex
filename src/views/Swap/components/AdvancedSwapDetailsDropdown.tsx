import React from 'react'
import styled from 'styled-components'
import useLastTruthy from 'hooks/useLast'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  margin: auto;
  margin-top: ${({ show }) => (show ? '0' : '-50%')};
  padding-top: 16px;
  padding-bottom: 16px;
  width: 100%;
  max-width: 350px;
  border-radius: 0 0 10px 10px;
  background-color: #273043;
  box-shadow: 0 5px 5px rgba(0,0,0,0.3);

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade)

  return (
    <AdvancedDetailsFooter show={Boolean(trade)}>
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </AdvancedDetailsFooter>
  )
}
