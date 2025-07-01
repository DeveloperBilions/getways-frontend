import React, { useState } from "react";
import {
  Datagrid,
  List,
  TextField,
  SearchInput,
  TopToolbar,
  useListController,
  DateField,
  FunctionField,
  usePermissions,
} from "react-admin";
import {
  Box,
  Typography,
  Button,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import "jspdf-autotable";
import CustomPagination from "../Common/CustomPagination";
import tick from "../../Assets/icons/tick.svg";
import jsPDF from "jspdf";
import download from "../../Assets/icons/download.svg";
import { dataProvider } from "../../Provider/parseDataProvider";

const statusChoices = [
  { id: "kyc_success", name: "KYC Success" },
  { id: "kyc_pending", name: "KYC Pending" },
  { id: "kyc_failed", name: "KYC Failed" },
  { id: "kyc_expired", name: "KYC Expired" },
];

export const KycRecordsList = (props) => {
  const listContext = useListController(props);
  const {
    isLoading,
    filterValues,
    setFilters,
    page,
    perPage,
    total,
    setPage,
    setPerPage,
  } = listContext;

  const [menuAnchor, setMenuAnchor] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const { permissions } = usePermissions();
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExport = async () => {
    try {
      const response = await dataProvider.getList("kycRecords", {
        pagination: { page: 1, perPage: 100000 },
        sort: { field: "createdAt", order: "DESC" },
        filter: filterValues,
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

  const postListActions = (
    <TopToolbar
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        width: { xs: "100%", sm: "auto" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          // flexDirection: { xs: "column", sm: "row" }, // Stack elements on small screens
          alignItems: "space-between",
          justifyContent: isMobile ? "space-between" : "flex-end",
          gap: 2, // Add space between buttons
          // p: { xs: 1, sm: 2 }, // Adjust padding for different screen sizes
          width: "100%",
        }}
      >
        {isMobile && (
          <Box>
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: 400,
                color: "var(--primary-color)",
              }}
            >
              Kyc Record
            </Typography>
          </Box>
        )}
        {permissions !== "Player" && (
          <>
            {isMobile ? (
              <Box
                onClick={handleExport}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "var(--primary-color)",
                  color: "var(--secondary-color)",
                  width: "60px",
                  height: "40px",
                  borderRadius: "4px",
                }}
              >
                <img src={download} alt="Add User" width="20px" height="20px" />
              </Box>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={
                  <img
                    src={download}
                    alt="Add User"
                    width="20px"
                    height="20px"
                  />
                }
                onClick={handleExport}
                sx={{
                  width: { xs: "100%", sm: "119px" },
                  height: { xs: "100%", sm: "40px" },
                  backgroundColor: "var(--primary-color)",
                  color: "var(--secondary-color)",
                  mb: "1px",
                  ml: "8px",
                }} // Full width on small screens
              >
                <Typography
                  sx={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "var(--secondary-color)",
                    textTransform: "none",
                  }}
                >
                  Export
                </Typography>
              </Button>
            )}
          </>
        )}
      </Box>
    </TopToolbar>
  );

  const filters = [
    <Box
      key="search-filter"
      sx={{
        display: "flex",
        flexDirection: {
          sm: "row",
        },
        "@media (max-width:536px)": {
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        },
        alignItems: "end",
        justifyContent: "flex-start",
        flexWrap: "nowrap",
        overflowX: "auto",
        gap: 2,
        width: "100%",
        mb: 0.5,
      }}
      alwaysOn
    >
      <SearchInput
        source="email"
        alwaysOn
        placeholder="Search Email"
        resettable
        sx={{
          minWidth: "200px",
          "@media (max-width:536px)": {
            width: "100%",
          },
          height: "40px",
          "& .MuiInputBase-root": {
            height: "40px",
          },
        }}
      />
      <SearchInput
        source="userParentName"
        alwaysOn
        placeholder="Search Parent"
        resettable
        sx={{
          "@media (max-width:536px)": {
            width: "100%",
          },
          minWidth: "200px",
          height: "40px",
          "& .MuiInputBase-root": {
            height: "40px",
          },
        }}
      />
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
          px: 2,
        }}
      >
        <FilterListIcon
          sx={{ marginRight: "6px", width: "16px", height: "16px" }}
        />{" "}
        Status
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        sx={{
          marginTop: "8px",
          "& .MuiPaper-root": {
            paddingLeft: "8px",
            paddingRight: "8px",
          },
        }}
      >
        <MenuItem
          key="all"
          onClick={() => {
            setFilters({ ...filterValues, kycStatus: "" });
            handleMenuClose();
          }}
          sx={{
            bgcolor:
              filterValues.kycStatus === "" ||
              filterValues.kycStatus === undefined
                ? "#F6F4F4"
                : "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "180px",
            borderRadius: "8px",
            mb: "2px",
          }}
        >
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 400,
            }}
          >
            All
          </Typography>
          {filterValues.kycStatus === "" ||
          filterValues.kycStatus === undefined ? (
            <img src={tick} alt="tick" />
          ) : null}
        </MenuItem>
        {statusChoices.map((choice) => (
          <MenuItem
            key={choice.id}
            onClick={() => {
              setFilters({ ...filterValues, kycStatus: choice.id });
              handleMenuClose();
            }}
            sx={{
              bgcolor:
                filterValues.kycStatus === choice.id ? "#F6F4F4" : "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "180px",
              borderRadius: "8px",
              mb: "2px",
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 400,
              }}
            >
              {choice.name}
            </Typography>
            {filterValues.kycStatus === choice.id ? (
              <img src={tick} alt="tick" />
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </Box>,
  ];

  return (
    <>
      {!isMobile && (
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
            KYC Records
          </Typography>
        </Box>
      )}
      <List
        {...props}
        filters={filters}
        actions={postListActions}
        sort={{ field: "createdAt", order: "DESC" }}
        pagination={false}
        sx={{
          // pt: 1,
          "& .RaList-actions": {
            flexWrap: "nowrap", // Ensures table fills the available space
          },
          "& .RaFilterFormInput-spacer": { display: "none" },
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box
              style={{
                width: "100%",
                position: "absolute",
              }}
            >
              <Datagrid
                bulkActionButtons={false}
                rowClick="show"
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  width: "100%",
                  maxHeight: "100%",
                  "& .RaDatagrid-table": {
                    width: "100%", // Ensures table fills the available space
                  },
                  "& .column-paymentMethodType": {
                    minWidth: "150px", // Ensure this column is wide enough
                    maxWidth: "150px",
                    whiteSpace: "nowrap",
                  },
                  "& .MuiTableCell-head": {
                    fontWeight: 600,
                  },
                  borderRadius: "8px",
                  borderColor: "#CFD4DB",
                }}
              >
                <TextField source="username" label="Account" />
                <TextField source="email" label="Email" />
                <TextField source="userParentName" label="Parent" />
                <TextField source="kycStatus" label="KYC Status" />
                {/* <TextField source="redirectUrl" label="Redirect Link" /> */}
                <FunctionField
                  label="Verified"
                  render={(record) => (
                    <Chip
                      label={record.kycVerified ? "Yes" : "No"}
                      variant="outlined"
                      sx={{
                        backgroundColor: record.kycVerified
                          ? "#EBF9F0"
                          : "#FFFCEB",
                        color: "black",
                        border: `1px solid ${
                          record.kycVerified ? "#77C79C" : "#FFDC60"
                        }`,
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "400",
                        height: "22px",
                      }}
                    />
                  )}
                />
                <FunctionField
                  label="Failed Reason"
                  render={(record) =>
                    record.kycStatus === "kyc_failed" &&
                    record.failed_reason ? (
                      <Typography
                        sx={{
                          whiteSpace: "pre-line",
                          fontSize: "13px",
                          maxWidth: "300px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {record.failed_reason}
                      </Typography>
                    ) : (
                      "-"
                    )
                  }
                />
                <DateField source="createdAt" label="Created At" showTime />
              </Datagrid>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100% !important",
                  margin: "16px 0px",
                }}
              >
                <CustomPagination
                  page={page}
                  perPage={perPage}
                  total={total}
                  setPage={setPage}
                  setPerPage={setPerPage}
                />
              </Box>
            </Box>
          </Box>
        )}
      </List>
    </>
  );
};
