import { http, concatHex, createPublicClient, padHex, parseEventLogs } from "viem";
import { optimismSepolia } from "viem/chains";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "deployProxyByImplementation",
    outputs: [
      {
        internalType: "address",
        name: "deployedProxy",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "ProxyDeployed",
    type: "event",
  },
] as const;

const abi2 = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_module",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "installModule",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(import.meta.env.OP_RPC_URL),
});

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const simulate = async () => {
    try {
      const salt = concatHex(["0x0101", padHex("0x", { size: 30 })])
        .toString()
        .slice(0, -1)
        .concat("6") as `0x${string}`;
      const hash = await writeContractAsync({
        address: "0xB83db4b940e4796aA1f53DBFC824B9B1865835D5",
        abi: abi,
        functionName: "deployProxyByImplementation" as const,
        args: ["0xa6b59721ac0cad7a4f502914b5872b6782a09085", "0x", salt],
      });
      console.log("hash: ", hash);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });
      console.log("receipt: ", receipt);

      const events = parseEventLogs({ abi, logs: receipt.logs });
      const proxy = events[0]?.args?.proxy;
      console.log("proxy: ", proxy);

      const installModuleTx = await writeContractAsync({
        address: proxy,
        abi: abi2,
        functionName: "installModule" as const,
        args: ["0xB96b2328EA4946cf7785B8797a084e27e6aCf062", "0x"],
      });
      console.log("installModuleTx: ", installModuleTx);
      const receipt2 = await publicClient.waitForTransactionReceipt({
        hash: installModuleTx,
      });
      console.log("receipt2: ", receipt2);
    } catch (e) {
      console.error("error: ", e);
    }
  };

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button key={connector.uid} onClick={() => connect({ connector })} type="button">
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <button onClick={() => simulate()}>Simulate step transactions</button>
    </>
  );
}

export default App;
