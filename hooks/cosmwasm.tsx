import { useState } from "react";
import { getKeplr, suggestChain } from "util/keplr";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { config } from "util/config";
import { GasPrice } from "@cosmjs/stargate";


import { Registry } from "@cosmjs/proto-signing";
import {
  defaultRegistryTypes as defaultStargateTypes,
} from "@cosmjs/stargate";
import { MsgBake, MsgBuyBuilding } from "protos/cookies/tx";

const myRegistry = new Registry(defaultStargateTypes);
myRegistry.register("/TheMarstonConnell.cookies.cookies.MsgBake", MsgBake); // Replace with your own type URL and Msg class
myRegistry.register("/TheMarstonConnell.cookies.cookies.MsgBuyBuilding", MsgBuyBuilding); // Replace with your own type URL and Msg class





export interface ISigningCosmWasmClientContext {
  walletAddress: string;
  signingClient: SigningCosmWasmClient | null;
  loading: boolean;
  error: any;
  connectWallet: any;
  disconnect: Function;
}

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signingClient, setSigningClient] =
    useState<SigningCosmWasmClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setLoading(true);

    try {
      const chainId = config("chainId");
      const keplr = await getKeplr();
      suggestChain();

      // enable website to access kepler
      await keplr.enable(config("chainId"));

      // get offline signer for signing txs
      const offlineSigner = await keplr.getOfflineSignerAuto(chainId);

      // make client
      const client = await SigningCosmWasmClient.connectWithSigner(
        config("rpcEndpoint"),
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(
            `${config("gasPrice")}${config("coinDenom")}`
          ),
          registry: myRegistry,
        },
      );
      setSigningClient(client);

      // get user address
      const [{ address }] = await offlineSigner.getAccounts();
      setWalletAddress(address);

      setLoading(false);
    } catch (error) {
      setError(error);
    }
  };

  const disconnect = () => {
    if (signingClient) {
      signingClient.disconnect();
    }
    setWalletAddress("");
    setSigningClient(null);
    setLoading(false);
  };

  return {
    walletAddress,
    signingClient,
    loading,
    error,
    connectWallet,
    disconnect,
  };
};

export const getNonSigningClient = async () => {
  const client = await CosmWasmClient.connect(config("rpcEndpoint"));
  return client;
};
