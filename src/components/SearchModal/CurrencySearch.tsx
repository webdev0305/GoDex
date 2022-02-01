import React, { KeyboardEvent, RefObject, useCallback, useMemo, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Currency, ETHER, Token } from '@pancakeswap/sdk'
import { Text, Input, Box } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { FixedSizeList } from 'react-window'
import { useAudioModeManager } from 'state/user/hooks'
import useDebounce from 'hooks/useDebounce'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useAllTokens, useToken, useIsUserAddedToken, useFoundOnInactiveList } from '../../hooks/Tokens'
import { isAddress } from '../../utils'
import Column, { AutoColumn } from '../Layout/Column'
import Row from '../Layout/Row'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { filterTokens, useSortedTokensByQuery } from './filtering'
import useTokenComparator from './sorting'

import ImportRow from './ImportRow'

interface CurrencySearchProps {
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showImportView?: () => void
  setImportToken?: (token: Token) => void
}

const swapSound = new Audio('swap.mp3')

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  showImportView,
  setImportToken,
}: CurrencySearchProps) {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const [invertSearchOrder] = useState<boolean>(false)

  const allTokens = useAllTokens()

  // if they input an address, use it
  const searchToken = useToken(debouncedQuery)
  const searchTokenIsAdded = useIsUserAddedToken(searchToken)

  const [audioPlay] = useAudioModeManager()

  const showETH: boolean = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim()
    return s === '' || s === 'b' || s === 'bn' || s === 'bnb'
  }, [debouncedQuery])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery)
  }, [allTokens, debouncedQuery])

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery)

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      if (audioPlay) {
        swapSound.play()
      }
    },
    [audioPlay, onCurrencySelect],
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === 'bnb') {
          handleCurrencySelect(ETHER)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, debouncedQuery],
  )

  // if no results on main list, show option to expand into inactive
  const inactiveTokens = useFoundOnInactiveList(debouncedQuery)
  const filteredInactiveTokens: Token[] = useSortedTokensByQuery(inactiveTokens, debouncedQuery)

  const SearchRow = styled(Row)`
    position:relative;
    input {
      background:#273043;
      padding-left: 50px;
      &::placeholder {
        color: #8B95A8;
      }
    }
    svg {
      position:absolute;
      margin: 10px;
    }
  `
  return (
    <>
      <div>
        <AutoColumn gap="16px">
          <SearchRow>
            <Input
              id="token-search-input"
              placeholder={t('Enter the token symbol or address')}
              scale="lg"
              autoComplete="off"
              value={searchQuery}
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              onKeyDown={handleEnter}              
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27.007" viewBox="0 0 27 27.007">
              <path id="Icon_ionic-ios-search" data-name="Icon ionic-ios-search" d="M31.184,29.545l-7.509-7.58a10.7,10.7,0,1,0-1.624,1.645l7.46,7.53a1.156,1.156,0,0,0,1.631.042A1.163,1.163,0,0,0,31.184,29.545ZM15.265,23.7a8.45,8.45,0,1,1,5.977-2.475A8.4,8.4,0,0,1,15.265,23.7Z" transform="translate(-4.5 -4.493)" fill="#fff"/>
            </svg>
          </SearchRow>
          {showCommonBases && (
            <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
          )}
        </AutoColumn>
        {searchToken && !searchTokenIsAdded ? (
          <Column style={{ padding: '20px 0', height: '100%' }}>
            <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
          </Column>
        ) : filteredSortedTokens?.length > 0 || filteredInactiveTokens?.length > 0 ? (
          <Box margin="24px 0px">
            <CurrencyList
              height={390}
              showETH={showETH}
              currencies={
                filteredInactiveTokens ? filteredSortedTokens.concat(filteredInactiveTokens) : filteredSortedTokens
              }
              breakIndex={inactiveTokens && filteredSortedTokens ? filteredSortedTokens.length : undefined}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              showImportView={showImportView}
              setImportToken={setImportToken}
            />
          </Box>
        ) : (
          <Column style={{ padding: '20px', height: '100%' }}>
            <Text color="textSubtle" textAlign="center" mb="20px">
              {t('No results found.')}
            </Text>
          </Column>
        )}
      </div>
    </>
  )
}

export default CurrencySearch
