import styled from 'styled-components'
import { Card } from '@pancakeswap/uikit'

export const StyledCard = styled(Card)<{ isFinished?: boolean }>`
  max-width: 352px;
  margin: 0 8px 24px;
  display: flex;
  flex-direction: column;
  align-self: baseline;
  position: relative;
  background: #273043;
  color: ${({ isFinished, theme }) => theme.colors[isFinished ? 'textDisabled' : 'secondary']};

  ${({ theme }) => theme.mediaQueries.sm} {
    margin: 0 12px 46px;
  }
  &::before {
    position: absolute;
    width: 250px;
    height: 250px;
    content: ' ';
    background: #363F53;
    border-radius: 50%;
    left: -80px;
    top: -80px;
    z-index: 0;
  }
  > div {
    padding: 24px;
    background: none;
    z-index: 1;
  }
`

export default StyledCard
