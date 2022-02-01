import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Flex, Text } from '@pancakeswap/uikit'
import { ModalInput } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import styled from 'styled-components'
import { CurrencyLogo } from 'components/Logo'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import HarvestAction from './FarmCard/HarvestAction'

interface WithdrawModalProps {
  max: BigNumber
  stakedBalance: BigNumber
  cakePrice?: BigNumber,
  onConfirm: (amount: string) => void
  onDismiss?: () => void
  tokenName?: string
  farm?: any
}

const WithdrawContent: React.FC<WithdrawModalProps> = ({ onConfirm, onDismiss, max, stakedBalance, cakePrice, tokenName = '', farm }) => {
  const [val, setVal] = useState('')
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const valNumber = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)
  const [valPercent,setPercent] = useState<number>(0)
  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {      
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
        if(val===getFullDisplayBalance(max.dividedBy(4),18,10))
          setPercent(25)
        else if(val===getFullDisplayBalance(max.dividedBy(2),18,10))
          setPercent(50)
        else if(val===getFullDisplayBalance(max.multipliedBy(3).dividedBy(4),18,10))
          setPercent(75)
        else if(val===getFullDisplayBalance(max,18,10))
          setPercent(100)
        else
          setPercent(0)
      }
    },
    [setVal, setPercent, max, val],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  const StyledTable = styled.table`
    width: 100%;
    color: white;
    line-height: 2em;
    margin: 2em 0;
    th {
      color: #8B95A8;
      text-align: left;
      &:last-child {
        text-align: right;
      }
    }
    td {
      text-align: left;
      vertical-align: middle;
      &:last-child {
        text-align: right;
      }
      img {
        vertical-align: middle;
      }
    }
  `

  return (
    <>
      <StyledTable>
        <tr>
          <th>Token</th>
          <th>APY</th>
          <th>Claimable Reward</th>
        </tr>
        <tr>
          <td><CurrencyLogo size="32px"/></td>
          <td>{farm?.apr?.toFixed(2)}%</td>
          <td>{farm?.userData?.earnings?.dividedBy(1e18).toFixed(2)}</td>
        </tr>
      </StyledTable>
      {farm?.earnings?.gt(0) && <HarvestAction earnings={farm?.earnings} pid={farm?.pid} />}
      <Text color="#8B95A8" mb="20px">Unstake</Text>
      <ModalInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={val}
        max={fullBalance}
        symbol={tokenName}
        inputTitle={t('Unstake')}
      />
      <Flex flexWrap="wrap" justifyContent="space-around" mt="20px">
        <Button scale="sm" color="white"
          onClick={() => {
            setVal(getFullDisplayBalance(max.dividedBy(4),18,10))
            setPercent(25)
          }}
          variant={valPercent===25 ? 'primary' : 'tertiary'}
        >
          25%
        </Button>
        <Button scale="sm" color="white"
          onClick={() => {
            setVal(getFullDisplayBalance(max.dividedBy(2),18,10))
            setPercent(50)
          }}
          variant={valPercent===50 ? 'primary' : 'tertiary'}
        >
          50%
        </Button>
        <Button scale="sm" color="white"
          onClick={() => {
            setVal(getFullDisplayBalance(max.multipliedBy(3).dividedBy(4),18,10))
            setPercent(75)
          }}
          variant={valPercent===75 ? 'primary' : 'tertiary'}
        >
          75%
        </Button>
        <Button scale="sm" color="white"
          onClick={() => {
            setVal(getFullDisplayBalance(max,18,18))
            setPercent(100)
          }}
          variant={valPercent===100 ? 'primary' : 'tertiary'}
        >
          100%
        </Button>
      </Flex>
      <RowBetween my="20px">
        <Text color="#8B95A8">Amount Staked</Text>
        <RowFixed>
          <Text color="primary">
            {stakedBalance?.dividedBy(1e18).toPrecision()} {farm?.lpSymbol}
          </Text>
          {/* <Text>
            -
            ${stakedBalance?.multipliedBy(cakePrice).toFixed(3)}
          </Text> */}
        </RowFixed>
      </RowBetween>
      <Button
        disabled={pendingTx || !valNumber.isFinite() || valNumber.eq(0) || valNumber.gt(fullBalanceNumber)}
        onClick={async () => {
          setPendingTx(true)
          try {
            await onConfirm(val)
            toastSuccess(t('Unstaked!'), t('Your earnings have also been harvested to your wallet'))
            // onDismiss()
          } catch (e) {
            toastError(
              t('Error'),
              t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
            )
            console.error(e)
          } finally {
            setPendingTx(false)
          }
        }}
        width="100%"
      >
        {pendingTx ? t('Unstaking') : t('Unstake')}
      </Button>
    </>
  )
}

export default WithdrawContent
