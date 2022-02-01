import React from 'react'
import styled from 'styled-components'
import { Flex, Heading } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
// import { CommunityTag, CoreTag } from 'components/Tags'
// import { TokenPairImage } from 'components/TokenImage'
import { DoubleCurrencyLogo } from 'components/Logo'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  isCommunityFarm?: boolean
  token: Token
  quoteToken: Token
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

// const MultiplierTag = styled(Tag)`
//   margin-left: 4px;
// `

const CardHeading: React.FC<ExpandableSectionProps> = ({ lpLabel, /* multiplier, isCommunityFarm, */ token, quoteToken }) => {
  return (
    <Wrapper alignItems="center" mb="12px">
      <DoubleCurrencyLogo currency0={token} currency1={quoteToken} size={48} />
      <Heading mx="8px">{lpLabel.split(' ')[0]} LP</Heading>
    </Wrapper>
  )
}

export default CardHeading
