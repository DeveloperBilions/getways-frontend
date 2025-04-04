import React, { useEffect, useRef, useState } from "react";
// react admin
import {
  Datagrid,
  List,
  TextField,
  TopToolbar,
  DateField,
  WrapperField,
  useRecordContext,
  useResourceContext,
  useGetIdentity,
  SearchInput,
  useRefresh,
  useListController,
} from "react-admin";
import { useNavigate } from "react-router-dom";
// dialog
import RechargeDialog from "./dialog/RechargeDialog";
import RedeemDialog from "./dialog/RedeemDialog";
import EditUserDialog from "./dialog/EditUserDialog";
import CreateUserDialog from "./dialog/CreateUserDialog";
import DeleteUserDialog from "./dialog/DeleteUserDialog";
import ReferralDialog from "./dialog/ReferralDialog";
import RedeemServiceDialog from "./dialog/RedeemService";
// mui icon
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
// mui
import { Menu, MenuItem, Button, Box, useMediaQuery, Typography } from "@mui/material";
// loader
import { Loader } from "../Loader";
import { Parse } from "parse";
import WalletDialog from "./dialog/WalletDialog";
import PasswordPermissionDialog from "./dialog/PasswordPermissionDialog";
import BlacklistUserDialog from "./dialog/BlacklistUserDialog";
import EmergencyNotices from "../../Layout/EmergencyNotices";
import TransactionSummaryModal from "./dialog/TransactionSummaryModal";
import setting from "../../Assets/icons/setting.svg";
import RechargeLimitDialog from "./dialog/RechargeLimitDialog";
import PersistentMessage from "../../Utils/View/PersistentMessage";
import CustomPagination from "../Common/CustomPagination";
import { UserFilterDialog } from "./dialog/UserFilterDialog";
import AddUser from "../../Assets/icons/AddUser.svg";
import DisableRechargeDialog from "./dialog/DisableRechargeDialog";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CustomButton = ({ fetchAllUsers, identity }) => {
  const refresh = useRefresh();
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [redeemServiceDialogOpen, setRedeemServiceDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false); // Wallet Dialog state
  const [passwordPermissionDialogOpen, setPasswordPermissionDialogOpen] =
    useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [drawerDialogOpen, setDrawerDialogOpen] = useState(false);
  const [rechargeLimitDialogOpen, setRechargeLimitDialogOpen] = useState(false); // State for Recharge Limit Dialog
  const [disableRechargeDialogOpen, setDisableRechargeDialogOpen] =
  useState(false);
  const role = localStorage.getItem("role");
  const record = useRecordContext();
  const resource = useResourceContext();
  if (!record) return null;

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = async () => {
    refresh();
  };

  const handleRedeem = () => {
    handleClose();
    setRedeemDialogOpen(true);
  };

  const handleRedeemService = () => {
    handleClose();
    setRedeemServiceDialogOpen(true);
  };

  const handleRecharge = () => {
    handleClose();
    setRechargeDialogOpen(true);
  };

  const handleEdit = () => {
    handleClose();
    setEditUserDialogOpen(true);
  };

  const handleDelete = async () => {
    handleClose();
    setDeleteUserDialogOpen(true);
  };

  const handleWallet = () => {
    handleClose();
    setWalletDialogOpen(true); // Open the wallet modal
  };
  const handleDrawer = () => {
    handleClose();
    setDrawerDialogOpen(true);
  };

  const handleRechargeLimit = () => {
    handleClose();
    setRechargeLimitDialogOpen(true); // Open Recharge Limit Dialog
  };
  return (
    <React.Fragment>
      <Box
        id="basic-button"
        size="small"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className="settings-button"
      >
        <img src={setting} alt="setting" width={20} height={20} />
      </Box>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& .MuiMenu-paper": {
            width: "240px",
          },
        }}
      >
        {(record?.roleName === "Agent" ||
          record?.roleName === "Master-Agent") && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setDisableRechargeDialogOpen(true);
            }}
          >
            Disable Recharge
          </MenuItem>
        )}
        {record?.roleName === "Player" && (
          <MenuItem onClick={handleRedeem} sx={{ width: "100%" }}>
            Redeem
          </MenuItem>
        )}
        {(record?.roleName === "Agent" ||
          record?.roleName === "Master-Agent") &&
          (role === "Super-User" || role === "Master-Agent") && (
            <MenuItem onClick={handleRechargeLimit}>Recharge Limit</MenuItem> // New Menu Item
          )}
        {(record?.roleName === "Agent" ||
          record?.roleName === "Master-Agent") &&
          ((role === "Master-Agent" && identity?.redeemServiceEnabled) ||
            role === "Super-User") && (
            <MenuItem onClick={handleRedeemService}>
              Redeem Service Fee
            </MenuItem>
          )}

        {(record?.roleName === "Agent" ||
          record?.roleName === "Master-Agent") && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setPasswordPermissionDialogOpen(true);
            }}
          >
            Password Permission
          </MenuItem>
        )}
        {record?.roleName === "Player" && (
          <MenuItem onClick={handleRecharge} disabled={identity?.rechargeDisabled  || true }>Recharge</MenuItem>
        )}
        {(record?.roleName === "Agent" ||
          record?.roleName === "Master-Agent") &&
          ((role === "Master-Agent" && identity?.redeemServiceEnabled) ||
            role === "Super-User") && (
            <MenuItem onClick={handleDrawer}>Drawer</MenuItem>
          )}
        {record?.roleName === "Player" && (
          <MenuItem onClick={handleWallet}>Wallet</MenuItem>
        )}
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        {record?.roleName === "Player" && role === "Super-User" && (
          <MenuItem
            onClick={(e) => {
              handleClose();
              setBlacklistDialogOpen(true);
            }}
            sx={{ color: "red" }}
          >
            Blacklist User
          </MenuItem>
        )}
      </Menu>
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        record={record}
        resource={resource}
        fetchAllUsers={fetchAllUsers}
        handleRefresh={handleRefresh}
      />
      <RedeemServiceDialog
        open={redeemServiceDialogOpen}
        onClose={() => setRedeemServiceDialogOpen(false)}
        record={record}
        resource={resource}
        fetchAllUsers={fetchAllUsers}
      />
      <RechargeDialog
        open={rechargeDialogOpen}
        onClose={() => setRechargeDialogOpen(false)}
        record={record}
        resource={resource}
        fetchAllUsers={fetchAllUsers}
      />
      <EditUserDialog
        open={editUserDialogOpen}
        onClose={() => setEditUserDialogOpen(false)}
        record={record}
        resource={resource}
        fetchAllUsers={fetchAllUsers}
        handleRefresh={handleRefresh}
      />
      <DeleteUserDialog
        open={deleteUserDialogOpen}
        onClose={() => setDeleteUserDialogOpen(false)}
        record={record}
        resource={resource}
        fetchAllUsers={fetchAllUsers}
        handleRefresh={handleRefresh}
      />
      <BlacklistUserDialog
        open={blacklistDialogOpen}
        onClose={() => setBlacklistDialogOpen(false)}
        record={record}
        handleRefresh={handleRefresh}
      />
      <WalletDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        record={record} // Pass the record to fetch wallet details
      />
      <PasswordPermissionDialog
        open={passwordPermissionDialogOpen}
        onClose={() => setPasswordPermissionDialogOpen(false)}
        record={record}
        handleRefresh={handleRefresh}
      />
      <RechargeLimitDialog
        open={rechargeLimitDialogOpen}
        onClose={() => setRechargeLimitDialogOpen(false)}
        record={record}
        handleRefresh={handleRefresh}
      />{" "}
      {/* Recharge Limit Dialog */}
      <TransactionSummaryModal
        open={drawerDialogOpen}
        onClose={() => setDrawerDialogOpen(false)}
        record={record}
      />
       <DisableRechargeDialog
        open={disableRechargeDialogOpen}
        onClose={() => setDisableRechargeDialogOpen(false)}
        record={record}
        handleRefresh={handleRefresh}
      />
    </React.Fragment>
  );
};

export const UserList = (props) => {
  const listContext = useListController(props); // ✅ Use useListController
  const {
    isLoading,
    total,
    page,
    perPage,
    setPage,
    setPerPage,
    filterValues,
    setFilters,
    setSort,
  } = listContext;

  const navigate = useNavigate();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  // const [create, { isPending, error }] = useCreate();
  const role = localStorage.getItem("role");
  const isMobile = useMediaQuery("(max-width:600px)");

  if (!role) {
    navigate("/login");
  }
  // const { data, isLoading, total } = useGetList("users", {
  //   pagination: { page, perPage }, // Ensure correct pagination parameters
  //   sort: { field: "createdAt", order: "DESC" },
  //   filter: {
  //     ...filterValues,
  //     $or: [{ userReferralCode: "" }, { userReferralCode: null }],
  //   },
  // });

  // const [userData, setUserData] = useState();
  const [referralCode, setReferralCode] = useState();
  const [userCreateDialogOpen, setUserCreateDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [searchBy, setSearchBy] = useState("username");
  const [prevSearchBy, setPrevSearchBy] = useState(searchBy);
  const prevFilterValuesRef = useRef();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const handleOpenFilterModal = () => {
    setFilterModalOpen(true);
  };

  const handleCreateUser = () => {
    setUserCreateDialogOpen(true);
  };
  const handleRefresh = async () => {
    refresh();
  };

  function generateRandomString() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  const handleGenerateLink = async () => {
    const referralCode = generateRandomString();
    setReferralDialogOpen(true);
    setReferralCode(referralCode);
    await Parse.Cloud.run("createUser", {
      roleName: "Player",
      username: referralCode,
      password: referralCode,
      email: `${referralCode}@invalid`,
      userReferralCode: referralCode,
      signedUp: false,
      userParentId: identity.objectId,
      userParentName: identity.username,
    });
  };

  const fetchAllUsers = async () => {
    try {
      await Parse.Cloud.run("fetchAllUsers", { identity });
      // setUserData(response.filter((r) => !r.email.includes("@invalid")));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const searchFields = ["username", "email", "userParentName"];

  const handleSearchByChange = (newSearchBy) => {
    setSearchBy(newSearchBy);
    setPrevSearchBy(newSearchBy);

    const currentSearchValue = filterValues[prevSearchBy] || "";
    const newFilters = {};

    Object.keys(filterValues).forEach((key) => {
      if (key !== prevSearchBy && !searchFields.includes(key)) {
        newFilters[key] = filterValues[key];
      }
    });

    if (currentSearchValue && currentSearchValue.trim() !== "") {
      newFilters[newSearchBy] = currentSearchValue;
    }

    newFilters.searchBy = newSearchBy;

    if (filterValues.role) {
      newFilters.role = filterValues.role;
    }

    setFilters(newFilters, false);
  };

  useEffect(() => {
    const prevFilterValues = prevFilterValuesRef.current;
    const filterValuesChanged =
      JSON.stringify(prevFilterValues) !== JSON.stringify(filterValues);

    prevFilterValuesRef.current = filterValues;

    if (!filterValuesChanged) return;

    const newFilters = {
      searchBy,
      ...(filterValues[searchBy] && { [searchBy]: filterValues[searchBy] }),
      ...(filterValues.role && { role: filterValues.role }),
    };

    // Apply comprehensive filters
    setFilters(
      {
        ...Object.fromEntries(
          Object.entries(filterValues).filter(
            ([key]) => !searchFields.includes(key) || key === "role"
          )
        ),
        ...newFilters,
        $or: [
          { userReferralCode: "" },
          { userReferralCode: null }
        ],
      },
      false
    );
  }, [filterValues, searchBy, setFilters]);

  const dataFilters = [
    <Box
      key="search-filter"
      sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", justifyContent: "space-between" }}
      alwaysOn
    >
      <SearchInput
        source={searchBy}
        alwaysOn
        resettable
        placeholder={searchBy.charAt(0).toUpperCase() + searchBy.slice(1)}
        sx={{
          width: { xs: "100%", sm: "auto" },
          minWidth: "200px",
          marginBottom: 1,
          borderRadius: "5px",
          borderColor: "#CFD4DB",
          maxWidth: "280px",
        }}
      />
      <Button
        variant="outlined"
        onClick={handleOpenFilterModal}
        sx={{
          height: "40px",
          borderRadius: "5px",
          border: "1px solid #CFD4DB",
          fontWeight: 400,
          fontSize: "body-s",
          textTransform: "capitalize",
        }}
      >
        <FilterListIcon sx={{ marginRight: "6px", width:"16px", height:"16px" }} /> Filter
      </Button>
    </Box>,
  ];

  const PostListActions = () => (
    <TopToolbar
      sx={{
        display: "flex",
        // flexDirection: { xs: "column", sm: "row" }, // Stack elements on small screens
        alignItems: "space-between",
        justifyContent: isMobile ? "space-between" : "flex-end",
        gap: 2, // Add space between buttons
        // p: { xs: 1, sm: 2 }, // Adjust padding for different screen sizes
        width: "100%", // Ensure full width for the toolbar
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
            User management
          </Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 1 }}>
        {role !== "Super-User" &&
          role !== "Master-Agent" &&
          (isMobile ? (
            <Box
              onClick={handleCreateUser}
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
              <AddIcon />
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleGenerateLink}
              sx={{
                width: { xs: "100%", sm: "191px" },
                height: { xs: "100%", sm: "40px" },
                backgroundColor: "var(--primary-color)",
                color: "var(--secondary-color)",
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "var(--secondary-color)",
                }}
              >
                Referral Link
              </Typography>
            </Button>
          ))}

        {isMobile ? (
          <Box
            onClick={handleCreateUser}
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
            <img src={AddUser} alt="Add User" width="20px" height="20px" />
          </Box>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={
              <img src={AddUser} alt="Add User" width="20px" height="20px" />
            }
            onClick={handleCreateUser}
            sx={{
              width: { xs: "100%", sm: "191px" },
              height: { xs: "100%", sm: "40px" },
              backgroundColor: "var(--primary-color)",
              color: "var(--secondary-color)",
              mb: 1,
            }} // Full width on small screens
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 500,
                color: "var(--secondary-color)",
              }}
            >
              Add New User
            </Typography>
          </Button>
        )}
      </Box>
    </TopToolbar>
  );

  useEffect(() => {
    if (identity) {
      fetchAllUsers();
    }
  }, [identity]);

  useEffect(() => {
    refresh(); // ✅ Forces a fresh request
    setFilters({searchBy:"username"},{}); // Clear filters when the component mounts
    setSort({ field: "createdAt", order: "DESC" });
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refresh();
  //   }, 60000); // Refresh every 60 seconds

  //   return () => clearInterval(interval);
  // }, [refresh]);

  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <>
      {(role === "Master-Agent" || role === "Agent") && <EmergencyNotices />}
      {(role === "Master-Agent" || role === "Agent") && <PersistentMessage />}
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
            User management
          </Typography>
        </Box>
      )}
      <List
        title="User Management"
        filters={dataFilters}
        actions={<PostListActions />}
        emptyWhileLoading={true}
        empty={false}
        filter={{
          $or: [
            { userReferralCode: "" },
            { userReferralCode: null },
            { username: "" },
          ],
        }}
        {...props}
        sort={{ field: "createdAt", order: "DESC" }}
        pagination={false}
        sx={{
          "& .RaList-actions": {
            flexWrap: "nowrap", // Ensures table fills the available space
          },
          "& .RaFilterFormInput-spacer": { display: "none" },
        }}
      >
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
                "& .RaDatagrid-row > div, & .RaDatagrid-header > div": {
                  padding: "8px 12px",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "@media (max-width: 600px)": {
                  "& .RaDatagrid-row > div, & .RaDatagrid-header > div": {
                    padding: "6px", // Reduce padding on mobile
                    height: "620px",
                  },
                },
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                },
                borderRadius: "8px",
                borderColor: "#CFD4DB",
              }}
            >
              <WrapperField label="Actions">
                <CustomButton
                  fetchAllUsers={fetchAllUsers}
                  identity={identity}
                />
              </WrapperField>
              <TextField source="username" label="User Name" />
              <TextField source="email" label="Email" />
              {(identity?.role === "Super-User" ||
                identity?.role === "Master-Agent") && (
                <TextField source="userParentName" label="Parent User" />
              )}
              {(identity?.role === "Super-User" ||
                identity?.role === "Master-Agent") && (
                <TextField source="roleName" label="User Type" />
              )}
              <DateField source="createdAt" label="Date" showTime sortable />
            </Datagrid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100% !important",
                mt: 1,
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
        <CreateUserDialog
          open={userCreateDialogOpen}
          onClose={() => setUserCreateDialogOpen(false)}
          fetchAllUsers={fetchAllUsers}
          handleRefresh={handleRefresh}
        />
        <ReferralDialog
          open={referralDialogOpen}
          onClose={() => setReferralDialogOpen(false)}
          fetchAllUsers={fetchAllUsers}
          referralCode={referralCode}
        />
      </List>
      <UserFilterDialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        searchBy={searchBy}
        setSearchBy={setSearchBy}
        role={role}
        filterValues={filterValues}
        setFilters={setFilters}
        handleSearchByChange={handleSearchByChange}
      />
    </>
  );
};
