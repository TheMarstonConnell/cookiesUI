import type { NextPage } from "next";
import Link from "next/link";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import { MsgBake, MsgBuyBuilding } from "protos/cookies/tx";
import { useState, useEffect, MouseEvent } from "react";
import {
  convertMicroDenomToDenom,
  convertFromMicroDenom,
  convertDenomToMicroDenom,
} from "util/conversion";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";

import { QueryClientImpl } from "protos/cookies/query";
import { config } from "util/config";


const Home: NextPage = () => {
  const { walletAddress, signingClient } = useSigningClient();
  const [balance, setBalance] = useState("");
  const PUBLIC_STAKING_DENOM = process.env.NEXT_PUBLIC_STAKING_DENOM || "ucookies";
  const [loadedAt, setLoadedAt] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [costs, setCosts] = useState([0, 0, 0, 0, 0, 0, 0]);


  useEffect(() => {
    if (!signingClient || walletAddress.length === 0) {
      return;
    }

    const interval = setInterval(() => setLoadedAt(new Date()), 2500);

    for (let index = 0; index < 8; index++) {
      getQuerier().then((q) => {
        let queryService = q as QueryClientImpl
        // Now you can use this service to submit queries
        const queryResult = queryService.GetCost({
          address: walletAddress,
          building: index.toString()
        });
  
        queryResult.then((r) => {
          costs[index] = r.cost
          setCosts(costs)
        })
      })
      
    }
    

    
    

    signingClient
      .getBalance(walletAddress, PUBLIC_STAKING_DENOM)
      .then((response: any) => {
        const { amount, denom }: { amount: number; denom: string } = response;
        setBalance(
          `${convertMicroDenomToDenom(amount)} ${convertFromMicroDenom(denom)}`
        );
      })
      .catch((error) => {
        console.log("Error signingClient.getBalance(): ", error);
      });

    return () => {
      clearInterval(interval);
    };
  }, [signingClient, walletAddress, loadedAt]);

  const getQuerier = () => {
    return new Promise(async (resolve, reject) => {    
      const tendermintClient = await Tendermint34Client.connect(config("rpcEndpoint"));
      // The generic Stargate query client knows how to use the Tendermint client to submit unverified ABCI queries
      const queryClient = new QueryClient(tendermintClient);

      // This helper function wraps the generic Stargate query client for use by the specific generated query client
      const rpcClient = createProtobufRpcClient(queryClient);

      // Here we instantiate a specific query client which will have the custom methods defined in the .proto file
      const queryService = new QueryClientImpl(rpcClient);

      resolve(queryService)
    });

  }

  const clickCookie = () => {
    setLoading(true);
    const message = {
      typeUrl: "/TheMarstonConnell.cookies.cookies.MsgBake", // Same as above
      value: MsgBake.fromPartial({
        creator: walletAddress
      }),
    };

    signingClient?.signAndBroadcast(walletAddress, [message], "auto").then((tx) => {
      setLoadedAt(new Date());
      setLoading(false);

    }).catch((err) => {
      setLoading(false);
      console.error(err)
    })

  }

  const buy = (type : Number) => {
    setLoading(true);
    const message = {
      typeUrl: "/TheMarstonConnell.cookies.cookies.MsgBuyBuilding", // Same as above
      value: MsgBuyBuilding.fromPartial({
        creator: walletAddress,
        building: type.toString(),
      }),
    };

    signingClient?.signAndBroadcast(walletAddress, [message], "auto").then((tx) => {
      setLoadedAt(new Date());
      setLoading(false);

    }).catch((err) => {
      setLoading(false);
      
      console.error(err)
    })

  }

  let btn_style = (i : number) => { 
    let b = parseInt(balance)
    console.log(b)
    let c = costs[i]
    c = c / 1000000
    
    console.log(c)
    let afford =  b > c
    console.log(afford)
    return `btn btn-primary h-24 box-border p-6 ${afford ? "" : "btn-outline"}`
  }

  return (
    <WalletLoader>
      <h1 className="text-6xl font-bold">
        Satoshi's Bakery
      </h1>


      <p className="text-2xl">Your wallet has {balance}S</p>
      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <button
          className={"p-6 mt-6 text-center border border-secondary hover:border-primary w-96 rounded-xl focus:text-primary-focus" + (loading ? "" : " hover:text-primary") + ""}
          onClick={clickCookie}
          disabled={loading}
        >{loading ? "..." : "Click"}</button>
      </div>
      <h2 className="text-3xl font-bold mt-6">
        Store
      </h2>
      <div className="mt-4 grid gap-4 grid-cols-4 max-w-4xl max-w-full sm:w-full">
      <button
          className={btn_style(0)}
          onClick={() => {buy(0)}}
          disabled={loading}
        >{loading ? "..." : `Assistant (${convertMicroDenomToDenom(costs[0])})`}</button>
         <button
          className={btn_style(1)}
          onClick={() => {buy(1)}}
          disabled={loading}
        >{loading ? "..." : `Oven (${convertMicroDenomToDenom(costs[1])})`}</button>
        <button
          className={btn_style(2)}
          onClick={() => {buy(2)}}
          disabled={loading}
        >{loading ? "..." : `Bakery (${convertMicroDenomToDenom(costs[2])})`}</button>
        <button
          className={btn_style(3)}
          onClick={() => {buy(3)}}
          disabled={loading}
        >{loading ? "..." : `Factory (${convertMicroDenomToDenom(costs[3])})`}</button>
        <button
          className={btn_style(4)}
          onClick={() => {buy(4)}}
          disabled={loading}
        >{loading ? "..." : `Campus (${convertMicroDenomToDenom(costs[4])})`}</button>
        <button
          className={btn_style(5)}
          onClick={() => {buy(5)}}
          disabled={loading}
        >{loading ? "..." : `Power Plant (${convertMicroDenomToDenom(costs[5])})`}</button>
        <button
          className={btn_style(6)}
          onClick={() => {buy(6)}}
          disabled={loading}
        >{loading ? "..." : `Robots (${convertMicroDenomToDenom(costs[6])})`}</button>
        <button
          className={btn_style(7)}
          onClick={() => {buy(7)}}
          disabled={loading}
        >{loading ? "..." : `Quantum Oven (${convertMicroDenomToDenom(costs[7])})`}</button>
      </div>
    </WalletLoader>
  );
};

export default Home;
