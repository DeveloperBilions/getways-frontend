import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  Typography,
} from "@mui/material";
import { fetchDrawerAgentHistory } from "../../../Utils/utils";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

const DrawerAgentHistoryModal = ({ open, onClose, record }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      if (open && record) {
        setLoading(true);
        try {
          const { data, total } = await fetchDrawerAgentHistory(
            record?.id,
            page,
            rowsPerPage
          );
          setHistory(data || []);
          setTotalRecords(total);
        } catch (error) {
          console.error("Error fetching drawer history:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHistory();
  }, [open, record, page, rowsPerPage]); // Refetch when page or rowsPerPage changes

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 1,
        }}
      >
        Drawer Agent ({record?.username}) History
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "auto", mt: 2 }} />
        ) : history.length > 0 ? (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Before Balance</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Amount</strong>
                    </TableCell>
                    <TableCell>
                      <strong>After Balance</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.beforeBalance.toFixed(2)}</TableCell>
                      <TableCell>{item.amount.toFixed(2)}</TableCell>
                      <TableCell>{item.afterBalance.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Typography sx={{ textAlign: "center", mt: 2 }}>
            No history found.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrawerAgentHistoryModal;
