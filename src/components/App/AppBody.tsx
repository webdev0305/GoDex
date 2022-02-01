import React from 'react'
import styled from 'styled-components'
import { Card } from '@pancakeswap/uikit'

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  // max-width: 436px;
  width: 100%;
  z-index: 1;
  background: #1A202C;
  box-shadow: 0 5px 5px rgba(0,0,0,0.3);
  > div {
    background: none;
  }
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return (
    <BodyWrapper>{children}</BodyWrapper>
  )
}
