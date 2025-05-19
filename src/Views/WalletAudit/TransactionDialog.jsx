import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import Parse from "parse";
import CloseIcon from "@mui/icons-material/Close";

const getModeFromTransaction = (tx) => {
  const stripeId = tx.get("transactionIdFromStripe") || "";
  const referralLink = tx.get("referralLink") || "";

  if (/txn/i.test(stripeId)) return "WERT";
  if (/pay\.coinbase\.com/i.test(referralLink)) return "CoinBase";
  if (/crypto\.link\.com/i.test(stripeId)) return "Link";
  return "Other";
};

const TransactionDialog = ({ user, open, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    const query = new Parse.Query("TransactionRecords");
    query.equalTo("userId", user.id);
    query.containedIn("status", [2, 3]);

    if (statusFilter !== "") {
      query.equalTo("status", parseInt(statusFilter));
    }

    query.limit(rowsPerPage * 5); // Fetch more to filter on client side if needed
    query.skip(page * rowsPerPage);
    query.descending("createdAt");

    try {
      const results = await query.find({ useMasterKey: true });

      // Map with derived mode
      const allMapped = results.map((tx) => {
        const mode = getModeFromTransaction(tx);
        return {
          id: tx.id,
          amount: tx.get("transactionAmount") ?? 0,
          status: tx.get("status") ?? "-",
          mode,
          createdAt: tx.createdAt?.toLocaleString() ?? "-",
          transactionHash: tx.get("transactionHash") ?? "",
          referralLink: tx.get("referralLink") ?? "",
          transactionIdFromStripe: tx.get("transactionIdFromStripe") ?? ""
        };
      });

      // Apply mode filter on client side
      const filtered = modeFilter
        ? allMapped.filter((row) => row.mode === modeFilter)
        : allMapped;

      // Paginate client-side after filtering (if needed)
      setTotal(filtered.length);
      setTransactions(filtered.slice(0, rowsPerPage));
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, statusFilter, modeFilter, page, rowsPerPage]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 1,
        }}
      >
        Transactions for {user?.username}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} mb={2} mt={2}>
          {/* <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              fullWidth
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="2">Completed</MenuItem>
              <MenuItem value="3">Failed</MenuItem>
            </TextField>
   */}
          <TextField
            select
            label="Mode"
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(0);
            }}
            fullWidth
          >
            <MenuItem value="">All Modes</MenuItem>
            <MenuItem value="WERT">WERT</MenuItem>
            <MenuItem value="CoinBase">CoinBase</MenuItem>
            <MenuItem value="Link">Link</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Box>

        {loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        ) : transactions.length === 0 ? (
          <Typography align="center" sx={{ mt: 2 }}>
            No transactions found.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Amount</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Mode</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Confirmation Link</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.amount.toFixed(2)}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.mode}</TableCell>{" "}
                      <TableCell>
                        {![2, 3].includes(row.status) ||
                        (!row.referralLink
                          ?.toLowerCase()
                          .includes("crypto.link.com") &&
                          !row.referralLink
                            ?.toLowerCase()
                            .includes("pay.coinbase.com")) ? (
                          "N/A"
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              color: row.transactionHash ? "#1976D2" : "gray",
                              textDecoration: row.transactionHash
                                ? "underline"
                                : "none",
                              fontWeight: 500,
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: row.transactionHash
                                ? "1px solid #1976D2"
                                : "1px solid #C4C4C4",
                              backgroundColor: row.transactionHash
                                ? "#E3F2FD"
                                : "#f5f5f5",
                              "&:hover": {
                                backgroundColor: row.transactionHash
                                  ? "#BBDEFB"
                                  : "#f5f5f5",
                              },
                              minWidth: "120px",
                            }}
                            onClick={() => {
                              let link = "#";
                              if (
                                row.referralLink
                                  .toLowerCase()
                                  .includes("crypto.link.com")
                              ) {
                                link = `https://etherscan.io/tx/${row.transactionHash}`;
                              } else if (
                                row.referralLink
                                  .toLowerCase()
                                  .includes("pay.coinbase.com")
                              ) {
                                link = `https://basescan.org/tx/${row.transactionHash}`;
                              }
                              if (link !== "#") window.open(link, "_blank");
                            }}
                            disabled={!row.transactionHash}
                          >
                            Check Transaction
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{row.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDialog;
