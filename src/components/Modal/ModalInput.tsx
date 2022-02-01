import React from 'react'
import styled from 'styled-components'
import { Text, Input, InputProps, Flex, Link, Button } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { parseUnits } from 'ethers/lib/utils'
import { formatBigNumber } from 'utils/formatBalance'
import { DoubleCurrencyLogo } from 'components/Logo'
import { RowFixed } from 'components/Layout/Row'

interface ModalInputProps {
  max: string
  symbol: string
  onSelectMax?: () => void
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  value: string
  addLiquidityUrl?: string
  inputTitle?: string
  decimals?: number
}

const getBoxShadow = ({ isWarning = false, theme }) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  return theme.shadows.inset
}

const StyledTokenInput = styled.div<InputProps>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  box-shadow: ${getBoxShadow};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  width: 100%;
  position: relative;
`

const StyledInput = styled(Input)`
  box-shadow: none;
  width: 100px;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  font-size: 20px;
  ${({ theme }) => theme.mediaQueries.xs} {
    width: 80px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    width: 200px;
  }
  &:focus:not(:disabled) {
    outline: none;
    box-shadow: none;
  }
`

const StyledErrorMessage = styled(Text)`
  padding-left: 20px;
  a {
    display: inline;
  }
`

const ModalInput: React.FC<ModalInputProps> = ({
  max,
  symbol,
  onChange,
  onSelectMax,
  value,
  addLiquidityUrl,
  // inputTitle,
  decimals = 18,
}) => {
  const { t } = useTranslation()
  const isBalanceZero = max === '0' || !max

  const displayBalance = (balance: string) => {
    if (isBalanceZero) {
      return '0'
    }

    const balanceUnits = parseUnits(balance, decimals)
    return formatBigNumber(balanceUnits, decimals, decimals)
  }

  return (
    <StyledTokenInput isWarning={isBalanceZero}>
      <Flex justifyContent="space-between">
        <RowFixed>
          <Text fontSize="14px">{t('Available:')}</Text>
          <Text fontSize="14px" color="primary" ml="4px">{displayBalance(max)}</Text>
        </RowFixed>
        {isBalanceZero && (
          <StyledErrorMessage fontSize="14px" color="failure">
            {t('No tokens to stake')}:{' '}
            <Link fontSize="14px" bold={false} href={addLiquidityUrl} external color="failure">
              {t('Get %symbol%', { symbol })}
            </Link>
          </StyledErrorMessage>
        )}        
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <StyledInput
          pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
          inputMode="decimal"
          step="any"
          min="0"
          onChange={onChange}
          placeholder="0"
          value={value}
        />
        <Button scale="sm" onClick={onSelectMax} mr="8px" variant="text">
          {t('Max')}
        </Button>
        <RowFixed>
          <DoubleCurrencyLogo />
          <Text fontSize="16px">{symbol}</Text>
        </RowFixed>
      </Flex>        
    </StyledTokenInput>
  )
}

export default ModalInput
