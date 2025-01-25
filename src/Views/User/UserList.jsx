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
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CustomButton = ({ fetchAllUsers }) => {
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
        {record?.roleName === "Agent" && (
          <MenuItem onClick={handleRedeemService}>Redeem Service Fee</MenuItem>
        )}
        {record?.roleName === "Agent" && (
          <MenuItem onClick={() => {
            setAnchorEl(null);
            setPasswordPermissionDialogOpen(true)}}>
            Password Permission
          </MenuItem>
        )}
        <MenuItem onClick={handleRecharge}>Recharge</MenuItem>
        {record?.roleName === "Player" && (
          <MenuItem onClick={handleWallet}>Wallet</MenuItem>
        )}
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
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
    </React.Fragment>
  );
};

export const UserList = (props) => {
  const navigate = useNavigate();
  const { identity } = useGetIdentity();
  // const [create, { isPending, error }] = useCreate();

  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
  }

  const { data, isLoading } = useGetList("users", {
    // pagination: { page: 1, perPage: 100 },
  });

  const [userData, setUserData] = useState();
  const [referralCode, setReferralCode] = useState();
  const [userCreateDialogOpen, setUserCreateDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);

  const handleCreateUser = () => {
    setUserCreateDialogOpen(true);
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
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleGenerateLink}
      >
        Referral Link
      </Button>
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
    fetchAllUsers();
  }, []);

  if (isLoading || !data) {
    return <Loader />;
  }

  return (
    <Box
    // sx={{
    //   display: "flex",
    //   justifyContent: "space-between",
    //   alignItems: "center",
    //   width: "100%"
    // }}
    >
      {isLoading || !data ? (
        <Loader />
      ) : (
        <List
          title="User Management"
          filters={dataFilters}
          sx={{ pt: 1 }}
          actions={<PostListActions />}
          empty={false}
          // filter={{ userReferralCode: "" }}
          filter={{
            $or: [{ userReferralCode: "" }, { userReferralCode: null }],
          }}
          {...props}
          sort={{ field: "createdAt", order: "DESC" }}
        >
          <Datagrid size="small" rowClick={false} bulkActionButtons={false}>
            <TextField source="username" label="User Name" />
            <TextField source="email" label="Email" />
            {identity?.role === "Super-User" && (
              <TextField source="userParentName" label="Parent User" />
            )}
            {identity?.role === "Super-User" && (
              <TextField source="roleName" label="User Type" />
            )}
            <DateField source="createdAt" label="Date" showTime />
            <WrapperField label="Actions">
              <CustomButton fetchAllUsers={fetchAllUsers} />
            </WrapperField>
          </Datagrid>
          <CreateUserDialog
            open={userCreateDialogOpen}
            onClose={() => setUserCreateDialogOpen(false)}
            fetchAllUsers={fetchAllUsers}
          />
          <ReferralDialog
            open={referralDialogOpen}
            onClose={() => setReferralDialogOpen(false)}
            fetchAllUsers={fetchAllUsers}
            referralCode={referralCode}
          />
        </List>
      )}
    </Box>
  );
};
