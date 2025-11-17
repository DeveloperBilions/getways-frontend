import Web3 from "web3";

const web3 = new Web3(); // No provider needed for encoding only

const exactInputABI = {
  name: "exactInput",
  type: "function",
  inputs: [
    {
      name: "params",
      type: "tuple",
      components: [
        { name: "path",              type: "bytes"   },
        { name: "recipient",         type: "address" },
        { name: "deadline",          type: "uint256" }, // REQUIRED
        { name: "amountIn",          type: "uint256" },
        { name: "amountOutMinimum",  type: "uint256" },
      ],
    },
  ],
};

// export const generateScInputData = (
//   path,                    // bytes (0x...)
//   recipient,               // address
//   amountIn,                // uint256 (string or BN)
//   amountOutMinimum,        // uint256 (string or BN)
//   deadlineSeconds = Math.floor(Date.now() / 1000) + 1800 // +30 min
// ) => {
//   // Sanity checks (helpful)
//   if (!path || !path.startsWith("0x")) throw new Error("path must be 0x-prefixed hex bytes");
//   if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
//     throw new Error("recipient must be a 20-byte 0x address");
//   }

//   // IMPORTANT: pass the tuple as an array IN ORDER of components
//   const scInputData = web3.eth.abi.encodeFunctionCall(exactInputABI, [[
//     path,
//     recipient,
//     String(deadlineSeconds),
//     String(amountIn),
//     String(amountOutMinimum),
//   ]]);

//   return scInputData;
// };


export const generateScInputData = (path, recipient, amountIn, amountOutMinimum) => {
  // Helper: remove 0x prefix
  const strip0x = (hex) => hex.replace(/^0x/, "");

  // Helper: pad a hex string to 32 bytes (64 hex chars)
  const pad32 = (hex) =>
    hex.padStart(64, "0");

  // 1️⃣ Function selector (first 4 bytes)
  const selector = strip0x(path).slice(0, 8); // Example: "9d11ea6e"

  // 2️⃣ Recipient address → strip 0x → pad 32 bytes
  const recipientHex = pad32(strip0x(recipient));

  // 3️⃣ amountIn → BigInt → hex → pad 32 bytes
  const amountInHex = pad32(BigInt(amountIn).toString(16));

  // 4️⃣ amountOutMinimum → BigInt → hex → pad 32 bytes
  const amountOutMinHex = pad32(BigInt(amountOutMinimum).toString(16));

  // 5️⃣ Final concat
  const scInput =
    "0x" + selector + recipientHex + amountInHex;

  return scInput.toLowerCase();
};
