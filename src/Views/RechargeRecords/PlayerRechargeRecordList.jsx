import React, { useEffect, useRef, useState } from "react";
// react admin
import { useGetIdentity, useRefresh, useListController } from "react-admin";
import { useNavigate } from "react-router-dom";
// dialog
import { Tooltip, Snackbar, Alert, Menu } from "@mui/material";

// mui
import {
    Chip,
    Button,
    Typography,
    Box,
    useMediaQuery,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from "@mui/material";
// mui icon
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// loader
import { Loader } from "../Loader";
import tick from "../../Assets/icons/tick.svg";
import Dropdown from "../../Assets/icons/Dropdown.svg";
import filter from "../../Assets/icons/filter.svg";

import { Parse } from "parse";
import CustomPagination from "../Common/CustomPagination";
import RechargeDialog from "../RechargeRecords/dialog/RechargeDialog";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}


export const PlayerRechargeRecordsList = (props) => {
    const listContext = useListController({
        ...props,
        filter: { type: "recharge" },
    });
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
    const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchBy, setSearchBy] = useState("transactionAmount");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [menuAnchor, setMenuAnchor] = useState(null);
    const isMobile = useMediaQuery("(max-width: 900px)");

    // Add state for copy notification
    const [copyNotification, setCopyNotification] = useState(false);

    const failedReasonMessages = {
        4000: "We weren't able to charge the user's card and the order was not completed. The user can try again.",
        4001: "The transaction failed due to an incorrect CVV/CVC. The user can try again ensuring they enter the correct CVV/CVC.",
        4002: "Payment was declined by the card issuer. The user should contact them for further details.",
        4010: "Payment was declined by the card issuer. The user should contact them for further details.",
        4012: "Payment was declined by the card issuer. The user should contact them for further details.",
        4003: "Incorrect card details. The user can try again ensuring they enter valid card details.",
        4004: "Insufficient balance. The user should add funds to their card and try again.",
        4005: "Card limit was exceeded. The user should use a different card to complete their purchase.",
        4011: "Card validation failed. The user can add a valid card and try again.",
        4013: "We weren't able to charge the user's card and the order was not completed. The user should contact support for further assistance.",
    };

    const screenWidth = useWindowWidth();

    const role = localStorage.getItem("role");

    if (!role) {
        navigate("/login");
    }

    const mapStatus = (status) => {
        switch (status) {
            case 0:
                return "Pending Referral Link";
            case 1:
                return "Pending Confirmation";
            case 2:
                return "Confirmed";
            case 3:
                return "Coins Credited";
            case 4:
                return "Success";
            case 5:
                return "Fail";
            case 6:
                return "Pending Approval";
            case 7:
                return "Rejected";
            case 9:
                return "Expired";
            case 10:
                return "Failed";
            default:
                return "Unknown Status";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 1:
                return {
                    backgroundColor: "#FFEDD5",
                    color: "#C2410C",
                };
            case 2:
                return {
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                };
            case 3:
                return {
                    backgroundColor: "#D4EDDA",
                    color: "#155724",
                };
            case 9:
                return {
                    backgroundColor: "#FEE2E2",
                    color: "#B91616",
                };
            case 10:
                return {
                    backgroundColor: "#F3F4F6",
                    color: "#374151",
                };
            default:
                return {
                    backgroundColor: "#E9ECEF",
                    color: "#495057",
                    border: "1px solid #DEE2E6",
                };
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        refresh();
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    const handleUrlClick = (record) => {
        navigator.clipboard.writeText(record?.referralLink);
        // Show copy notification
        setCopyNotification(true);
    };

    const handleCloseCopyNotification = () => {
        setCopyNotification(false);
    };

    const handleUrlRedirect = (record) => {
        if (record?.referralLink) {
            window.open(record.referralLink, "_blank");
        }
    };

    useEffect(() => {
        const newFilter = { type: "recharge" };
        setFilters(newFilter, false);
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        const newFilters = { ...filterValues };

        if (query) {
            newFilters.searchBy = searchBy;
            newFilters[searchBy] = query;
        } else {
            console.log("Deleting searchBy and query");
            delete newFilters.searchBy;
            delete newFilters[searchBy];
        }

        setFilters(newFilters, false);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        const newFilters = { ...filterValues };

        if (status !== "All Status") {
            const statusMap = {
                "Pending Confirmation": 1,
                Confirmed: 2,
                "Coins Credited": 3,
                Expired: 9,
                Failed: 10,
            };
            newFilters.status = statusMap[status];
        } else {
            delete newFilters.status;
        }

        setFilters(newFilters, false);
    };

    const statusChoices = [
        { id: "Pending Confirmation", name: "Pending Confirmation" },
        { id: "Confirmed", name: "Confirmed" },
        { id: "Coins Credited", name: "Coins Credited" },
        { id: "Expired", name: "Expired" },
        { id: "Failed", name: "Failed" },
    ];

    const handleMenuOpen = (event) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleMenuItemClick = (value) => {
        handleStatusFilter(value);
        handleMenuClose();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + "," + date.toLocaleTimeString();
    };

    const renderActionButtons = (record) => {
        if (record.status === 1) {
            return (
                <Box sx={{ display: "flex", gap: 1 }}>
                    {record.referralLink && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleUrlRedirect(record)}
                            sx={{
                                minWidth: "auto",
                                px: 2,
                                borderRadius: 2,
                                backgroundColor: "#2E5BFF",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#4338CA",
                                },
                            }}
                        >
                            <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                                Refresh
                            </Typography>
                        </Button>
                    )}
                    {record?.referralLink && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleUrlClick(record)}
                            sx={{
                                minWidth: "auto",
                                px: 1,
                                color: "#4F46E5",
                                borderColor: "#4F46E5",
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: "#EEF2FF",
                                    borderColor: "#4F46E5",
                                },
                            }}
                        >
                            <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                                Copy
                            </Typography>
                        </Button>
                    )}
                </Box>
            );
        } else if (record.status === 2) {
            return (
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        minWidth: "auto",
                        px: 2,
                        borderRadius: 2,
                        backgroundColor: "#2E5BFF",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "#4338CA",
                        },
                    }}
                >
                    <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                        Refresh
                    </Typography>
                </Button>
            );
        } else if (record.status === 10) {
            return (
                <Button
                    variant="outlined"
                    size="small"
                    sx={{
                        minWidth: "auto",
                        px: 1,
                        color: "#2E5BFF",
                        borderColor: "#2E5BFF",
                        borderRadius: 2,
                        textTransform: "none",
                        "&:hover": {
                            borderColor: "#2E5BFF",
                        },
                    }}
                    onClick={() => {
                        renderFailedReason(record);
                    }}
                >
                    <Typography sx={{ fontWeight: 500, fontSize: "14px" }}>
                        Failed Reason
                    </Typography>
                </Button>
            );
        }
        return null;
    };

    const renderFailedReason = (record) => {
        const failedReason = record.failed_reason;
        const failReasonCode = record.fail_reason;

        if (failedReason) {
            const isLong = failedReason.length > 30;
            const display = isLong
                ? failedReason.substring(0, 30) + "..."
                : failedReason;
            return (
                <Tooltip title={failedReason} arrow placement="top">
                    <Typography variant="body2" sx={{ cursor: "default" }}>
                        {display}
                    </Typography>
                </Tooltip>
            );
        }

        const code = parseInt(failReasonCode);
        const mappedMessage = !isNaN(code) ? failedReasonMessages[code] : null;

        if (mappedMessage) {
            const fullText = `${failReasonCode} - ${mappedMessage}`;
            const isLong = fullText.length > 30;
            const display = isLong ? fullText.substring(0, 30) + "..." : fullText;

            return (
                <Tooltip title={fullText} arrow placement="top">
                    <Typography variant="body2" sx={{ cursor: "default" }}>
                        {display}
                    </Typography>
                </Tooltip>
            );
        }

        return "-";
    };

    if (isLoading || loading) {
        return <Loader />;
    }

    // Convert data object to array for rendering
    const dataArray = data ? Object.values(data) : [];

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    backgroundColor: "#FFFFFF",
                    justifyContent: "space-between",
                    alignItems: { xs: "none", sm: "center" },
                    mb: "16px",
                    border: "1px solid #E7E7E7",
                    borderRadius: 2,
                    p: { xs: "12px", sm: "16px" },
                    gap: { xs: 2, sm: 0 },
                }}
            >
                <Box
                    sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}
                >
                    <IconButton
                        onClick={() => navigate("/playerDashboard")}
                        size="small"
                        sx={{ ":hover": { backgroundColor: "#FFFFFF" } }}
                    >
                        <ArrowBackIcon sx={{ mr: 1 }} />
                        <Typography
                            sx={{ fontWeight: 500, fontSize: { xs: "12px", sm: "14px" } }}
                            color="text.secondary"
                        >
                            Back
                        </Typography>
                    </IconButton>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                            sx={{ fontWeight: 500, fontSize: { xs: "16px", sm: "20px" } }}
                        >
                            Pending Recharge Request
                        </Typography>
                        <Typography
                            sx={{ fontWeight: 400, fontSize: { xs: "12px", sm: "14px" } }}
                            color="text.secondary"
                        >
                            Total transactions: {total}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: "12px", sm: "14px" },
                            mt: { xs: 1, sm: 0 },
                        }}
                    >
                        Agent: {identity?.userParentName}
                    </Typography>
                </Box>
            </Box>

            {/* Controls */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    backgroundColor: "#FFFFFF",
                    gap: { xs: 2, sm: 2 },
                    mb: "16px",
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    alignItems: { xs: "stretch", sm: "center" },
                    border: "1px solid #E7E7E7",
                }}
            >
                <TextField
                    placeholder="Search by amount"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: { xs: "100%", sm: 300 },
                        color: "#0000008F",
                    }}
                    InputProps={{
                        sx: {
                            fontSize: { xs: "12px", sm: "14px" },
                            fontWeight: 400,
                            fontFamily: "Inter",
                            minHeight: { xs: "36px", sm: "43px" },
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
                    <Button
                        onClick={handleMenuOpen}
                        sx={{
                            fontSize: { xs: "12px", sm: "14px" },
                            fontWeight: 400,
                            fontFamily: "Inter",
                            color: "#000000",
                            textTransform: "none",
                            justifyContent: "space-between",
                            padding: "8px 14px",
                            border: "1px solid rgba(0, 0, 0, 0.23)",
                            borderRadius: "4px",
                            minHeight: { xs: "36px", sm: "40px" },
                            "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                border: "1px solid rgba(0, 0, 0, 0.23)",
                            },
                        }}
                        >
                        <Box>
                        <img src={filter} alt="filter" style={{ marginRight: "8px" }} />
                        {statusFilter}
                        </Box>
                        <img src={Dropdown} alt="dropdown" />
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
                                width: { xs: "100%", sm: "240px" },
                            },
                        }}
                    >
                        <MenuItem
                            key="all"
                            onClick={() => handleMenuItemClick("All Status")}
                            sx={{
                                bgcolor: statusFilter === "All Status" ? "#F6F4F4" : "white",
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                borderRadius: "8px",
                                mb: "2px",
                                paddingLeft: "16px",
                                paddingRight: "16px",
                            }}
                        >
                            {statusFilter === "All Status" ? (
                                <img
                                    src={tick}
                                    alt="tick"
                                    style={{
                                        marginRight: "12px",
                                        width: "16px",
                                        height: "16px",
                                    }}
                                />
                            ) : (
                                <div style={{ width: "28px" }} />
                            )}
                            <Typography
                                sx={{
                                    fontSize: { xs: "14px", sm: "16px" },
                                    fontWeight: 400,
                                }}
                            >
                                All Status
                            </Typography>
                        </MenuItem>

                        {statusChoices.map((choice) => (
                            <MenuItem
                                key={choice.id}
                                onClick={() => handleMenuItemClick(choice.id)}
                                sx={{
                                    bgcolor: statusFilter === choice.id ? "#F6F4F4" : "white",
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                    borderRadius: "8px",
                                    mb: "2px",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                }}
                            >
                                {statusFilter === choice.id ? (
                                    <img
                                        src={tick}
                                        alt="tick"
                                        style={{
                                            marginRight: "12px",
                                            width: "16px",
                                            height: "16px",
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: "28px" }} />
                                )}
                                <Typography
                                    sx={{
                                        fontSize: { xs: "14px", sm: "16px" },
                                        fontWeight: 400,
                                    }}
                                >
                                    {choice.name}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Menu>
                </FormControl>

                <Box
                    sx={{ ml: { xs: 0, sm: "auto" }, width: { xs: "100%", sm: "auto" } }}
                >
                    <Button
                        variant="contained"
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{
                            backgroundColor: "#2E5BFF",
                            "&:hover": { backgroundColor: "#4338CA" },
                            borderRadius: 2,
                            width: { xs: "100%", sm: "auto" },
                            minHeight: { xs: "36px", sm: "40px" },
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: { xs: "14px", sm: "18px" },
                                    textTransform: "none",
                                }}
                            >
                                Refresh
                            </Typography>
                        </Box>
                    </Button>
                </Box>
            </Box>
            {isMobile ? (
                <Box
                    sx={{
                        width: "100%",
                        overflowX: "auto",
                    }}
                >
                    <Box
                        style={{
                            width: "100%",
                            position: "relative", // Changed from absolute to relative for better layout
                            maxWidth: `${screenWidth - 64.96}px`
                        }}
                    >
                        <TableContainer
                            component={Paper}
                            sx={{
                                borderRadius: 2,
                                boxShadow: 1,
                                overflowX: "auto",
                                "& .MuiTable-root": {
                                    width: "100%", // Ensures table fills the available space
                                },
                                "& .MuiTableCell-head": {
                                    fontWeight: 600,
                                    whiteSpace: "nowrap", // Prevent header text wrapping
                                },
                                "& .MuiTableCell-body": {
                                    whiteSpace: "nowrap", // Prevent body text wrapping
                                },
                                // Custom column width controls
                                // "& .column-rechargeDate": {
                                //     minWidth: "150px",
                                //     maxWidth: "150px",
                                // },
                                // "& .column-amount": {
                                //     minWidth: "100px",
                                //     maxWidth: "100px",
                                // },
                                // "& .column-remark": {
                                //     minWidth: "200px",
                                //     maxWidth: "200px",
                                // },
                                // "& .column-status": {
                                //     minWidth: "140px",
                                //     maxWidth: "140px",
                                // },
                                // "& .column-actions": {
                                //     minWidth: "150px",
                                //     maxWidth: "150px",
                                // },
                                borderColor: "#CFD4DB",
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            className="column-rechargeDate"
                                            sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                                        >
                                            Recharge Date
                                        </TableCell>
                                        <TableCell
                                            className="column-amount"
                                            sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                                        >
                                            Amount
                                        </TableCell>
                                        <TableCell
                                            className="column-remark"
                                            sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                                        >
                                            Remark
                                        </TableCell>
                                        <TableCell
                                            className="column-status"
                                            sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                                        >
                                            Status
                                        </TableCell>
                                        <TableCell
                                            className="column-actions"
                                            sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}
                                        >
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataArray.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                                        >
                                            <TableCell className="column-rechargeDate">
                                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Typography sx={{ fontSize: "14px" }}>
                                                        {formatDate(record.createdAt).split(",")[0]}
                                                        {","}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "14px" }}>
                                                        {formatDate(record.createdAt).split(",")[1]}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell className="column-amount">
                                                <Typography sx={{ fontSize: "14px" }}>
                                                    {record.transactionAmount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell className="column-remark">
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        color: "#808080",
                                                        maxWidth: "200px",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap"
                                                    }}
                                                >
                                                    {!record.remark ? "-" : record.remark}
                                                </Typography>
                                            </TableCell>
                                            <TableCell className="column-status">
                                                <Chip
                                                    label={mapStatus(record.status)}
                                                    size="small"
                                                    sx={{
                                                        ...getStatusColor(record.status),
                                                        fontWeight: 400,
                                                        borderRadius: 4,
                                                        fontSize: "14px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="column-actions">
                                                {renderActionButtons(record)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                width: "100%",
                                mt: 3
                            }}
                        >
                            <CustomPagination
                                page={page}
                                perPage={perPage}
                                total={total}
                                setPage={setPage}
                                setPerPage={setPerPage}
                                player={true}
                            />
                        </Box>
                    </Box>
                </Box>) : (<>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}>
                                        Recharge Date
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}>
                                        Amount
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}>
                                        Remark
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#FFFFFF" }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataArray.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        sx={{ "&:hover": { backgroundColor: "#F8F9FA" } }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                <Typography sx={{ fontSize: "14px" }}>
                                                    {formatDate(record.createdAt).split(",")[0]}
                                                    {","}
                                                </Typography>
                                                <Typography sx={{ fontSize: "14px" }}>
                                                    {formatDate(record.createdAt).split(",")[1]}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "14px" }}>
                                                {record.transactionAmount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: "14px", color: "#808080" }}>
                                                {!record.remark ? "-" : record.remark}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={mapStatus(record.status)}
                                                size="small"
                                                sx={{
                                                    ...getStatusColor(record.status),
                                                    fontWeight: 400,
                                                    borderRadius: 4,
                                                    fontSize: "14px",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{renderActionButtons(record)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Box
                        sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 3 }}
                    >
                        <CustomPagination
                            page={page}
                            perPage={perPage}
                            total={total}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            player={true}
                        />
                    </Box>
                </>
            )}

            {/* Copy Notification Snackbar */}
            <Snackbar
                open={copyNotification}
                autoHideDuration={3000}
                onClose={handleCloseCopyNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                sx={{
                    "& .MuiSnackbarContent-root": {
                        backgroundColor: "#2E5BFF",
                        color: "white",
                        borderRadius: 2,
                        boxShadow: "0px 4px 12px rgba(46, 91, 255, 0.3)",
                    },
                }}
            >
                <Alert
                    onClose={handleCloseCopyNotification}
                    severity="success"
                    sx={{
                        width: "100%",
                        backgroundColor: "white",
                        color: "black",
                        borderRadius: 2,
                        "& .MuiAlert-icon": {
                            display: "none",
                        },
                        "& .MuiAlert-action": {
                            color: "black",
                        },
                        paddingLeft: "20px",
                    }}
                >
                    <Typography sx={{ fontWeight: 500, fontSize: "18px" }}>
                        Link Copied
                    </Typography>
                    <Typography
                        sx={{ fontWeight: 400, fontSize: "14px", color: "#808080" }}
                    >
                        Recharge link has been copied to clipboard
                    </Typography>
                </Alert>
            </Snackbar>

            {/* Dialogs */}
            <RechargeDialog
                open={rechargeDialogOpen}
                onClose={() => setRechargeDialogOpen(false)}
                handleRefresh={handleRefresh}
            />
        </Box>
    );
};
