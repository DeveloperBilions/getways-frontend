import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TablePagination,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Parse from "parse";
import { useGetIdentity } from "react-admin";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import Back Icon
import { useNavigate } from "react-router-dom";

Parse.initialize(
  process.env.REACT_APP_APPID,
  process.env.REACT_APP_JAVASCRIPT_KEY,
  process.env.REACT_APP_MASTER_KEY
);
Parse.serverURL = process.env.REACT_APP_URL;
Parse.masterKey = process.env.REACT_APP_MASTER_KEY;

const GiftCardHistory = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [giftCards, setGiftCards] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { identity } = useGetIdentity();

  useEffect(() => {
    if (identity && identity.objectId) {
      setUserId(identity.objectId);
      fetchGiftCardHistory(identity.objectId, 0, rowsPerPage);
    }
  }, [identity, rowsPerPage]);

  const fetchGiftCardHistory = async (id, currentPage, pageSize) => {
    setLoading(true);
    try {
      const query = new Parse.Query("GiftCardHistory");
      query.equalTo("userId", id);
      query.descending("createdAt");
      query.skip(currentPage * pageSize);
      query.limit(pageSize);
      const results = await query.find({ useMasterKey: true });

      const countQuery = new Parse.Query("GiftCardHistory");
      countQuery.equalTo("userId", id);
      const total = await countQuery.count({ useMasterKey: true });

      setGiftCards(results.map((record) => record.toJSON()));
      setTotalCount(total);
    } catch (error) {
      console.error("Error fetching gift card history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchGiftCardHistory(userId, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0);
    fetchGiftCardHistory(userId, 0, newSize);
  };

  return (
    <Box sx={{ p: 3 }}>
        <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />} // Add Back Arrow Icon
          onClick={() => navigate(-1)} // Navigate back to the previous page
          
        >
          Back
        </Button>
      </div>

      <Typography variant="h5" mb={2}>
        Gift Card History
      </Typography>

      {/* <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => fetchGiftCardHistory(userId, page, rowsPerPage)}
        sx={{ mb: 2 }}
      >
        Refresh
      </Button> */}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Price </TableCell>
                <TableCell>Product Name </TableCell>

                <TableCell>Issued At</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {giftCards.length > 0 ? (
                giftCards.map((card) => (
                  <TableRow key={card.objectId}>
                    <TableCell>{card.orderId}</TableCell>
                    <TableCell>{card.productId}</TableCell>
                    <TableCell>{card.price}</TableCell>
                    <TableCell>{card.apiResponse?.productName}</TableCell>

                    <TableCell>
                      {new Date(card.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{card.status || "Issued"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No gift card history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}
    </Box>
  );
};

export default GiftCardHistory;