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
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  Alert,
  Spinner
} from "reactstrap";
import { Loader } from "../../Loader";
import { walletService } from "../../../Provider/WalletManagement";
import axios from "axios";
import "../../../Assets/css/cashoutDialog.css";
import Parse from "parse";

// Xremit API Config
const XREMIT_API_URL = process.env.REACT_APP_Xremit_API_URL;
const XREMIT_API_KEY = process.env.REACT_APP_Xremit_API;
const XREMIT_API_SECRET = process.env.REACT_APP_Xremit_API_SECRET;

const CashOutDialog = ({ open, onClose, record, handleRefresh }) => {
  const [userName, setUserName] = useState(localStorage.getItem("username"));
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [giftCards, setGiftCards] = useState([]);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (record && open) {
      setUserName(record.username || "");
    } else {
      //resetFields();
    }
  }, [record, open]);

  useEffect(() => {
    async function WalletService() {
      const wallet = await walletService.getMyWalletData();
      const { cashAppId, paypalId, venmoId, zelleId, objectId, balance } = wallet.wallet;
      setPaymentMethods({
        cashAppId,
        paypalId,
        venmoId,
        zelleId,
        virtualCardId: "Gift Card",
      });
    }
    if (open) {
      WalletService();
    }
  }, [open]);

  // Fetch gift cards from API when "virtualCardId" is selected
  useEffect(() => {
    if (selectedPaymentMethod === "virtualCardId" && searchTerm.length >= 2) {
      fetchGiftCards(searchTerm);
    } else if (searchTerm.length === 0 && selectedPaymentMethod === "virtualCardId") {
      fetchGiftCards("");
    }
  }, [selectedPaymentMethod, searchTerm]);
  

//   const generateSignature = (method, path, body = null) => {
//     console.log(method,path,XREMIT_API_SECRET)
//     const requestBody = body ? JSON.stringify(body) : "";
//     const dataToHash = `${method}${path}${XREMIT_API_SECRET}${requestBody}`;
//     let signature = CryptoJS.SHA256(`${method}${path}${XREMIT_API_SECRET}`);
//     signature = signature.toString(CryptoJS.enc.Hex)

//     return signature;
// };


const fetchGiftCards = async (search = "") => {
  setLoadingGiftCards(true);
  setErrorMessage("");
  try {
    const response = await Parse.Cloud.run("fetchGiftCards", { searchTerm: search });
    setGiftCards(response.brands); // adjust according to your cloud function response structure
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    setErrorMessage("Failed to load gift cards.");
  } finally {
    setLoadingGiftCards(false);
  }
};


  const handleConfirm = () => {
    if (!selectedPaymentMethod) {
      setErrorMessage("Please select a payment method.");
      return;
    }

    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      setErrorMessage("Enter a valid cash-out amount.");
      return;
    }

    if (selectedPaymentMethod === "virtualCardId" && !selectedGiftCard) {
      setErrorMessage("Please select a gift card.");
      return;
    }

    handleSubmit();
  };

  /**
   * Submits a cash-out request.
   */
  const handleSubmit = async () => {
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
  
        const response = await Parse.Cloud.run("purchaseGiftCard", purchasePayload);
  
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
    } 
    // const method = "POST";
    // const path = "/playerRedeemRedords";

    // const requestData = {
    //   transactionAmount: redeemAmount,
    //   remark,
    //   type: "redeem",
    //   username: userName,
    //   id: userId,
    //   isCashOut: true,
    //   paymentMode: selectedPaymentMethod,
    //   paymentMethodType: selectedPaymentMethod,
    //   productId: selectedGiftCard?.productId || null, // Pass gift card productId
    // };

    // const signature = generateSignature(method, path);

    // try {
    //   const response = await axios.post(`${XREMIT_API_URL}${path}`, requestData, {
    //     headers: {
    //       "X-API-KEY": XREMIT_API_KEY,
    //       "Signature": signature,
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   if (response.data.status === "error") {
    //     setErrorMessage(response.data.message);
    //   } else {
    //     onClose();
    //     handleRefresh();
    //   }
    // } catch (error) {
    //   console.error("Error submitting redeem request:", error);
    //   setErrorMessage("An error occurred while processing your request.");
    // } finally {
    //   setLoading(false);
    // }
  };


  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <ModalHeader toggle={onClose}>Cash Out Request</ModalHeader>
      <ModalBody>
        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

        <Form>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label>Account</Label>
                <Input type="text" value={userName} disabled />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label>Cash Out Amount</Label>
                <Input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  min="1"
                />
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label>Payment Method</Label>
                <Input
                  type="select"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="">Select</option>
                  {Object.entries(paymentMethods).map(([key, value]) =>
                    value ? (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ) : null
                  )}
                </Input>
              </FormGroup>
            </Col>

            {/* Gift Card Selection */}
            {selectedPaymentMethod === "virtualCardId" && (
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
     <Spinner size="sm" color="primary" /> {/* or replace with  */}
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
                  selectedGiftCard?.productId === card.productId
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
              />
              <CardBody>
                <CardTitle tag="h6">{card.brandName}</CardTitle>
                <CardText>{card.productDescription}</CardText>
                <CardText>
                  <small>
                    Value Range: ${card.valueRestrictions.minVal} - $
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


            <Col md={12} className="text-end mt-3">
              <Button color="success" onClick={handleConfirm}>
                Confirm
              </Button>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CashOutDialog;
