import React, { useEffect, useState } from "react";
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
  useCreate,
  TextInput,
  useGetList,
  SearchInput,
  useRefresh,
  useListContext,
  useListController,
  Pagination,
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
// mui
import { Menu, MenuItem, Button, Box } from "@mui/material";
// loader
import { Loader } from "../Loader";
import { Parse } from "parse";
import WalletDialog from "./dialog/WalletDialog";
import PasswordPermissionDialog from "./dialog/PasswordPermissionDialog";
import BlacklistUserDialog from "./dialog/BlacklistUserDialog";
import EmergencyNotices from "../../Layout/EmergencyNotices";
import TransactionSummaryModal from "./dialog/TransactionSummaryModal";
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

  return (
    <React.Fragment>
      <Button
        variant="outlined"
        id="basic-button"
        size="small"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Editor
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleRedeem}>Redeem</MenuItem>
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

        <MenuItem onClick={handleRecharge} disabled={identity?.rechargeDisabled}>Recharge</MenuItem>
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
          >
            Black List User
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
    data,
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

  const [userData, setUserData] = useState();
  const [referralCode, setReferralCode] = useState();
  const [userCreateDialogOpen, setUserCreateDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);

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
      var response = await Parse.Cloud.run("fetchAllUsers", { identity });
      setUserData(response.filter((r) => !r.email.includes("@invalid")));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const dataFilters = [
    <SearchInput source="username" alwaysOn resettable />,
    // <TextInput source="username" label="Name" alwaysOn resettable />,
  ];

  const PostListActions = () => (
    <TopToolbar>
      {role != "Super-User" && role != "Master-Agent" && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleGenerateLink}
        >
          Referral Link
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleCreateUser}
      >
        Add New User
      </Button>
    </TopToolbar>
  );

  useEffect(() => {
    if (identity) {
      fetchAllUsers();
    }
  }, [identity]);

  useEffect(() => {
    refresh(); // ✅ Forces a fresh request
  }, []);

  useEffect(() => {
    setFilters({}, {}); // Clear filters when the component mounts
    setSort({ field: "createdAt", order: "DESC" }); // Set default sorting
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
        pagination={<Pagination />}
        sort={{ field: "createdAt", order: "DESC" }} // ✅ Ensure default sorting
      >
        <Datagrid
          size="small"
          bulkActionButtons={false}
          // data={data}
        >
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
          <WrapperField label="Actions">
            <CustomButton fetchAllUsers={fetchAllUsers} identity={identity} />
          </WrapperField>
        </Datagrid>

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
    </>
  );
};
