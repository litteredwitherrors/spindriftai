import React, {useState, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Chat from './Chat';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import { ethers } from 'ethers';
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
} from '@aave/contract-helpers';
import { 
  formatUserSummary,
  formatReserves 
} from '@aave/math-utils';
import dayjs from 'dayjs';
import * as markets from '@bgd-labs/aave-address-book';  

const Spindrift = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [connectButtonText, setConnectButtonText] = useState('Connect a Wallet');

  const [reserves, setReserves] = useState([]);

  const connectWalletHandler = () => {
    if (window.ethereum) {
      window.ethereum.request({method: 'eth_requestAccounts'})
        .then(result => {
          accountChangedHandler(result[0])
          setConnectButtonText(result[0]);
        })
        .catch(error => {
          setErrorMessage(error.message);
        })
    } else {
      setConnectButtonText('No wallet found');
      setErrorMessage('Install a wallet browser extension');
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
  }

  window.ethereum.on('accountsChanged', accountChangedHandler);

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.mainnet,
  });

  async function fetchContractData() {
    // Object containing array of pool reserves and market base currency data
    // { reservesArray, baseCurrencyData }
    const reserves = await poolDataProviderContract.getReservesHumanized({
      lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    });

    // Object containing array or users aave positions and active eMode category
    // { userReserves, userEmodeCategoryId }
    const userReserves = await poolDataProviderContract.getUserReservesHumanized({
      lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
      user: defaultAccount,
    });

    // console.log({ reserves, userReserves});

    const reservesArray = reserves.reservesData;
    const baseCurrencyData = reserves.baseCurrencyData;
    const userReservesArray = userReserves.userReserves;

    const currentTimestamp = dayjs().unix();

    const formattedPoolReserves = formatReserves({
      reserves: reservesArray, currentTimestamp,
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    })

    setReserves(formattedPoolReserves);
  }

  useEffect(() => {
    if (defaultAccount) {
      fetchContractData();
    }
  }, [defaultAccount]);

  const reservesList = reserves.map(reserve => 
    <ListItem key={reserve.id}>
      {reserve.name}
      {/* {reserve.id} */}
    </ListItem>  
  )

  let walletButton;

  if (defaultAccount) {
    walletButton = <Button onClick={connectWalletHandler} variant="contained">{connectButtonText}</Button>
  } else {
    walletButton = <Button onClick={connectWalletHandler} variant="contained">{connectButtonText}</Button>
  }

  return (
    <div>
      <AppBar sx={{
        backgroundColor: '#383D51',
        padding: '10px',
        marginBottom: '16px'
      }} position="static">
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <h3>
            SpindriftAI
          </h3>
          {walletButton}
        </Box>
      </AppBar>
      <Container maxWidth="sm">
        <Chat></Chat>
        <h3>Current Assets</h3>
        <List>
          {reservesList}
        </List>
      </Container>
    </div>
  )
}

export default Spindrift;