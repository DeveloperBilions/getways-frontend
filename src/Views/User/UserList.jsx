import React, { useEffect, useState } from "react";
// react admin
import {
  Datagrid,
  List,
  TextField,
  SearchInput,
  TopToolbar,
  DateField,
  WrapperField,
  useRecordContext,
  useResourceContext,
  useGetIdentity,
} from "react-admin";
import { useNavigate } from 'react-router-dom';
// dialog
import RechargeDialog from "./dialog/RechargeDialog";
import RedeemDialog from "./dialog/RedeemDialog";
import EditUserDialog from "./dialog/EditUserDialog";
import CreateUserDialog from "./dialog/CreateUserDialog";
import DeleteUserDialog from "./dialog/DeleteUserDialog";
import ReferralDialog from "./dialog/ReferralDialog";
// mui icon
import AddIcon from "@mui/icons-material/Add";
// mui
import { Menu, MenuItem, Button } from "@mui/material";

import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CustomButton = ({ fetchAllUsers }) => {
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);

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

  const handleRedeem = () => {
    handleClose();
    setRedeemDialogOpen(true);
  };

  const handleRecharge = () => {
    handleClose();
    setRechargeDialogOpen(true);
  };

  const handleEdit = () => {
    handleClose();
    setEditUserDialogOpen(true);
    // handleClose();
    // navigate(`/users/${record.id}`);
  };

  const handleDelete = async () => {
    handleClose();
    setDeleteUserDialogOpen(true);
    // const userId = record.id;
    // handleClose();
    // await Parse.Cloud.run("deleteUser", { userId });
    // fetchAllUsers();
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
        <MenuItem onClick={handleRecharge}>Recharge</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
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
      />
      <DeleteUserDialog
        open={deleteUserDialogOpen}
        onClose={() => setDeleteUserDialogOpen(false)}
        record={record}
        resource={resource}
        fetchAllUsers={fetchAllUsers}
      />
    </React.Fragment>
  );
};

export const UserList = () => {
  const navigate = useNavigate();
  const { identity } = useGetIdentity();

  const [userData, setUserData] = useState();
  const [userCreateDialogOpen, setUserCreateDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);

  const handleCreateUser = () => {
    setUserCreateDialogOpen(true);
  };

  function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  const handleGenerateLink = () => {
    // setReferralDialogOpen(true);

    const randomString = generateRandomString();

    navigate(
      {
        pathname: '/create-user',
        search: `?referral=${randomString}`,
      },
    )
  }

  const fetchAllUsers = async () => {
    try {
      const response = await Parse.Cloud.run("fetchAllUsers", { identity });
      setUserData(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const dataFilters = [
    <SearchInput source="q" alwaysOn resettable variant="outlined" />,
  ];

  const PostListActions = () => (
    <TopToolbar>
      {/* <CreateButton /> */}
      {/* <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleGenerateLink}
      >
        Referral Link
      </Button> */}
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

  return (
    <List
      title="User Management"
      // filters={dataFilters}
      sx={{ pt: 1 }}
      actions={<PostListActions />}
    >
      <Datagrid
        size="small"
        data={userData}
        rowClick={false}
        bulkActionButtons={false}
      >
        <TextField source="username" label="User Name" />
        <TextField source="email" label="Email" />
        {/* <TextField source="balance" label="Balance" /> */}
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
        fetchAllUsers={fetchAllUsers} />
    </List>
  );
};
