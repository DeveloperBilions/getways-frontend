import React, { useState, useEffect } from "react";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  TopToolbar,
  useListController,
  SearchInput,
  Filter,
} from "react-admin";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import Parse from "parse";
import CustomPagination from "../Common/CustomPagination";
import TransactionDialog from "./TransactionDialog";
import VisibilityIcon from "@mui/icons-material/Visibility";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import downloadDark from "../../Assets/icons/downloadDark.svg";
import Web3 from "web3";

const WalletAuditFilter = (props) => (
  <Filter {...props}>
    <SearchInput source="username" alwaysOn placeholder="Search by Username" />
  </Filter>
);

const API_KEY = process.env.REACT_APP_KEYBSCAN;
const CONTRACT_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const CHAIN_ID = "8453";

const CheckBalanceButton = ({ walletAddr, onResult }) => {
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!walletAddr) return;
    setLoading(true);
    try {
      const url = `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${walletAddr}&tag=latest&apikey=${API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const balance = json?.result ? parseFloat(json.result) / 1e6 : 0;
      onResult(balance);
    } catch (err) {
      console.error("Failed to fetch balance", err);
      onResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="small" onClick={handleCheck} disabled={loading}>
      {loading ? "Checking..." : "Check Balance"}
    </Button>
  );
};

const WalletAuditList = (props) => {
  const listContext = useListController(props);
  const { data, isLoading, page, perPage, total, setPage, setPerPage } =
    listContext;

  const [rowStates, setRowStates] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenDialog = (record) => {
    setSelectedUser(record); // sets selected user
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
  };
  const updateUsdc = (id, value) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        usdcBalance: value,
      },
    }));
  };

  const handleExportToExcel = async () => {
    setIsExporting(true);
  
    const API_KEY = process.env.REACT_APP_KEYBSCAN;
    const API_KEY_BSC = process.env.REACT_APP_KEYBSCAN_BSC;
    const API_KEY_ETH = process.env.REACT_APP_KEYBSCAN;
  
    const CONTRACT_BASE_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
    const CONTRACT_ETH_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const AOG_CONTRACT = "0xB32D4817908F001C2A53c15bFF8c14D8813109Be";
    const CHAIN_ID = "8453";
    const WERT_FROM_ADDRESS = "0x3f0848e336dcb0cb35f63fe10b1af2a44b8ec3e3";
  
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.exists("walletAddr");
  
      if (listContext.filterValues?.username) {
        const regex = new RegExp(listContext.filterValues.username, "i");
        userQuery.matches("username", regex);
      }
  
      const users = await userQuery.findAll({ useMasterKey: true });
      const enriched = [];
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const username = u.get("username");
        const walletAddr = u.get("walletAddr") || "";
  
        let baseUsdc = 0;
        let ethUsdc = 0;
        let linkUsdc = 0;
        let usdcBalance = 0;
        let wertTotal = 0;
        let coinbaseTotal = 0;
        let linkTotal = 0;
        let aogFromWert = 0;
  
        if (i > 0 && i % 5 === 0) await delay(1000);
  
        // Base chain USDC
        try {
          const url = `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${CONTRACT_BASE_USDC}&address=${walletAddr}&tag=latest&apikey=${API_KEY}`;
          const res = await fetch(url);
          const json = await res.json();
          baseUsdc = json?.result ? parseFloat(json.result) / 1e6 : 0;
        } catch (err) {
          console.error(`Base USDC fetch failed for ${walletAddr}`, err);
        }
  
        // ETH chain USDC
        try {
          const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokenbalance&contractaddress=${CONTRACT_ETH_USDC}&address=${walletAddr}&tag=latest&apikey=${API_KEY_ETH}`;
          const res = await fetch(url);
          const json = await res.json();
          ethUsdc = json?.result ? parseFloat(json.result) / 1e6 : 0;
          linkUsdc = ethUsdc;
        } catch (err) {
          console.error(`ETH USDC (LINK) fetch failed for ${walletAddr}`, err);
        }
  
        usdcBalance = baseUsdc + ethUsdc;
  
        // AOG from Wert (BSC)
        // try {
        //   const aogUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${AOG_CONTRACT}&address=${walletAddr}&apikey=${API_KEY_BSC}`;
        //   const res = await fetch(aogUrl);
        //   const json = await res.json();
        //   if (json?.status === "1" && Array.isArray(json.result)) {
        //     const fromWert = json.result.filter(
        //       (tx) =>
        //         tx.from.toLowerCase() === WERT_FROM_ADDRESS.toLowerCase() &&
        //         tx.to.toLowerCase() === walletAddr.toLowerCase()
        //     );
        //     aogFromWert = fromWert.reduce((sum, tx) => sum + Number(tx.value), 0) / 1e18;
        //   }
        // } catch (err) {
        //   console.error("AOG fetch failed:", err.message);
        // }
  
        // Aggregate Parse Transactions (excluding useWallet === true)
        const txAgg = await new Parse.Query("TransactionRecords").aggregate(
          [
            {
              $match: {
                userId: u.id,
                status: { $in: [2, 3] },
                $or: [
                  { useWallet: { $exists: false } },
                  { useWallet: false },
                ],
              },
            },
            {
              $addFields: {
                stripeId: {
                  $cond: [
                    { $ifNull: ["$transactionIdFromStripe", false] },
                    { $toString: "$transactionIdFromStripe" },
                    "",
                  ],
                },
                referralLink: {
                  $cond: [
                    { $ifNull: ["$referralLink", false] },
                    { $toString: "$referralLink" },
                    "",
                  ],
                },
              },
            },
            {
              $addFields: {
                mode: {
                  $cond: [
                    { $regexMatch: { input: "$stripeId", regex: "txn", options: "i" } },
                    "WERT",
                    {
                      $cond: [
                        { $regexMatch: { input: "$referralLink", regex: "pay.coinbase.com", options: "i" } },
                        "CoinBase",
                        {
                          $cond: [
                            { $regexMatch: { input: "$stripeId", regex: "crypto.link.com", options: "i" } },
                            "Link",
                            "Other",
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$mode",
                totalAmount: { $sum: "$transactionAmount" },
              },
            },
          ],
          { useMasterKey: true }
        );
  
        txAgg.forEach(({ objectId, totalAmount }) => {
          if (objectId === "WERT") wertTotal = totalAmount;
          else if (objectId === "CoinBase") coinbaseTotal = totalAmount;
          else if (objectId === "Link") linkTotal = totalAmount;
        });
  
        enriched.push({
          Username: username,
          Wallet: walletAddr,
          "WERT Total": `${wertTotal.toFixed(2)} USD`,
          "Coinbase Total": `${coinbaseTotal.toFixed(2)} USD`,
          "Link Total": `${linkTotal.toFixed(2)} USD`,
          "USDC Balance": `${usdcBalance.toFixed(2)} USD`,
          "LINK USDC Balance": `${linkUsdc.toFixed(2)} USD`,
          // AOG: `${aogFromWert.toFixed(2)} AOG`,
          // "AOG → USDC": `${aogFromWert.toFixed(2)} USD`,
          Difference: `${
            Math.abs(usdcBalance - (coinbaseTotal + linkTotal)) < 0.005
              ? "0.00"
              : (usdcBalance - (coinbaseTotal + linkTotal)).toFixed(2)
          } USD`          
        });
      }
  
      const headers = [
        "Username",
        "Wallet",
        "WERT Total",
        "Coinbase Total",
        "Link Total",
        "USDC Balance",
        "LINK USDC Balance",
        "AOG",
        "AOG → USDC",
        "Difference",
      ];
  
      const worksheet = XLSX.utils.json_to_sheet(enriched, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Wallet Audit");
  
      const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([xlsData], { type: "application/octet-stream" }),
        "WalletAuditReport.xlsx"
      );
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };
  

  const handleExportWeb3Balances = async () => {
    setIsExporting(true);

    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.exists("walletAddr");

      if (listContext.filterValues?.username) {
        const regex = new RegExp(listContext.filterValues.username, "i");
        userQuery.matches("username", regex);
      }

      const users = await userQuery.findAll({ useMasterKey: true });

      const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.REACT_APP_RPC_URL)
      );
      const USDC_ADDRESS = process.env.REACT_APP_USDC_CONTRACT;
      const USDC_ABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "decimals",
          outputs: [{ name: "", type: "uint8" }],
          type: "function",
        },
      ];
      const contract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
      const usdcDecimals = await contract.methods.decimals().call();

      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      const result = [];

      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const walletAddr = u.get("walletAddr");
        const username = u.get("username");

        let eth = "0.00",
          usdc = "0.00";

        try {
          const ethWei = await web3.eth.getBalance(walletAddr);
          eth = web3.utils.fromWei(ethWei, "ether");

          const usdcRaw = await contract.methods.balanceOf(walletAddr).call();
          usdc = (parseFloat(usdcRaw) / 10 ** usdcDecimals).toFixed(6);
        } catch (err) {
          console.error(`❌ Error fetching for ${walletAddr}`, err.message);
        }

        result.push({
          Username: username,
          Wallet: walletAddr,
          "ETH Balance": parseFloat(eth).toFixed(6),
          "USDC Balance": usdc,
        });

        if (i > 0 && i % 5 === 0) await delay(1000); // throttle
      }

      const worksheet = XLSX.utils.json_to_sheet(result, {
        header: ["Username", "Wallet", "ETH Balance", "USDC Balance"],
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Web3 Wallet Balances");
      const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      saveAs(
        new Blob([xlsData], { type: "application/octet-stream" }),
        "Web3WalletBalances.xlsx"
      );
    } catch (err) {
      console.error("❌ Web3 export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: "8px",
        }}
      >
        <Typography
          sx={{
            fontSize: "24px",
            fontWeight: 400,
            color: "var(--primary-color)",
          }}
        >
          Wallet Audit Report
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="end"
        flexDirection={{ xs: "column", sm: "row" }}
        sx={{
          mb: -5, // theme spacing unit (-1 = -8px)
          mt: 1,
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          startIcon={<img src={downloadDark} alt="Export" />}
          onClick={handleExportToExcel}
          disabled={isExporting}
          sx={{
            width: { xs: "100%", md: "auto" },
            whiteSpace: "nowrap",
            height: "40px",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--white-color)",
              textTransform: "none",
              fontFamily: "Inter",
            }}
          >
            {isExporting ? "Exporting..." : "Export to Excel"}
          </Typography>
        </Button>
      </Box>

      <List
        {...props}
        filters={<WalletAuditFilter />}
        actions={<TopToolbar />}
        pagination={false}
        sort={{ field: "createdAt", order: "DESC" }}
      >
        {isLoading ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", height: "200px" }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            <Datagrid
              bulkActionButtons={false}
              rowStyle={(record) => {
                const usdc = record.usdcBalance;
                const total = record.coinbaseTotal + record.linkTotal;

                // Only highlight if difference is significant
                if (usdc != null && Math.abs(usdc - total) >= 0.01) {
                  return { backgroundColor: "#ffe5e5" }; // light red
                }

                return {}; // no highlight
              }}
            >
              <TextField source="username" label="Username" />
              <TextField source="walletAddr" label="Wallet" />
              <FunctionField
                label="WERT Total"
                render={(record) => `${record?.wertTotal?.toFixed(2)} USD`}
              />
              <FunctionField
                label="Coinbase Total"
                render={(record) => `${record?.coinbaseTotal?.toFixed(2)} USD`}
              />
              <FunctionField
                label="Link Total"
                render={(record) => `${record?.linkTotal?.toFixed(2)} USD`}
              />
               {/* <FunctionField
                label="AOG"
                render={(record) =>
                  record?.aogFromWert != null
                    ? `${record?.aogFromWert?.toFixed(2)} AOG`
                    : "-"
                }
              /> */}
              <FunctionField
                label="USDC Balance"
                render={(record) =>
                  record?.usdcBalance != null
                    ? `${record?.usdcBalance?.toFixed(2)} USD`
                    : "-"
                }
              />
              <FunctionField
                label="LINK USDC Balance"
                render={(record) =>
                  record?.linkUsdc != null
                    ? `${record?.linkUsdc?.toFixed(2)} USD`
                    : "-"
                }
              />
             
              {/* <FunctionField
                label="AOG → USDC"
                render={(record) =>
                  record?.aogFromWert != null
                    ? `${record?.aogFromWert?.toFixed(2)} USD`
                    : "-"
                }
              /> */}
              <FunctionField
                label="Difference"
                render={(record) => {
                  const usdc = record?.usdcBalance;
                  const total = record?.coinbaseTotal + record?.linkTotal;
                  if (usdc == null) return "-";
                  let diff = usdc - total;

                  // ✅ Normalize -0 to 0
                  if (Math.abs(diff) < 0.005) diff = 0;

                  return `${diff.toFixed(2)} USD`;
                }}
              />
              <FunctionField
                label="Actions"
                render={(record) => (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenDialog(record)}
                    sx={{
                      borderColor: "black",
                      color: "black",
                      minWidth: "32px",
                      width: "32px",
                      height: "32px",
                      padding: 0,
                      borderRadius: "4px", // keep square with slight rounding
                    }}
                  >
                    <VisibilityIcon sx={{ color: "black", fontSize: 18 }} />
                  </Button>
                )}
              />

              {/* <FunctionField
                label="EtherScan Wallet"
                render={(record) => (
                  <CheckBalanceButton
                    walletAddr={record.walletAddr}
                    onResult={(balance) => updateUsdc(record.id, balance)}
                  />
                )}
              /> */}
            </Datagrid>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CustomPagination
                page={page}
                perPage={perPage}
                total={total}
                setPage={setPage}
                setPerPage={setPerPage}
              />
            </Box>
          </Box>
        )}
      </List>
      {selectedUser && (
        <TransactionDialog
          user={selectedUser}
          open={!!selectedUser}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default WalletAuditList;
