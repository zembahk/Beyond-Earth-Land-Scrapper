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
    web3()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const web3 = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setWeb3Pro(provider)
  }

  const setAddr = async () => {
    const accounts = await web3Pro!.send("eth_requestAccounts", []);
    setUserAddress(accounts)
  }

  const setBal = async () => {
    if (!userAddress) { setAddr(); return }
    const balance = await web3Pro!.getBalance('ethers.eth');
    if (!balance) { console.log('balance error'); return }
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
    return await fetch(fetchUrl, options)
      .then(response => response.json())
      .then(response => { 
        setNftList(response.result) 
        console.log('list set')
      })
      .catch(err => console.error(err));
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
    setLands(lands)
  }

  const land = () => {
    if (!lands){return <div></div>}
    const nftDiv = document.getElementById("nfts");
    nftDiv!.innerHTML = ''
    lands.forEach((land) => {
      const p = document.createElement("p");
      var mapped = land.map( (_val: any) => {
        _val += '<br>'
        return _val
      })
      p.innerHTML = mapped
      nftDiv?.appendChild(p);
    })
  }

  return (
    <div className="App">
        <header className="App-header">
        <><div id="nfts" className="nft-list"></div>
          <button onClick={setAddr} hidden={userAddress !== undefined}>Login</button>
          <button onClick={setBal} hidden={!userAddress || userAddressBalance !== undefined}>Eth Balance</button>
          <button onClick={getNFTs} hidden={nftList !== undefined || !userAddress}>Load NFTs List</button>
          <button onClick={showNFTs} hidden={lands !== undefined || !nftList}>Show BEO Land NFTs</button>
          <img src={logo} className="App-logo" alt="logo" />
          <p></p>
          {userAddress ? 'Beyond Earth Online Land NFT Scrapper' : 'Must be logged in'}
          <br></br>
          {userAddressBalance}
        </>
        </header>
        {land()}
    </div>
  );
}

export default App;