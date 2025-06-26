import React, { useState, useEffect } from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  TopToolbar,
  useListController,
  FunctionField,
  SearchInput,
  SelectInput,
  FilterForm,
} from "react-admin";
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import Parse from "parse";
import CustomPagination from "../Common/CustomPagination";

const statusChoices = [
  { id: "PROCESSED", name: "Processed" },
  { id: "FAILED", name: "Failed" },
  { id: "PENDING", name: "Pending" },
];

const GiftCardFilter = (props) => {
  const { filterValues, setFilters } = props;

  return (
    <FilterForm
      filters={[
        <SearchInput
          source="username"
          alwaysOn
          placeholder="Search by Username"
          resettable
          sx={{
            minWidth: "150px",
            height: "40px",
            "& .MuiInputBase-root": {
              height: "40px",
            },
          }}
        />,
        <SelectInput
          source="status"
          choices={statusChoices}
          alwaysOn
          label="Status"
          emptyText="All"
          allowEmpty
          sx={{
            minWidth: "120px",
            height: "40px",
            "& .MuiInputBase-root": {
              height: "40px",
              marginTop: "2px",
            },
          }}
        />,
      ]}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        flexWrap: "nowrap",
        overflowX: "auto",

        gap: 1,
        width: "100%",
        mb: 0.5,
        "@media (max-width:566px)": {
          gap: 1,
          "& .MuiInputBase-root": {
            fontSize: "14px",
          },
        },
      }}
    />
  );
};

const GiftCardHistoryList = (props) => {
  const listContext = useListController(props);
  const {
    data,
    isLoading,
    filterValues,
    page,
    perPage,
    total,
    setPage,
    setPerPage,
    setFilters,
  } = listContext;

  const [userMap, setUserMap] = useState({});
  const isMobile = useMediaQuery("(max-width:600px)");
  console.log(data,"datae")
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
          Gift Card History
        </Typography>
      </Box>

      <List
        {...props}
        filters={
          <GiftCardFilter filterValues={filterValues} setFilters={setFilters} />
        }
        actions={<TopToolbar sx={{ minHeight: "auto", p: 0 }} />}
        pagination={false}
        sort={{ field: "createdAt", order: "DESC" }}
        sx={{
          "& .RaList-actions": {
            flexWrap: "nowrap",
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
                    width: "100%",
                  },
                  "& .MuiTableCell-head": {
                    fontWeight: 600,
                  },
                  borderRadius: "8px",
                  borderColor: "#CFD4DB",
                }}
              >
                <TextField source="username" label="Username" />
                <TextField source="orderId" label="Order ID" />
                <TextField source="price" label="Price" />
                <TextField source="productId" label="Product ID" />
                <FunctionField
                  label="Product Name"
                  render={(record) =>
                    record.apiResponse?.productName
                      ? record.apiResponse.productName : record.productName ? record.productName
                      : "-"
                  }
                />
                <TextField source="status" label="Status" />
                <FunctionField
                  label="Product Image"
                  render={(record) =>
                    record.productImage ? (
                      <img
                        src={record.productImage}
                        alt="giftcard"
                        style={{ width: 50, height: 30, objectFit: "contain" }}
                      />
                    ) : (
                      "-"
                    )
                  }
                />
                <DateField source="createdAt" showTime label="Created At" />
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

export default GiftCardHistoryList;
