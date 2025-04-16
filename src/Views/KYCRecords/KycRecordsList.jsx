import React, { useEffect, useRef, useState } from "react";
import {
  Datagrid,
  List,
  TextField,
  SearchInput,
  TopToolbar,
  useListController,
  useRefresh,
  DateField,
  FunctionField,
  SelectInput,
} from "react-admin";
import {
  Box,
  Typography,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import FilterListIcon from "@mui/icons-material/FilterList";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import { dataProvider } from "../../Provider/parseDataProvider";
import CustomPagination from "../Common/CustomPagination";
import tick from "../../Assets/icons/tick.svg"
import { pad } from "crypto-js";

const statusChoices = [
  { id: "kyc_success", name: "KYC Success" },
  { id: "kyc_pending", name: "KYC Pending" },
  { id: "kyc_failed", name: "KYC Failed" },
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

  const refresh = useRefresh();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const postListActions = (
    <TopToolbar>
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
          mb: 2,
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
    }
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
            width:"180px",
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
              <img
                src={tick}
                alt="tick"
              />
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
              width:"180px",
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
            {filterValues.kycStatus ===  choice.id ? (
              <img
                src={tick}
                alt="tick"
              />
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </TopToolbar>
  );

  const filters = [
    <Box
      key="search-filter"
      sx={{
        display: "flex",
        alignItems: "end",
        justifyContent: "flex-start",
        flexWrap: "nowrap",
        overflowX: "auto",
        gap: 2,
        width: "100%",
        mb: 2,
      }}
      alwaysOn
    >
      <SearchInput
        source="email"
        alwaysOn
        placeholder="Search Email"
        resettable
        sx={{
          minWidth: "250px",
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
          minWidth: "250px",
          height: "40px",
          "& .MuiInputBase-root": {
            height: "40px",
          },
        }}
      />
      {/* <SelectInput
        source="kycStatus"
        choices={statusChoices}
        label="KYC Status"
        emptyText="All"
        sx={{
          minWidth: "200px",
          height: "40px",
          "& .MuiInputBase-root": {
            height: "40px",
          },
        }}
      /> */}
    </Box>,
  ];

  return (
    <List
      {...props}
      filters={filters}
      actions={postListActions}
      sort={{ field: "createdAt", order: "DESC" }}
      pagination={false}
      sx={{ pt: 2 }}
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
        <>
          <Datagrid bulkActionButtons={false} rowClick="show">
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
                    backgroundColor: record.kycVerified ? "#EBF9F0" : "#FFFCEB",
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
                record.kycStatus === "kyc_failed" && record.failed_reason ? (
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CustomPagination
              page={page}
              perPage={perPage}
              total={total}
              setPage={setPage}
              setPerPage={setPerPage}
            />
          </Box>
        </>
      )}
    </List>
  );
};
