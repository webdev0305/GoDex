import React from 'react'
import { useRouteMatch, Link } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonMenu, ButtonMenuItem, NotificationDot } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  a {
    padding-left: 20px;
    padding-right: 20px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
    a {
      padding-left: 40px;
      padding-right: 40px;
    }
  }
`

const PoolTabButtons = ({ hasStakeInFinishedPools }) => {
  const { url, isExact } = useRouteMatch()
  const { t } = useTranslation()

  return <Wrapper>
    <ButtonMenu activeIndex={isExact ? 0 : 1} scale="sm" variant="subtle">
      <ButtonMenuItem as={Link} to={`${url}`}>
        {t('Active')}
      </ButtonMenuItem>
      <NotificationDot show={hasStakeInFinishedPools}>
        <ButtonMenuItem id="finished-pools-button" as={Link} to={`${url}/history`}>
          {t('Ended')}
        </ButtonMenuItem>
      </NotificationDot>
    </ButtonMenu>
  </Wrapper>
}

export default PoolTabButtons
