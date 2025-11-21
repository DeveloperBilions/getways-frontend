import React, { useState } from "react";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  DateField,
  SearchInput,
  TopToolbar,
  useListController,
  useRefresh,
  useNotify,
  WrapperField,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import CustomPagination from "../Common/CustomPagination";
import jsPDF from "jspdf";
import "jspdf-autotable";
import download from "../../Assets/icons/download.svg";
import tick from "../../Assets/icons/tick.svg";
import { dataProvider } from "../../Provider/parseDataProvider";
import EditTicketDialog from "./EditTicketDialog";
import TicketDetailsDialog from "./TicketDetailsDialog";

const categoryChoices = [
  { id: "redeem", name: "Redeem" },
  { id: "recharge", name: "Recharge" },
  { id: "wallet", name: "Wallet" },
  { id: "giftcard", name: "Gift Card" },
  { id: "login", name: "Login" },
  { id: "others", name: "Others" },
];

const statusChoices = [
  { id: "new", name: "New" },
  { id: "in_progress", name: "In Progress" },
  { id: "resolved", name: "Resolved" },
];

const getStatusColor = (status) => {
  if (!status) return "default";
  switch (status.toLowerCase()) {
    case "new":
      return "primary";
    case "in_progress":
      return "warning";
    case "resolved":
      return "success";
    default:
      return "default";
  }
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.split(/[ _]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Actions Button Component
const TicketActions = ({ onEdit, onViewDetails }) => {
  const record = useRecordContext();
  const role = localStorage.getItem("role");

  if (!record) return null;

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => onViewDetails(record)}
          sx={{
            color: "info.main",
            "&:hover": {
              bgcolor: "info.light",
              color: "white",
            },
          }}
        >
          <FilterListIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {role === "Super-User" && (
        <Tooltip title="Edit Ticket">
          <IconButton
            size="small"
            onClick={() => onEdit(record)}
            sx={{
              color: "primary.main",
              "&:hover": {
                bgcolor: "primary.light",
                color: "white",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const TicketsList = (props) => {
  const listContext = useListController(props);
  const {
    data,
    isLoading,
    filterValues,
    setFilters,
    page,
    perPage,
    total,
    setPage,
    setPerPage,
  } = listContext;

  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const refresh = useRefresh();
  const notify = useNotify();
  const role = localStorage.getItem("role");

  const handleCategoryMenuOpen = (event) => {
    setCategoryMenuAnchor(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryMenuAnchor(null);
  };

  const handleStatusMenuOpen = (event) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsDialogOpen(true);
  };

  const handleEditSuccess = () => {
    notify("Ticket updated successfully", { type: "success" });
    refresh();
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedTicket(null);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
    setSelectedTicket(null);
  };

  const handleExport = async () => {
    try {
      const response = await dataProvider.getList("tickets", {
        pagination: { page: 1, perPage: 100000 },
        sort: { field: "createdAt", order: "DESC" },
        filter: filterValues,
      });

      const exportData = response.data.map((record) => ({
        Username: record.username,
        Ticket_ID: record.ticketId || record.id,
        Category: capitalizeFirstLetter(record.category),
        Status: capitalizeFirstLetter(record.status),
        Description: record.description,
        Remarks: record.remarks || "",
        Date_Time: new Date(record.createdAt).toLocaleString(),
      }));

      const pdf = new jsPDF("l", "pt", "a4");
      pdf.autoTable({
        head: [
          [
            "No.",
            "Username",
            "Ticket ID",
            "Category",
            "Status",
            "Description",
            "Remarks",
            "Date & Time",
          ],
        ],
        body: exportData.map((item, index) => [
          index + 1,
          item.Username,
          item.Ticket_ID,
          item.Category,
          item.Status,
          item.Description,
          item.Remarks,
          item.Date_Time,
        ]),
      });
      pdf.save("Support_Tickets.pdf");
    } catch (error) {
      console.error("Error exporting data:", error);
      notify("Failed to export tickets", { type: "error" });
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
          alignItems: "space-between",
          justifyContent: isMobile ? "space-between" : "flex-end",
          gap: 2,
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
              Support Tickets
            </Typography>
          </Box>
        )}
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
            <img src={download} alt="Export" width="20px" height="20px" />
          </Box>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={
              <img src={download} alt="Export" width="20px" height="20px" />
            }
            onClick={handleExport}
            sx={{
              width: { xs: "100%", sm: "119px" },
              height: { xs: "100%", sm: "40px" },
              backgroundColor: "var(--primary-color)",
              color: "var(--secondary-color)",
              mb: "1px",
              ml: "8px",
            }}
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
        source="searchBy"
        alwaysOn
        placeholder="Username or TicketId"
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
      <Button
        variant="outlined"
        onClick={handleCategoryMenuOpen}
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
        />
        Category
      </Button>
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={handleCategoryMenuClose}
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
            setFilters({ ...filterValues, category: "" });
            handleCategoryMenuClose();
          }}
          sx={{
            bgcolor:
              filterValues.category === "" ||
              filterValues.category === undefined
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
          <Typography sx={{ fontSize: "16px", fontWeight: 400 }}>
            All
          </Typography>
          {filterValues.category === "" ||
          filterValues.category === undefined ? (
            <img src={tick} alt="tick" />
          ) : null}
        </MenuItem>
        {categoryChoices.map((choice) => (
          <MenuItem
            key={choice.id}
            onClick={() => {
              setFilters({ ...filterValues, category: choice.id });
              handleCategoryMenuClose();
            }}
            sx={{
              bgcolor:
                filterValues.category === choice.id ? "#F6F4F4" : "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "180px",
              borderRadius: "8px",
              mb: "2px",
            }}
          >
            <Typography sx={{ fontSize: "16px", fontWeight: 400 }}>
              {choice.name}
            </Typography>
            {filterValues.category === choice.id ? (
              <img src={tick} alt="tick" />
            ) : null}
          </MenuItem>
        ))}
      </Menu>

      <Button
        variant="outlined"
        onClick={handleStatusMenuOpen}
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
        />
        Status
      </Button>
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
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
            setFilters({ ...filterValues, status: "" });
            handleStatusMenuClose();
          }}
          sx={{
            bgcolor:
              filterValues.status === "" || filterValues.status === undefined
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
          <Typography sx={{ fontSize: "16px", fontWeight: 400 }}>
            All
          </Typography>
          {filterValues.status === "" || filterValues.status === undefined ? (
            <img src={tick} alt="tick" />
          ) : null}
        </MenuItem>
        {statusChoices.map((choice) => (
          <MenuItem
            key={choice.id}
            onClick={() => {
              setFilters({ ...filterValues, status: choice.id });
              handleStatusMenuClose();
            }}
            sx={{
              bgcolor: filterValues.status === choice.id ? "#F6F4F4" : "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "180px",
              borderRadius: "8px",
              mb: "2px",
            }}
          >
            <Typography sx={{ fontSize: "16px", fontWeight: 400 }}>
              {choice.name}
            </Typography>
            {filterValues.status === choice.id ? (
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
            Support Tickets
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
          "& .RaList-actions": {
            flexWrap: "nowrap",
          },
          "& .RaFilterFormInput-spacer": { display: "none" },
        }}
      >
        <Box style={{ width: "100%", overflowX: "auto" }}>
          <Box style={{ width: "100%", position: "absolute" }}>
            <Datagrid
              size="small"
              bulkActionButtons={false}
              sx={{
                overflowX: "auto",
                overflowY: "hidden",
                width: "100%",
                maxHeight: "100%",
                "& .RaDatagrid-row": {
                  borderBottom: "1px solid #eaeaea",
                  "&:hover": {
                    backgroundColor: "#f9f9f9",
                  },
                },
                "& .RaDatagrid-header": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: 600,
                  borderBottom: "2px solid #dedede",
                },
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                },
                borderRadius: "8px",
                borderColor: "#CFD4DB",
              }}
            >
              <WrapperField label="Actions">
                <TicketActions
                  onEdit={handleEditTicket}
                  onViewDetails={handleViewDetails}
                />
              </WrapperField>
              <TextField source="username" label="Username" />
              <TextField
                label="Ticket ID"
                source="id"
              />
              <FunctionField
                label="Category"
                render={(record) => capitalizeFirstLetter(record.category)}
              />
              <FunctionField
                label="Status"
                render={(record) => (
                  <Chip
                    label={capitalizeFirstLetter(record.status)}
                    color={getStatusColor(record.status)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      fontSize: 12,
                    }}
                  />
                )}
              />
              <DateField source="createdAt" label="Date & Time" showTime />
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
      </List>

      {/* Edit Ticket Dialog */}
      <EditTicketDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        ticket={selectedTicket}
        onSuccess={handleEditSuccess}
      />

      {/* Ticket Details Dialog */}
      <TicketDetailsDialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        ticket={selectedTicket}
      />
    </>
  );
};

export default TicketsList;
