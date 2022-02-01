import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, IconButton, ArrowBackIcon, CogIcon } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
// import { useExpertModeManager } from 'state/user/hooks'
// import GlobalSettings from 'components/Menu/GlobalSettings'
// import Transactions from './Transactions'
import QuestionHelper from '../QuestionHelper'

interface Props {
  title: string
  subtitle?: string
  helper?: string
  backTo?: string
  noConfig?: boolean
  cogHandler?: any
  backHandler?: any
}

const AppHeaderContainer = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  width: 100%;
`

const AppHeader: React.FC<Props> = ({ title, subtitle, helper, backTo, noConfig = false, cogHandler, backHandler }) => {
  // const [expertMode] = useExpertModeManager()

  return (
    <AppHeaderContainer>
      <Flex alignItems="center" mr={noConfig ? 0 : '16px'}>
        {backHandler && (
          <IconButton variant="text" onClick={backHandler}>
            <ArrowBackIcon width="24px" />
          </IconButton>
        )}
        {!backHandler && backTo && (
          <IconButton variant="text" as={Link} to={backTo}>
            <ArrowBackIcon width="24px" />
          </IconButton>
        )}
        <Flex flexDirection="column">
          <Heading as="h2">
            {title}
          </Heading>
          {subtitle && <Flex alignItems="center" mt="8px">
            {helper && <QuestionHelper text={helper} mr="4px" placement="top-start" />}
            <Text color="#8B95A8" fontSize="14px">
              {subtitle}
            </Text>
          </Flex>}
        </Flex>
      </Flex>
      {!noConfig && (
        <Flex alignItems="center">
          <IconButton variant="tertiary" onClick={cogHandler}>
            <CogIcon width="24px" />
          </IconButton>
        </Flex>
      )}
    </AppHeaderContainer>
  )
}

export default AppHeader
