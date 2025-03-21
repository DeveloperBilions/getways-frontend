import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  FormGroup,
  Label,
  Form,
  Input,
  FormText,
  Alert,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  Spinner,
} from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { walletService } from "../../../Provider/WalletManagement";
import "../../../Assets/css/cashoutDialog.css";
import {
  Button
} from "@mui/material";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const XREMIT_API_URL = process.env.REACT_APP_Xremit_API_URL;
const XREMIT_API_KEY = process.env.REACT_APP_Xremit_API;
const XREMIT_API_SECRET = process.env.REACT_APP_Xremit_API_SECRET;

const CashOutDialog = ({ open, onClose, record, handleRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50); // You can change how many cards per page
  const [totalPages, setTotalPages] = useState(1);

  const [userName, setUserName] = useState(localStorage.getItem("username"));
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemFees, setRedeemFees] = useState(0);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingsave, setLoadingSave] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [balance, setBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId: "",
    virtualCardId: "Gift Card",
    isCashAppDisabled: false,
    isPaypalDisabled: false,
    isVenmoDisabled: false,
    isZelleDisabled: false,
    isVirtualCardIdDisabled: false,
  });
  const [displayPaymentMethods, setDisplayPaymentMethods] = useState({
    cashAppId: "",
    paypalId: "",
    venmoId: "",
    zelleId: "",
    virtualCardId: "Gift Card",
    isCashAppDisabled: false,
    isPaypalDisabled: false,
    isVenmoDisabled: false,
    isZelleDisabled: false,
    isVirtualCardIdDisabled: false,
  });
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false); // Loading state for fetching payment methods
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // New state for selected payment method
  const [showAddPaymentMethodDialog, setShowAddPaymentMethodDialog] =
    useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(""); // State to track errors
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] =
    useState(""); // Store selected payment method type (e.g., cashAppId)
  const [giftCards, setGiftCards] = useState([]);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const resetFields = () => {
    setRedeemAmount("");
    setRemark("");
    setWarningMessage("");
    setErrorMessage("");
  };

  useEffect(() => {
    if (record && open) {
      //setUserName(record.username || "");
      //parentServiceFee();
    } else {
      resetFields();
    }
  }, [record, open]);

  useEffect(() => {
    async function WalletService() {
      const wallet = await walletService.getMyWalletData();
      const { cashAppId, paypalId, venmoId, zelleId, objectId, balance } =
        wallet.wallet;
      setBalance(balance);
      setPaymentMethods((prev) => ({
        ...prev,
        cashAppId,
        paypalId,
        venmoId,
        zelleId,
        virtualCardId: "Gift Card",
      }));
      setDisplayPaymentMethods((prev) => ({
        ...prev,
        cashAppId,
        paypalId,
        venmoId,
        zelleId,
      }));
      setWalletId(objectId);
    }

    if (open) {
      WalletService();
      fetchPaymentMethods(); // Fetch payment methods when the modal is open
    }
  }, [open]);

  useEffect(() => {
    if (selectedPaymentMethod === "Gift Card" && searchTerm.length >= 2) {
      fetchGiftCards(searchTerm);
    } else if (
      searchTerm.length === 0 &&
      selectedPaymentMethod === "Gift Card"
    ) {
      fetchGiftCards("");
    }
  }, [selectedPaymentMethod, searchTerm]);

  const fetchPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const query = new Parse.Query("PaymentMethods");
      const paymentMethodsRecord = await query.first(); // Fetch the first (and only) record
      if (paymentMethodsRecord) {
        setPaymentMethods((prev) => ({
          ...prev,
          isCashAppDisabled:
            paymentMethodsRecord.get("isCashAppDisabled") || false,
          isPaypalDisabled:
            paymentMethodsRecord.get("isPaypalDisabled") || false,
          isVenmoDisabled: paymentMethodsRecord.get("isVenmoDisabled") || false,
          isZelleDisabled: paymentMethodsRecord.get("isZelleDisabled") || false,
          isVirtualCardIdDisabled:
            paymentMethodsRecord.get("isVirtualCardIdDisabled") || false,
        }));
      } else {
        setErrorMessage("No payment methods found in the table.");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      setErrorMessage("Failed to fetch payment methods.");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };
  const handleConfirm = () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId, zelleId].filter(
      Boolean
    ).length;
    if (!selectedPaymentMethodType) {
      setErrorMessage("Please select a payment method type.");
      return;
    }
    if (parseFloat(redeemAmount) > parseFloat(balance || 0)) {
      setErrorMessage("Cash-out amount cannot exceed your wallet balance.");
      return;
    } else {
      setErrorMessage("");
    }
    if (methodCount === 0) {
      setWarningMessage(
        "No payment methods are added. Please add a payment method to proceed."
      );
      setShowWarningModal(true);
    }
    // else if (methodCount > 0 && methodCount < 3) {
    //   setWarningMessage(
    //     `You have ${methodCount} payment mode${
    //       methodCount > 1 ? "s" : ""
    //     } added for refunds. Would you like to add/edit the payment method?`
    //   );
    //   setShowWarningModal(true);
    // }
    else {
      handleSubmit(); // Call handleSubmit directly if 3 payment methods are already added
    }
  };

  const handleSubmit = async () => {
    const { cashAppId, paypalId, venmoId, zelleId } = paymentMethods;

    if (!cashAppId && !paypalId && !venmoId && !zelleId) {
      setErrorMessage("Refund cannot be processed without a payment mode.");
      return;
    }

    if (!redeemAmount) {
      setErrorMessage(
        "Cashout amount cannot be empty. Please enter a valid amount."
      );
      return;
    }

    if (redeemAmount <= 0) {
      setErrorMessage(
        "Cashout amount cannot be negative or 0. Please enter a valid amount."
      );
      return;
    }
    if (redeemAmount < 15) {
      setErrorMessage("Cashout request should not be less than $15.");
      return;
    }
    const rawData = {
      redeemServiceFee: redeemFees,
      transactionAmount: redeemAmount,
      remark,
      type: "redeem",
      walletId: walletId,
      username: userName,
      id: userId,
      isCashOut: true,
      paymentMode: selectedPaymentMethodType,
      paymentMethodType: selectedPaymentMethod,
    };

    setLoading(true);

    if (selectedPaymentMethod === "virtualCardId") {
      try {
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const purchasePayload = {
          orderId: orderId,
          price: parseFloat(redeemAmount),
          productId: selectedGiftCard.productId,
          externalUserId: userId,
          externalUserFirstName: userName, // You can split if you store full names
          externalUserLastName: "User",
          externalUserEmail: record?.email,
        };

        const response = await Parse.Cloud.run(
          "purchaseGiftCard",
          purchasePayload
        );

        if (response && response.status === "success") {
          onClose();
          handleRefresh();
        } else {
          setErrorMessage(response.message || "Purchase failed");
        }
      } catch (error) {
        console.error("Gift card purchase error:", error);
        setErrorMessage("Gift card purchase failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await Parse.Cloud.run("playerRedeemRedords", rawData);
        if (response?.status === "error") {
          setErrorMessage(response?.message);
        } else {
          onClose();
          setRedeemAmount("");
          setRemark("");
          handleRefresh();
        }
      } catch (error) {
        console.error("Error Redeem Record details:", error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const fetchGiftCards = async (search, page = 1) => {
    setLoadingGiftCards(true);
    setErrorMessage("");

    try {
      let combinedResults = [];

      if ((!search || search.trim() === "") && page <= 1) {
        const masterResponse = await Parse.Cloud.run("fetchGiftCards", {
          searchTerm: "Mastercard",
          currentPage: page,
          perPage,
        });
        const masterCards = masterResponse.brands || [];

        const allResponse = await Parse.Cloud.run("fetchGiftCards", {
          searchTerm: "",
          currentPage: page,
          perPage,
        });
        const allCards = allResponse.brands || [];

        const productIds = new Set();
        combinedResults = [...masterCards, ...allCards].filter((card) => {
          if (productIds.has(card.productId)) return false;
          productIds.add(card.productId);
          return true;
        });

        setTotalPages(Math.ceil(allResponse.totalCount / perPage));
      } else {
        const response = await Parse.Cloud.run("fetchGiftCards", {
          searchTerm: search.trim(),
          currentPage: page,
          perPage,
        });
        combinedResults = response.brands || [];
        setTotalPages(Math.ceil(response.totalCount / perPage));
      }

      setGiftCards(combinedResults);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      setErrorMessage("Failed to load gift cards.");
    } finally {
      setLoadingGiftCards(false);
    }
  };

  const handleAddPaymentMethod = async (newMethods) => {
    const trimmedMethods = {
      cashAppId: paymentMethods?.cashAppId?.trim() || "",
      venmoId: paymentMethods?.venmoId?.trim() || "",
      paypalId: paymentMethods?.paypalId?.trim() || "",
      zelleId: paymentMethods?.zelleId?.trim() || "",
    };
    if (
      (!paymentMethods?.cashAppId?.trim() ||
        paymentMethods?.cashAppId?.trim() === "") &&
      (!paymentMethods?.venmoId?.trim() ||
        paymentMethods?.venmoId?.trim() === "") &&
      (!paymentMethods?.paypalId?.trim() ||
        paymentMethods?.paypalId?.trim() === "") &&
      (!paymentMethods?.zelleId?.trim() ||
        paymentMethods?.zelleId?.trim() === "")
    ) {
      setError("Add at least one valid payment method.");
      return false;
    }
    if (
      paymentMethods?.cashAppId?.trim() &&
      !/^(?=.*[a-zA-Z]).{1,20}$/.test(paymentMethods?.cashAppId.trim())
    ) {
      setError(
        "CashApp ID must include at least 1 letter and be no longer than 20 characters."
      );
      return false;
    }
    if (
      paymentMethods?.paypalId?.trim() &&
      !/^[a-zA-Z0-9]{13}$/.test(paymentMethods?.paypalId.trim())
    ) {
      setError("PayPal ID must be exactly 13 alphanumeric characters.");
      return false;
    }
    if (
      paymentMethods?.venmoId?.trim() &&
      !/^[a-zA-Z0-9]+$/.test(paymentMethods?.venmoId.trim())
    ) {
      setError(
        "Venmo ID can only contain letters and numbers (no symbols, dashes, or spaces)."
      );
      return false;
    }
    try {
      setLoadingSave(true);
      await walletService.updatePaymentMethods(trimmedMethods);
      // Check if the previously selected payment method still exists
      if (newMethods[selectedPaymentMethodType]) {
        setSelectedPaymentMethod(newMethods[selectedPaymentMethodType]);
      } else {
        // Reset selection if the previously selected method is no longer valid
        setSelectedPaymentMethodType("");
        setSelectedPaymentMethod("");
      }
      setPaymentMethods(newMethods);
      setDisplayPaymentMethods(newMethods);
      setShowAddPaymentMethodDialog(false);
      setShowWarningModal(false);
      setError("");
      // handleSubmit(); // Automatically call handleSubmit after adding payment methods
    } catch (error) {
      console.error("Error updating payment methods:", error);
      setError(error.message);
    } finally {
      setLoadingSave(false);
    }
  };
  const paymentOptions = [
    // {
    //   key: "cashAppId",
    //   label: "CashApp",
    //   disabled: paymentMethods.isCashAppDisabled,
    // },
    // {
    //   key: "paypalId",
    //   label: "PayPal",
    //   disabled: paymentMethods.isPaypalDisabled,
    // },
    // {
    //   key: "venmoId",
    //   label: "Venmo",
    //   disabled: paymentMethods.isVenmoDisabled,
    // },
    // {
    //   key: "zelleId",
    //   label: "Zelle",
    //   disabled: paymentMethods.isZelleDisabled,
    // },
    { key: "virtualCardId", label: "Gift Card", disabled: false },
  ];
  // console.log(paymentMethods, "paymentMethods");
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={onClose} size="lg" centered>
          <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
            Cash Out Request
          </ModalHeader>
          <ModalBody>
            {errorMessage && (
              <Alert color="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
            {loadingPaymentMethods && (
              <Loader message="Fetching available payment methods..." />
            )}
            <Form>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName">Account</Label>
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      value={userName}
                      required
                      disabled
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="redeemAmount">Cash Out Amount</Label>
                    <Input
                      id="redeemAmount"
                      name="redeemAmount"
                      type="text"
                      autoComplete="off"
                      value={redeemAmount}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "" || /^\d*$/.test(value)) {
                          if (value === "") {
                            setRedeemAmount(value);
                          } else if (value.includes(".")) {
                            value = Math.floor(parseFloat(value));
                            setRedeemAmount(value);
                          } else if (/^\d*$/.test(value)) {
                            setRedeemAmount(value);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.keyCode === 190) {
                          // Prevent the default behavior of typing a decimal
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="remark">Remark</Label>
                    <Input
                      id="remark"
                      name="remark"
                      type="textarea"
                      autoComplete="off"
                      onChange={(e) => setRemark(e.target.value)}
                      maxLength={30}
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="remark">Payment Method</Label>
                    <div className="row">
                      {Object.entries(displayPaymentMethods).filter(
                        ([key, value]) =>
                          value &&
                          paymentOptions.some((option) => option.key === key)
                      ).length === 0 ? ( // Filter valid methods
                        <div className="col-12 text-start text-danger">
                          <p>** No Payment methods added **</p>
                        </div>
                      ) : (
                        paymentOptions.map(({ key, label, disabled }) =>
                          displayPaymentMethods[key] ? ( // Check if the specific method exists
                            <div key={key} className="col-6 mt-2">
                              <div
                                className={`border p-3 w-100 rounded d-flex align-items-start cashout ${
                                  disabled ? "disabled-method" : ""
                                }`}
                              >
                                <Input
                                  type="radio"
                                  id={key}
                                  name="paymentMethod"
                                  value={key}
                                  checked={selectedPaymentMethodType === key}
                                  onChange={(e) => {
                                    setSelectedPaymentMethodType(
                                      e.target.value
                                    );
                                    setSelectedPaymentMethod(
                                      displayPaymentMethods[key]
                                    );
                                  }}
                                  disabled={disabled} // Disable radio button if the method is not allowed
                                  required
                                />
                                <Label
                                  for={key}
                                  className="form-check-label d-flex flex-column px-3"
                                >
                                  <span>{label}</span>
                                  <span style={{ fontSize: "12px" }}>
                                    {displayPaymentMethods[key]}
                                  </span>
                                  {disabled && (
                                    <span
                                      className="text-danger"
                                      style={{ fontSize: "12px" }}
                                    >
                                      This payment mode is currently not
                                      available
                                    </span>
                                  )}
                                </Label>
                              </div>
                            </div>
                          ) : null
                        )
                      )}
                    </div>
                  </FormGroup>
                </Col>

                {selectedPaymentMethod === "Gift Card" && (
                  <>
                    <Col md={12}>
                      <FormGroup>
                        <Label>Find a Gift Card</Label>
                        <Input
                          type="text"
                          placeholder="Search by brand name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={12}>
                      {loadingGiftCards ? (
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                          <Spinner size="sm" color="primary" />{" "}
                          {/* or replace with  */}
                        </div>
                      ) : (
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <Row>
                            {giftCards.map((card) => (
                              <Col md={6} key={card.productId}>
                                <Card
                                  onClick={() => setSelectedGiftCard(card)}
                                  style={{
                                    cursor: "pointer",
                                    border:
                                      selectedGiftCard?.productId ===
                                      card.productId
                                        ? "2px solid #007bff"
                                        : "1px solid #ddd",
                                    transition: "all 0.3s ease-in-out",
                                  }}
                                >
                                  <CardImg
                                    top
                                    width="100%"
                                    src={card.productImage}
                                    alt={card.brandName}
                                    style={{
                                      height: "150px",
                                      objectFit: "contain",
                                      padding: "10px",
                                    }} // Smaller image
                                  />
                                  <CardBody>
                                    <CardTitle
                                      tag="h6"
                                      style={{
                                        fontWeight: "600",
                                        color: "#222", // dark blackish color
                                        fontSize: "16px",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      {card.brandName}
                                    </CardTitle>
                                    <CardText
                                      style={{
                                        color: "#6c757d", // gray color
                                        fontSize: "13px",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        minHeight: "72px",
                                      }}
                                    >
                                      {card.productDescription}
                                    </CardText>
                                    <CardText>
                                      <small>
                                        Value Range: $
                                        {card.valueRestrictions.minVal} - $
                                        {card.valueRestrictions.maxVal}
                                      </small>
                                    </CardText>
                                  </CardBody>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}
                    </Col>
                  </>
                )}

                <Col md={12} className="d-flex justify-content-center mt-3">
                  <Button
                  variant="outlined"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      fetchGiftCards(searchTerm, currentPage - 1);
                    }}
                  >
                    Previous
                  </Button>
                  <span style={{ margin: "0 10px", alignSelf: "center" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                  variant="outlined"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      fetchGiftCards(searchTerm, currentPage + 1);
                    }}
                  >
                    Next
                  </Button>
                </Col>

                {/* <Col md={12} className="d-flex justify-content-end my-2">
                  <span
                    style={{
                      textDecoration: "underline",
                      color: "#007bff",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                    onClick={() => setShowAddPaymentMethodDialog(true)}
                  >
                    Add / Edit Payment Method
                  </span>
                </Col> */}
                <Col md={12} >
                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="contained" color="success"
                      className="mx-2"
                      onClick={handleConfirm}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        toggle={() => {
          if (
            paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId
          ) {
            setShowWarningModal(false);
          } else {
            setErrorMessage(
              "Refund cannot be processed without a payment mode."
            );
            setShowWarningModal(false);
          }
        }}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowWarningModal(false)}>
          Attention
        </ModalHeader>
        <ModalBody>
          <p>{warningMessage}</p>
          <div className="d-flex justify-content-end">
            {paymentMethods.cashAppId ||
            paymentMethods.paypalId ||
            paymentMethods.venmoId ? (
              <Button
                color="primary"
                onClick={() => {
                  setShowWarningModal(false);
                  handleSubmit();
                }}
              >
                No, Continue
              </Button>
            ) : null}
            <Button
              color="primary"
              className="ms-2"
              onClick={() => {
                setShowAddPaymentMethodDialog(true);
                setShowWarningModal(false);
              }}
            >
              Add/Edit Payment Method
            </Button>
            <Button
              color="secondary"
              className="ms-2"
              onClick={() => {
                setShowWarningModal(false);
                handleSubmit();
              }}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </Modal>
      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddPaymentMethodDialog}
        toggle={() => setShowAddPaymentMethodDialog(false)}
        size="md"
        centered
      >
        <ModalHeader>Add/Edit Payment Method</ModalHeader>
        <ModalBody>
          {error && (
            <Alert color="danger" className="mt-2">
              {error}
            </Alert>
          )}

          <Row>
            <Col md={12}>
              <FormGroup>
                <Label for="cashAppId">CashApp ID</Label>
                <Input
                  id="cashAppId"
                  name="cashAppId"
                  type="text"
                  value={paymentMethods.cashAppId}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      cashAppId: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label for="paypalId">PayPal ID</Label>
                <Input
                  id="paypalId"
                  name="paypalId"
                  type="text"
                  value={paymentMethods.paypalId}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      paypalId: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label for="venmoId">Venmo ID</Label>
                <Input
                  id="venmoId"
                  name="venmoId"
                  type="text"
                  value={paymentMethods.venmoId}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      venmoId: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label for="zelleId">Zelle ID</Label>
                <Input
                  id="zelleId"
                  name="zelleId"
                  type="text"
                  value={paymentMethods.zelleId}
                  onChange={(e) =>
                    setPaymentMethods({
                      ...paymentMethods,
                      zelleId: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={12} className="d-flex justify-content-end">
              <Button
                color="primary"
                type="submit"
                disabled={loadingsave}
                onClick={() => handleAddPaymentMethod(paymentMethods)}
              >
                {loadingsave ? (
                  <span className="d-flex align-items-center">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                color="secondary"
                className="ms-2"
                onClick={() => {
                  setShowAddPaymentMethodDialog(false);
                  setPaymentMethods(displayPaymentMethods);
                }}
                disabled={loadingsave} // Disable cancel button while saving
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default CashOutDialog;
