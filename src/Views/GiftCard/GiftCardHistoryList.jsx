// src/Pages/GiftCardHistoryList.js
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
  Filter,
} from "react-admin";
import { Box, Typography, CircularProgress } from "@mui/material";
import Parse from "parse";
import CustomPagination from "../Common/CustomPagination";

const statusChoices = [
  { id: "PROCESSED", name: "Processed" },
  { id: "FAILED", name: "Failed" },
  { id: "PENDING", name: "Pending" },
];

const GiftCardFilter = (props) => (
  <Filter {...props}>
    <SearchInput source="username" alwaysOn placeholder="Search by Username" />
    <SelectInput
      source="status"
      choices={statusChoices}
      alwaysOn
      label="Status"
      emptyText="All"
      allowEmpty
    />
  </Filter>
);

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

  useEffect(() => {
    if (!data || typeof data !== "object") return;

    const userIds = [
      ...new Set(Object.values(data).map((item) => item.userId)),
    ];
    if (!userIds.length) return;

    const userQuery = new Parse.Query("_User");
    userQuery.containedIn("objectId", userIds);
    userQuery.limit(1000);

    userQuery.find({ useMasterKey: true }).then((users) => {
      const map = {};
      users.forEach((u) => {
        map[u.id] = u.get("username");
      });
      setUserMap(map);
    });
  }, [data]);

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
        filters={<GiftCardFilter />}
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
            <Datagrid bulkActionButtons={false} rowClick="show">
              <FunctionField
                label="Username"
                render={(record) =>
                  userMap[record.userId] || record.userId || "-"
                }
              />
              <TextField source="orderId" label="Order ID" />
              <TextField source="price" label="Price" />
              <TextField source="productId" label="Product ID" />
              <FunctionField
                label="Product Name"
                render={(record) =>
                  record.apiResponse?.productName
                    ? record.apiResponse.productName
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
    </>
  );
};

export default GiftCardHistoryList;
