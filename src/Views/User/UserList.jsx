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
  SelectInput,
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
import Pagination from "@mui/material/Pagination";
import TablePagination from "@mui/material/TablePagination";
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
        <MenuItem onClick={handleRecharge}>Recharge</MenuItem>
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

  useEffect(() => {
    setFilters(
      {
        $or: [{ userReferralCode: "" }, { userReferralCode: null }], // ✅ Add these filters on mount
      },
      {}
    );
  }, []);

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
];

// Conditionally add SelectInput if role is "Super-User"
if (role === "Super-User") {
  dataFilters.push(
    <SelectInput
      source="role"
      label="Role"
      emptyText={"All"}
      alwaysOn
      resettable
      choices={[
        { id: "Super-User", name: "Super-User" },
        { id: "Player", name: "Player" },
        { id: "Agent", name: "Agent" },
      ]}
    />
  );
}


  const PostListActions = () => (
    <TopToolbar>
      {role != "Super-User" && (
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
    const interval = setInterval(() => {
      refresh();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <List
      title="User Management"
      filters={dataFilters}
      actions={<PostListActions />}
      emptyWhileLoading={true}
      empty={false}
      {...props}
      pagination={
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
            border: "none",
            boxShadow: "none",
          }}
        >
          <TablePagination
            component="div"
            count={Math.ceil((total || 0) / perPage)}
            page={page}
            //onPageChange={handleChangePage}
            rowsPerPage={perPage}
            onRowsPerPageChange={(event) => {
              setPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
            nextIconButtonProps={{ style: { display: "none" } }}
            backIconButtonProps={{ style: { display: "none" } }}
          />
          <Pagination
            page={page}
            rowsPerPage={perPage}
            onChange={(event, newPage) => setPage(newPage)}
            count={Math.ceil((total || 0) / perPage)}
            variant="outlined"
            color="secondary"
            rows
          />
        </Box>
      }
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
        <DateField source="createdAt" label="Date" showTime />
        <WrapperField label="Actions">
          <CustomButton fetchAllUsers={fetchAllUsers} identity={identity} />
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
  );
};
