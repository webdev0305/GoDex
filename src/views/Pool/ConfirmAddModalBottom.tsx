import { Currency, CurrencyAmount, Fraction, Percent } from '@pancakeswap/sdk'
import React from 'react'
import { Button, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { RowBetween, RowFixed } from '../../components/Layout/Row'
// import { CurrencyLogo } from '../../components/Logo'
import { Field } from '../../state/mint/actions'

function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <RowBetween>
        <Text color="#8B95A8">{t('%asset% Deposited', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Text>
        <RowFixed>
          <Text color="primary" mr="8px">{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
          <Text>{currencies[Field.CURRENCY_A]?.symbol}</Text>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <Text color="#8B95A8">{t('%asset% Deposited', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Text>
        <RowFixed>
          <Text color="primary" mr="8px">{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
          <Text>{currencies[Field.CURRENCY_B]?.symbol}</Text>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <Text color="#8B95A8">{t('Rates')}</Text>
        <div>
          <RowFixed>
            <Text color="primary" mr="8px">1</Text>
            {currencies[Field.CURRENCY_A]?.symbol}
            <Text mx="8px"> = </Text>
            <Text color="primary" mr="8px">{price?.toSignificant(4)}</Text>
            {currencies[Field.CURRENCY_B]?.symbol}
          </RowFixed>
          <RowFixed>
            <Text color="primary" mr="8px">1</Text>
            {currencies[Field.CURRENCY_B]?.symbol}
            <Text mx="8px"> = </Text>
            <Text color="primary" mr="8px">{price?.invert().toSignificant(4)}</Text>
            {currencies[Field.CURRENCY_A]?.symbol}
          </RowFixed>
        </div>
      </RowBetween>
      <RowBetween>
        <Text color="#8B95A8">{t('Share of Pool')}:</Text>
        <RowFixed>
          <Text color="primary" mr="8px">{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}</Text>
          <Text>%</Text>
        </RowFixed>
      </RowBetween>
      <Button onClick={onAdd} mt="20px" width="100%">
        {noLiquidity ? t('Create Pool & Supply') : t('Confirm Order')}
      </Button>
    </>
  )
}

export default ConfirmAddModalBottom
