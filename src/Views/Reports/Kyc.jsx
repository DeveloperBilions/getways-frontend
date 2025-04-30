import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { KYCReport } from "../../Utils/utils";
import { Loader } from "../Loader";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FilterListIcon from "@mui/icons-material/FilterList";
import jsPDF from "jspdf";
import { dataProvider } from "../../Provider/parseDataProvider";
import { Box, Typography } from "@mui/material";
import download from "../../Assets/icons/download.svg";

const Kyc = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState({
    kyc_expired: false,
    kyc_failed: true,
    kyc_initiated: true,
    kyc_pending: true,
    kyc_success: true,
    kyc_manual_review: true
  });
 // Calculate total of selected statuses
 const [total ,setTotal] = useState(0);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleExport = async () => {
    try {
      const response = await dataProvider.getList("kycRecords", {
        pagination: { page: 1, perPage: 100000 },
        sort: { field: "createdAt", order: "DESC" },
        filter: [],
      });
      const data = response.data.map((record) => ({
        Account: record.username,
        Email: record.email,
        Parent: record.userParentName,
        KYC_Status: record.kycStatus,
        Verified: record.kycVerified ? "Yes" : "No",
        Created_At: new Date(record.createdAt).toLocaleString(),
      }));
      const pdf = new jsPDF("l", "pt", "a4");
      pdf.autoTable({
        head: [
          [
            "No.",
            "Account",
            "Email",
            "Parent",
            "KYC Status",
            "Verified",
            "Created At",
          ],
        ],
        body: data.map((item, index) => [
          index + 1,
          item.Account,
          item.Email,
          item.Parent,
          item.KYC_Status,
          item.Verified,
          item.Created_At,
        ]),
      });
      pdf.save("KYC_Records.pdf");
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  // KYC status data in the provided format
  const fetchKycRecords = async () => {
    setLoading(true);
    const kycCalc = await KYCReport([]);
    setRawData(kycCalc.data);
    setTotal(kycCalc.total)
    setLoading(false);
  };

  useEffect(() => {
    fetchKycRecords();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const statuses = [
    { key: "kyc_expired", label: "KYC Expired", color: "#FF8042" },
    { key: "kyc_failed", label: "KYC Failed", color: "#f44336" },
    { key: "kyc_initiated", label: "KYC Initiated", color: "#FFBB28" },
    { key: "kyc_pending", label: "KYC Pending", color: "#2196f3" },
    { key: "kyc_success", label: "KYC Success", color: "#4caf50" },
    { key: "kyc_manual_review", label: "KYC Manual Review", color: "#c3e321" },
  ];

  const calculateKycData = () => {
    return statuses
      .filter((status) => selectedStatuses[status.key])
      .map((status, index) => ({
        id: index,
        value: rawData[status.key] || 0,
        label: status.label,
        color: status.color,
      }));
  };

  // Generate pie chart data using the same approach as your other reports
  const pieChartData = calculateKycData();
  // Check if data is still loading
  if (loading) {
    return <Loader />;
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "16px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
          KYC Status Overview
        </h2>

        {/* Status Filter Button */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleMenuOpen}
            sx={{
              height: "40px",
              borderRadius: "5px",
              border: "1px solid #CFD4DB",
              fontWeight: 400,
              fontSize: "14px",
              textTransform: "none",
            }}
          >
            <FilterListIcon
              sx={{ marginRight: "6px", width: "16px", height: "16px" }}
            />{" "}
            Status
          </Button>

          {/* Status Filter Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "status-filter-button",
            }}
            PaperProps={{
              sx: {
                width: "220px",
                padding: "8px",
                maxHeight: "300px",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {statuses.map((status) => (
              <MenuItem
                key={status.key}
                dense
                onClick={() => handleStatusChange(status.key)}
                sx={{ padding: "2px 16px" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedStatuses[status.key]}
                      onChange={() => {}} // Handled by MenuItem onClick
                      size="small"
                      sx={{
                        color: status.color,
                        "&.Mui-checked": {
                          color: status.color,
                        },
                      }}
                    />
                  }
                  label={status.label}
                  sx={{
                    marginRight: 0,
                    width: "100%",
                    "& .MuiFormControlLabel-label": {
                      fontSize: "14px",
                    },
                  }}
                />
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="contained"
            startIcon={<img src={download} alt="Export" />}
            onClick={handleExport}
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
              Export
            </Typography>
          </Button>
        </Box>
      </div>

      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        {pieChartData.length > 0 ? (
          <PieChart
            series={[
              {
                data: pieChartData,
                highlightScope: {
                  faded: "global",
                  highlighted: "item",
                },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
              },
            ]}
            height={400}
            width={500}
            margin={{
              top: 0,
              bottom: 100,
              left: 30,
              right: 30,
            }}
            legend={{
              direction: "row",
              position: {
                vertical: "bottom",
                horizontal: "middle",
              },
            }}
          />
        ) : (
          <div
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p>No data to display. Please select at least one status.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: "16px" }}>
        <p style={{ textAlign: "center", color: "#666" }}>
          Total Selected KYC Requests: {total}
        </p>
      </div>
    </div>
  );
};

export default Kyc;
