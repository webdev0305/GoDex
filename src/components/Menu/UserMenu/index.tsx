import React from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  Button,
  CopyIcon,
  Flex,
  Heading,
  LogoutIcon,
  Text,
  useMatchBreakpoints,
  // useModal,
  UserMenu as UIKitUserMenu,
  // UserMenuDivider,
  // UserMenuItem,
  WarningIcon,
} from '@pancakeswap/uikit'
// import history from 'routerHistory'
import useAuth from 'hooks/useAuth'
import { formatBigNumber, getFullDisplayBalance, formatLocalisedCompactNumber, getBalanceNumber, formatNumber } from 'utils/formatBalance'
// import { useProfile } from 'state/profile/hooks'
import ConnectWalletButton from 'components/ConnectWalletButton'
import useTokenBalance, { FetchStatus, useGetBnbBalance,  } from 'hooks/useTokenBalance'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import { usePriceCakeBusd, useFarmUser, useFarms } from 'state/farms/hooks'
import { useFetchUserPools, usePools } from 'state/pools/hooks'
import useFarmsWithBalance from 'views/Home/hooks/useFarmsWithBalance'

const UserMenu = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { logout } = useAuth()
  const {earningsSum} =  useFarmsWithBalance()
  const cakePriceUsd = usePriceCakeBusd()
  
  const { balance: cakeBalance, fetchStatus: cakeFetchStatus } = useTokenBalance(tokens.cake.address)
  useFetchUserPools(account)
  const { pools: poolsWithoutAutoVault, userDataLoaded } = usePools()
  const pooledBalance = userDataLoaded?getBalanceNumber(poolsWithoutAutoVault[0].userData.stakedBalance):0
  // const harvestable = userDataLoaded?getBalanceNumber(poolsWithoutAutoVault[0].userData.pendingReward):0
  const { isMobile } = useMatchBreakpoints()

  if (!account) {
    if (isMobile)
      return <ConnectWalletButton scale={isMobile ? "sm" : "md"} style={{ borderRadius: '25px' }} />
    return <Flex alignItems="center" background="#273043" borderRadius="25px">
      <span style={{ display: 'inline-block', width: '0.4em', height: '0.4em', background: '#1EBF8D', borderRadius: '50%', marginLeft: '1em' }} />
      <Text color="white" pr="1em" pl="0.6em">BSC</Text>
      <ConnectWalletButton scale="md" style={{ borderRadius: '25px' }} />
    </Flex>
  }

  const copyAddress = () => {
    const el = document.createElement("textarea");
    el.value = account;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  return (
    <UIKitUserMenu account={account} >
      {/* <Heading as="div" scale="lg" style={{fontSize:"20px", marginBottom: "18px"}}>
        a
      </Heading> */}
      <Flex justifyContent="space-between" mt="8px" style={{padding: "12px", backgroundColor: "#36425A", borderRadius: "20px", margin: "-10px -10px 0 -10px"}}>
        <Heading textTransform="uppercase" style={{fontSize:"18px", margin: "auto"}}>{account ? `${account.substring(0, 10)}...${account.substring(account.length - 15)}` : null}</Heading>
        <Button padding="0" height="auto" variant="tertiary" onClick={copyAddress}>
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.788 16.757H8.394C8.02429 16.757 7.66972 16.6101 7.40829 16.3487C7.14687 16.0873 7 15.7327 7 15.363V8.394C7 8.02429 7.14687 7.66972 7.40829 7.40829C7.66972 7.14687 8.02429 7 8.394 7H15.363C15.7327 7 16.0873 7.14687 16.3487 7.40829C16.6101 7.66972 16.757 8.02429 16.757 8.394V9.788" stroke="#53F3C3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.558 9.78799H18.775C18.9792 9.78799 19.175 9.86912 19.3194 10.0135C19.4638 10.1579 19.545 10.3538 19.545 10.558V18.775C19.545 18.9792 19.4638 19.1751 19.3194 19.3195C19.175 19.4639 18.9792 19.545 18.775 19.545H10.558C10.3537 19.545 10.1579 19.4639 10.0135 19.3195C9.86909 19.1751 9.78796 18.9792 9.78796 18.775V10.558C9.78796 10.3538 9.86909 10.1579 10.0135 10.0135C10.1579 9.86912 10.3537 9.78799 10.558 9.78799V9.78799Z" stroke="#53F3C3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path opacity="0.3" d="M27 13.5C27 6.04416 20.9558 0 13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27C20.9558 27 27 20.9558 27 13.5Z" fill="#1EBF8D"/>
        </svg>

        </Button>
      </Flex>
      <Flex justifyContent="space-between" style={{padding: "15px", backgroundColor: "#36425A", borderRadius: "20px", margin: "10px -10px 10px -10px", backgroundImage: "url(/images/usermenu_back.svg)", height: "110px", flexDirection: 'column'}}>
        {/* <img src='/images/usermenu_back.svg' alt='svg' /> */}
        <Heading style={{ flex: 1, fontSize:"18px", display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          Total Balance
        </Heading>
          <Text color="primary" pl="5px" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',fontSize: '20px', fontWeight: 600}}>
            {getBalanceNumber(cakeBalance,18).toFixed(3)} GO
          </Text>
          <Text color="primary" pl="5px" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color:'#4299E1'}}>
            ~${(getBalanceNumber(cakeBalance,18) * cakePriceUsd.toNumber()).toFixed(3)}
          </Text>
      </Flex>
      <Flex justifyContent="space-between" mt="8px">
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.3" d="M15.5 31C24.0604 31 31 24.0604 31 15.5C31 6.93959 24.0604 0 15.5 0C6.93959 0 0 6.93959 0 15.5C0 24.0604 6.93959 31 15.5 31Z" fill="#E76061"/>
            <path d="M21.5361 14.4032H20.7131V11.9332C20.7131 10.5508 20.1639 9.22494 19.1864 8.24741C18.2089 7.26988 16.883 6.7207 15.5006 6.7207C14.1182 6.7207 12.7923 7.26988 11.8148 8.24741C10.8373 9.22494 10.2881 10.5508 10.2881 11.9332V14.4032H9.46509C9.02855 14.4032 8.60988 14.5766 8.30119 14.8853C7.99251 15.194 7.81909 15.6127 7.81909 16.0492V22.6332C7.81909 23.0697 7.99251 23.4884 8.30119 23.7971C8.60988 24.1058 9.02855 24.2792 9.46509 24.2792H21.5361C21.9726 24.2792 22.3913 24.1058 22.7 23.7971C23.0087 23.4884 23.1821 23.0697 23.1821 22.6332V16.0492C23.1821 15.6127 23.0087 15.194 22.7 14.8853C22.3913 14.5766 21.9726 14.4032 21.5361 14.4032ZM17.9701 14.4032H13.0311V11.9332C13.0311 11.2784 13.2912 10.6504 13.7542 10.1874C14.2173 9.72433 14.8453 9.4642 15.5001 9.4642C16.1549 9.4642 16.7829 9.72433 17.2459 10.1874C17.709 10.6504 17.9691 11.2784 17.9691 11.9332L17.9701 14.4032Z" fill="#E67171"/>
            <path d="M15.5008 20.9193C16.2491 20.9193 16.8558 19.9084 16.8558 18.6613C16.8558 17.4143 16.2491 16.4033 15.5008 16.4033C14.7524 16.4033 14.1458 17.4143 14.1458 18.6613C14.1458 19.9084 14.7524 20.9193 15.5008 20.9193Z" fill="#613E4C"/>
          </svg>
          <Text style={{ fontSize:"14px", margin: '3px 5px'}}>
            Pooled Balance
          </Text>
        </div>
        <div>
          <Text color="primary" pl="5px" style={{ fontSize: '14px', fontWeight: 600}}>
            <span style={{color:'white'}}>{formatNumber(pooledBalance,2)}</span> GO
          </Text>
          <Text color="primary" pl="5px" style={{color:'#4299E1', float: 'right'}}>
            ~${formatNumber(pooledBalance * cakePriceUsd.toNumber(),2)}
          </Text>
        </div>
      </Flex>
      <Flex justifyContent="space-between" mt="8px">
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.3" d="M15.5 31C24.0604 31 31 24.0604 31 15.5C31 6.93959 24.0604 0 15.5 0C6.93959 0 0 6.93959 0 15.5C0 24.0604 6.93959 31 15.5 31Z" fill="#1EBF8D"/>
            <path d="M22.122 7H8.88102C8.63374 7.00025 8.38895 7.04945 8.16077 7.14474C7.93259 7.24004 7.72552 7.37955 7.55151 7.55524C7.37749 7.73093 7.23997 7.93932 7.14686 8.1684C7.05375 8.39748 7.00691 8.64273 7.00902 8.89L7.00002 22.122C6.99896 22.3697 7.04683 22.6152 7.14088 22.8444C7.23492 23.0736 7.37329 23.282 7.54805 23.4576C7.72281 23.6332 7.93052 23.7726 8.15926 23.8677C8.388 23.9628 8.63328 24.0119 8.88102 24.012H22.122C22.6225 24.0094 23.1017 23.8094 23.4555 23.4555C23.8094 23.1017 24.0094 22.6224 24.012 22.122V8.89C24.0094 8.38955 23.8094 7.91035 23.4555 7.55647C23.1017 7.20259 22.6225 7.00263 22.122 7ZM22.122 18.342H18.342C18.342 19.094 18.0433 19.8152 17.5115 20.347C16.9798 20.8788 16.2585 21.1775 15.5065 21.1775C14.7545 21.1775 14.0333 20.8788 13.5015 20.347C12.9698 19.8152 12.671 19.094 12.671 18.342H8.88102V8.89H22.122V18.342ZM19.287 13.616H17.4V10.781H13.616V13.616H11.726L15.506 17.4L19.287 13.616Z" fill="#53F3C3"/>
          </svg>
          <Text style={{ fontSize:"14px", margin: '3px 5px'}}>
            Harvest
          </Text>
        </div>
        <div>
          <Text color="primary" pl="5px" style={{ fontSize: '14px', fontWeight: 600}}>
            <span style={{color:'white'}}>{earningsSum?formatNumber(earningsSum,2):0}</span> GO
          </Text>
          <Text color="primary" pl="5px" style={{color:'#4299E1', float: 'right'}}>
            ~${earningsSum?formatNumber(earningsSum * cakePriceUsd.toNumber(),2):0}
          </Text>
        </div>
      </Flex>
      <hr style={{border: '1px solid #36425A', marginBlock: '15px'}}/>
      {/* <Button variant="primary" onClick={logout} width="100%"> */}
        <Flex alignItems="center" onClick={logout} style={{alignItems: 'center', flexDirection: 'column', marginBottom: '-10px'}}>
          <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#E76061'}}>
            <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M15.5 31C24.0604 31 31 24.0604 31 15.5C31 6.93959 24.0604 0 15.5 0C6.93959 0 0 6.93959 0 15.5C0 24.0604 6.93959 31 15.5 31Z" fill="#E76061"/>
              <path d="M13.8739 18.1659L15.0739 19.3659L19.3539 15.0859L15.0739 10.8059L13.8739 12.0059L16.0959 14.2279H7.7959V15.9399H16.0559L13.8739 18.1659ZM21.4959 7.37988H9.5079C9.05425 7.3812 8.61957 7.562 8.29879 7.88277C7.97801 8.20355 7.79722 8.63824 7.7959 9.09188V12.5159H9.5079V9.09188H21.4959V21.0799H9.5079V17.6519H7.7959V21.0799C7.79722 21.5335 7.97801 21.9682 8.29879 22.289C8.61957 22.6098 9.05425 22.7906 9.5079 22.7919H21.4959C21.9488 22.7895 22.3825 22.6083 22.7024 22.2876C23.0223 21.9669 23.2026 21.5328 23.2039 21.0799V9.09188C23.2026 8.63893 23.0223 8.20484 22.7024 7.88418C22.3825 7.56351 21.9488 7.38226 21.4959 7.37988Z" fill="#E76061"/>
            </svg>
            <span style={{marginLeft: '10px'}}>{t('Disconnect')}</span>
          </div>
        </Flex>
      {/* </Button> */}
    </UIKitUserMenu>
  )
}

export default UserMenu
