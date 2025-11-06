import Web3 from "web3";

const web3 = new Web3(); // No provider needed for encoding only

export const generateScInputData = (path, recipient, amountIn, amountOutMinimum) => {
  // Flat-args ABI (no tuple)
  const exactInputABI = {
    name: "exactInput",
    type: "function",
    inputs: [
      { type: "bytes",   name: "path" },
      { type: "address", name: "recipient" },
      { type: "uint256", name: "amountIn" },
      { type: "uint256", name: "amountOutMinimum" },
    ],
  };
  const scInputData = web3.eth.abi.encodeFunctionCall(exactInputABI, [
    path,
    recipient,
    amountIn,          // decimal string or hex string ok
    amountOutMinimum,  // decimal string or hex string ok
  ]);

  console.log("Encoded sc_input_data:", scInputData);
  return scInputData;
};
