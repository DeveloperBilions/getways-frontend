import React, { useState, useEffect } from "react";
import {
  Button,
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
} from "reactstrap";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { walletService } from "../../../Provider/WalletManagement";
import "../../../Assets/css/cashoutDialog.css";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CashOutDialog = ({ open, onClose, record, handleRefresh }) => {
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
    virtualCardId:"",
    isCashAppDisabled: false,
    isPaypalDisabled: false,
    isVenmoDisabled: false,
    isZelleDisabled: false,
    isVirtualCardIdDisabled:false
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
      const { cashAppId, paypalId, venmoId,zelleId, objectId, balance } = wallet.wallet;
      setBalance(balance);
      setPaymentMethods((prev) => ({
        ...prev,
        cashAppId,
        paypalId,
        venmoId,
        zelleId,
        virtualCardId:"Gift Card"
      }));
      setWalletId(objectId);
    }

    if (open) {
      WalletService();
      fetchPaymentMethods(); // Fetch payment methods when the modal is open
    }
  }, [open]);
  const giftCards = [
    {
      productId: 11000000001,
      brandName: "Venue 1 - Golf",
      productImage: "https://app.giftango.com/GPCGraphics/CIR_000716_00.png",
      productDescription: "Perfect for any golf enthusiast. Redeem at Venue Golf.",
      valueRestrictions: { minVal: 0, maxVal: 2000 },
      discount: 1.5,
    },
    {
      productId: 11000000002,
      brandName: "Venue 2 - Spa",
      productImage: "https://app.giftango.com/GPCGraphics/CIR_000717_00.png",
      productDescription: "Relax and unwind at Venue Spa with this gift card.",
      valueRestrictions: { minVal: 25, maxVal: 25 },
      discount: 3.0,
    },
    {
      productId: 11000000004,
      brandName: "Venue 3 - Boutique",
      productImage: "https://app.giftango.com/GPCGraphics/CIR_000718_00.png",
      productDescription: "Exclusive boutique items with Venue Boutique gift card.",
      valueRestrictions: { minVal: 100, maxVal: 100 },
      discount: 5.0,
    },
    {
      productId: 11000000005,
      brandName: "Venue 4 - Resorts One Mimosa Brunch Buffet",
      productImage: "https://app.giftango.com/GPCGraphics/CIR_000719_00.png",
      productDescription: "Enjoy a luxury buffet at Venue Resorts with this card.",
      valueRestrictions: { minVal: 35, maxVal: 35 },
      discount: 5.5,
    },
    {
      "countryName": "United States of America",
      "currency": "USD",
      "productId": 12000000434,
      "brandName": "Mastercard® eReward Virtual Account, 6-Month Expiration ",
      "productImage": "https://app.giftango.com/GPCGraphics/C1951_1501_Mastercard_Reward_Pathward_Virtual_Sweep_Termination_Cover_Front_v3_083022_CR80_092222_300x190_RGB.png",
      "productDescription": "The MastercardÂ? eReward Virtual Account is a convenient and flexible way to recognize employees and encourage customer loyalty.Â \n\n  Available in open denominations\n  Maximum card balances up to $10,000\n  Virtual Account may be used online, over the phone or through mail order everywhere debit Mastercard is accepted\n  Virtual Account cannot be used to obtain cash from any ATM or Point of Sale transaction\n",
      "termsAndConditions": "<a href='https://app.giftango.com/GPCGraphics/C1951_600_eReward_Dual_Visa_MC_Virtual_Physical_Pathward_Sweep_No_Cash_Intl_CHA_v4_061422.pdf'>Cardholder agreement</a>\nVirtual Account is issued by PathwardÂ? , N.A., Member FDIC, pursuant to license by Mastercard International Incorporated. Virtual Account can be used online or via phone everywhere debit Mastercard is accepted. NO CASH OR ATM ACCESS. Terms and Conditions apply. See Virtual Accountholder Agreement for details.",
      "howToUse": "",
      "expiryAndValidity": "",
      "valueRestrictions": {
          "minVal": 5.0,
          "maxVal": 1000.0
      },
      "denominations": [],
      "discount": 3.0,
      "discountTier1Amount": 1000.0,
      "discountTier1": 1.7,
      "discountTier2Amount": 0.0,
      "discountTier2": 0.0
  }
  ];

  // Filter gift cards by search term
  const filteredGiftCards = giftCards.filter((card) =>
    card.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const fetchPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const query = new Parse.Query("PaymentMethods");
      const paymentMethodsRecord = await query.first(); // Fetch the first (and only) record
      if (paymentMethodsRecord) {
        setPaymentMethods((prev) => ({
          ...prev,
          isCashAppDisabled: paymentMethodsRecord.get("isCashAppDisabled") || false,
          isPaypalDisabled: paymentMethodsRecord.get("isPaypalDisabled") || false,
          isVenmoDisabled: paymentMethodsRecord.get("isVenmoDisabled") || false,
          isZelleDisabled: paymentMethodsRecord.get("isZelleDisabled") || false,
          isVirtualCardIdDisabled: paymentMethodsRecord.get("isVirtualCardIdDisabled") || false,
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
    const { cashAppId, paypalId, venmoId,zelleId } = paymentMethods;
    const methodCount = [cashAppId, paypalId, venmoId,zelleId].filter(Boolean).length;
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
      setErrorMessage("Cashout amount cannot be empty. Please enter a valid amount.");
      return;
    }
    
    if (redeemAmount <= 0) {
      setErrorMessage("Cashout amount cannot be negative or 0. Please enter a valid amount.");
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
      username:userName,
      id:userId,
      isCashOut: true,
      paymentMode: selectedPaymentMethodType,
      paymentMethodType: selectedPaymentMethod,
    };

    setLoading(true);
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
  };

  const handleAddPaymentMethod = async (newMethods) => {
    const trimmedMethods = {
      cashAppId: paymentMethods?.cashAppId?.trim() || "",
      venmoId: paymentMethods?.venmoId?.trim() || "",
      paypalId: paymentMethods?.paypalId?.trim() || "",
      zelleId: paymentMethods?.zelleId?.trim() || "",
    };
    if (
      (!paymentMethods?.cashAppId?.trim() || paymentMethods?.cashAppId?.trim() === "") &&
      (!paymentMethods?.venmoId?.trim() || paymentMethods?.venmoId?.trim() === "") &&
      (!paymentMethods?.paypalId?.trim() || paymentMethods?.paypalId?.trim() === "") && 
      (!paymentMethods?.zelleId?.trim() || paymentMethods?.zelleId?.trim() === "")
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
      paymentMethods?.venmoId?.trim() &&
      !/^[a-zA-Z0-9]+$/.test(paymentMethods?.venmoId.trim())
    ) {
      setError(
        "Venmo ID can only contain letters and numbers (no symbols, dashes, or spaces)."
      );
      return false;
    }
    try {
      setLoadingSave(true)
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
      setShowAddPaymentMethodDialog(false);
      setShowWarningModal(false);
      // handleSubmit(); // Automatically call handleSubmit after adding payment methods
    } catch (error) {
      console.error("Error updating payment methods:", error);
    }finally{
      setLoadingSave(false)
    }
  };
  const paymentOptions = [
    { key: "cashAppId", label: "CashApp", disabled: paymentMethods.isCashAppDisabled },
    { key: "paypalId", label: "PayPal", disabled: paymentMethods.isPaypalDisabled },
    { key: "venmoId", label: "Venmo", disabled: paymentMethods.isVenmoDisabled },
    { key: "zelleId", label: "Zelle", disabled: paymentMethods.isZelleDisabled },
    { key: "virtualCardId", label: "Gift Card", disabled: paymentMethods.isVirtualCardIdDisabled }
  ];
  console.log(paymentMethods,"paymentMethods")
  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={onClose} size="md" centered>
          <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
            Cash Out Request
          </ModalHeader>
          <ModalBody>
            {errorMessage && (
              <Alert color="danger" className="mt-2">
                {errorMessage}
              </Alert>
            )}
            {loadingPaymentMethods && <Loader message="Fetching available payment methods..." />}
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
                        if (value === '' || /^\d*$/.test(value)) {
                          if(value === ''){
                            setRedeemAmount(value);
                          }
                          else if (value.includes('.')) {
                            value = Math.floor(parseFloat(value));
                            setRedeemAmount(value);
                          }
                          else if (/^\d*$/.test(value)) {
                            setRedeemAmount(value);
                          }
                        }
                      }}
                      onKeyDown={(e) =>{
                        if (e.keyCode === 190) {
                          // Prevent the default behavior of typing a decimal
                          e.preventDefault();
                        }
                      }}
                      required/>
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
    {Object.entries(paymentMethods)
      .filter(([key, value]) => value && paymentOptions.some(option => option.key === key)) // Filter valid methods
      .length === 0 ? (
        <div className="col-12 text-start text-danger">
          <p>** No Payment methods added **</p>
        </div>
      ) : (
        paymentOptions.map(({ key, label, disabled }) =>
          paymentMethods[key] ? ( // Check if the specific method exists
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
                    setSelectedPaymentMethodType(e.target.value);
                    setSelectedPaymentMethod(paymentMethods[key]);
                  }}
                  disabled={disabled} // Disable radio button if the method is not allowed
                  required
                />
                <Label
                  for={key}
                  className="form-check-label d-flex flex-column px-3"
                >
                  <span>{label}</span>
                  <span style={{ fontSize: "12px" }}>{paymentMethods[key]}</span>
                  {disabled && (
                    <span className="text-danger" style={{ fontSize: "12px" }}>
                      This payment mode is currently not available
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

                {selectedPaymentMethodType === "virtualCardId" && (
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

    <Col md={12} style={{ maxHeight: "300px", overflowY: "auto" }}>
      <Row>
        {filteredGiftCards.map((card) => (
          <Col md={6} key={card.productId}>
            <Card
             onClick={() => {
              setPaymentMethods((p) => ({ ...p, virtualCardId: card.productId }));
              setSelectedGiftCard(card);
            }}            
              style={{
                cursor: "pointer",
                border: selectedGiftCard?.productId === card.productId ? "2px solid #007bff" : "1px solid #ddd",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <CardImg top width="100%" src={card.productImage} alt={card.brandName} />
              <CardBody>
                <CardTitle tag="h6">{card.brandName}</CardTitle>
                <CardText>{card.productDescription}</CardText>
                <CardText>
                  <small>
                    Value Range: ${card.valueRestrictions.minVal} - ${card.valueRestrictions.maxVal}
                  </small>
                </CardText>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Col>
  </>
)}
                <Col md={12} className="d-flex justify-content-end my-2">
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
                </Col>
                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button
                      color="success"
                      className="mx-2"
                      onClick={handleConfirm}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </Button>
                    <Button color="secondary" onClick={onClose}>
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
        {error &&  <Alert color="danger" className="mt-2">{error}</Alert>}

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
                <Button color="primary" type="submit" disabled={loadingsave} onClick={()=> handleAddPaymentMethod(paymentMethods)}>
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
                  onClick={() => setShowAddPaymentMethodDialog(false)}
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
