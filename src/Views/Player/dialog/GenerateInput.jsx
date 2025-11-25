import Web3 from "web3";

const web3 = new Web3(); // No provider needed for encoding only

// export const generateScInputData = (
//   path,
//   recipient,
//   amountIn,
//   amountOutMinimum
// ) => {
//   // Define the exactInput ABI
//   const exactInputABI = {
//     name: "exactInput",
//     type: "function",
//     inputs: [
//       {
//         type: "tuple",
//         name: "params",
//         components: [
//           { type: "bytes", name: "path" },
//           { type: "address", name: "recipient" },
//           { type: "uint256", name: "amountIn" },
//           { type: "uint256", name: "amountOutMinimum" },
//         ],
//       },
//     ],
//   };

//   // Encode the function call using the exactInput ABI and provided values
//   const scInputData = web3.eth.abi.encodeFunctionCall(exactInputABI, [
//     {
//       path,
//       recipient,
//       amountIn,
//       amountOutMinimum,
//     },
//   ]);

//   console.log("Encoded sc_input_data:", scInputData);
//   return scInputData;
// };

export const generateScInputData =  ( path,
  recipient,
  amountIn, 
  amountOutMinimum,   ) => {
  const rawUsdcAmount = (amountIn * 10**6).toString();
  const scInputData = web3.eth.abi.encodeFunctionCall({
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "usdcAmount",
        "type": "uint256"
      }
    ],
    "name": "buyAOG",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, [recipient, amountIn])
  return scInputData
  }