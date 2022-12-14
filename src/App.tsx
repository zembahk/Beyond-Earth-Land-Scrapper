import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers } from "ethers";


function App() {
  const [web3Pro, setWeb3Pro] = useState<ethers.providers.Web3Provider>()
  const [userAddress, setUserAddress] = useState<ethers.BigNumber[]>()
  const [userAddressBalance, setUserAddressBalance] = useState<string>()
  const [nftList, setNftList] = useState<JSON[]>()
  const [lands, setLands] = useState<any[]>()


  useEffect(() => {
    try{ window.ethereum.on('accountsChanged', function () {
      setAddr()
      setUserAddressBalance(undefined)
      setNftList(undefined)
      setLands(undefined)
    })} catch (e) {return}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const web3 = () => {
    if (!window.ethereum) { alert('use ethereum browser'); return }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setWeb3Pro(provider)
  }

  const setAddr = async () => {
    if (!web3Pro) { web3(); return }
    const accounts = await web3Pro.send("eth_requestAccounts", []);
    setUserAddress(accounts)
  }

  const setBal = async () => {
    if (!userAddress) { setAddr(); return }
    const balance = await web3Pro!.getBalance(userAddress.toString());
    if (!balance) { console.log('Balance Error'); return }
    setUserAddressBalance(ethers.utils.formatEther(balance))
  }

  const getNFTs = async () => {
    const API_KEY = process.env.REACT_APP_MORALIS_API_KEY
    const NFT_CONTRACT = '0x28c6ea3F9cF9bC1a07A828fce1e7783261691B49'
    if (!API_KEY) { alert('moralis api key not set in env'); return }
    if (!userAddress) { setAddr(); return }
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Key': API_KEY
      }
    };
    const fetchUrl = 'https://deep-index.moralis.io/api/v2/' + 
      userAddress + '/nft/' + NFT_CONTRACT + '?chain=eth&format=decimal'
    const result = await fetch(fetchUrl, options)
      .then(response => response.json())
      .then(response => { 
        if (!response.result){} else {
        setNftList(response.result) 
        console.log('List Set')
        }
      })
      .catch(err => console.error(err));
      return result
  }

  const showNFTs = async () => {
    if (!userAddress) { setAddr(); return }
    if (!nftList) { getNFTs(); return }
    let lands: any[] = []
    nftList.forEach((nft) => {
      let array: any[] = []
      const nftJson = JSON.parse(JSON.stringify(nft))
      array.push(parseInt(nftJson.token_id))
      JSON.parse(nftJson.metadata).attributes.forEach((attribute: any, index: any) => {
        const attr = JSON.parse(JSON.stringify(attribute))
        if ( attr.trait_type === 'Sector' ||
        attr.trait_type === 'Size' ||
        attr.trait_type === 'Resources' ||
        attr.trait_type === 'Companion' ||
        attr.trait_type === 'Blueprint' ||
        attr.trait_type === 'Ship' ){ array.push(attr.value) }
      })
      lands.push(array)
    })
    console.log(userAddress, nftList)
    setLands(lands)
  }

  const Land = () => {
    if (!nftList) {return <div>{ userAddress ? 'No List Loaded' : 'List Not Load' } </div>}
    if (!lands){return <div>{ nftList ? 'User Land List Loaded' : 'No Data Found' } </div>}
    const nftDiv = document.getElementById("nfts")
    nftDiv!.innerHTML = ''
    lands.forEach((land) => {
      const div = document.createElement("div")
      div.innerHTML = land
      nftDiv?.appendChild(div)
    })
    return <div>{ lands.length !== 0 ? 'Lands Loaded' : 'No Data' } </div>
  }

  return (
    <div className="App">
        <header className="App-header">
        <><div id="nfts" className="nft-list"></div>
          {userAddress ? 'Beyond Earth Online Land NFT Scrapper' : 'Must be logged in'}
          <p></p>
          <button onClick={setAddr} hidden={userAddress !== undefined }>Connect Wallet</button>
          <button onClick={getNFTs} hidden={nftList !== undefined || !userAddress}>Load NFTs List</button>
          <button onClick={showNFTs} hidden={lands !== undefined || !nftList}>Show NFTs</button>
          <button className='eth-btn' onClick={setBal} hidden={!userAddress || userAddressBalance !== undefined}>Eth Balance</button>
          <div hidden={!userAddressBalance}>
            Eth {userAddressBalance}
          </div>
          <img src={logo} className="App-logo" alt="logo" />        
          <Land />
        </>
        </header>
    </div>
  );
}

export default App;
