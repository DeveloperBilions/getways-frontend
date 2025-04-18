import Web3 from "web3";

const web3 = new Web3(); // No provider needed for encoding only

export const generateScInputData = (userAddress, amount) => {
  const encodedData = web3.eth.abi.encodeFunctionCall(
    {
      name: "mintNFT",
      type: "function",
      stateMutability: "payable",
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "numberOfTokens",
          type: "uint256",
        },
      ],
      outputs: [],
    },
    [userAddress, amount]
  );

  console.log("Encoded sc_input_data:", encodedData);
  return encodedData;
};
