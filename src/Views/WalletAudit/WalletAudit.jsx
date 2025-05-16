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

const WalletAuditFilter = (props) => (
  <Filter {...props}>
    <SearchInput source="username" alwaysOn placeholder="Search by Username" />
  </Filter>
);

const API_KEY = "F7TE3VRA95UZ8RN4V7V3F94RAQD7968B5X";
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
                const total = record.coinbaseTotal;

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
                render={(record) => `${record.wertTotal.toFixed(2)} USD`}
              />
              <FunctionField
                label="Coinbase Total"
                render={(record) => `${record.coinbaseTotal.toFixed(2)} USD`}
              />
              <FunctionField
                label="Link Total"
                render={(record) => `${record.linkTotal.toFixed(2)} USD`}
              />
              <FunctionField
                label="USDC Balance"
                render={(record) =>
                  record.usdcBalance != null
                    ? `${record.usdcBalance.toFixed(2)} USD`
                    : "-"
                }
              />
              <FunctionField
                label="Difference"
                render={(record) => {
                  const usdc = record.usdcBalance;
                  const total = record.coinbaseTotal;
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
