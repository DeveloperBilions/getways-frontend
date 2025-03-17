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
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { dataProvider } from "../../../Provider/parseDataProvider";

// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const FinalApproveRedeemDialog = ({ open, onClose, record, handleRefresh }) => {
  const [userName, setUserName] = useState("");
  const [redeemAmount, setRedeemAmount] = useState();
  const [remark, setRemark] = useState();
  const [responseData, setResponseData] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemRemarks, setRedeemRemarks] = useState(""); // State for Redeem Remarks
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Gift Card List
  const giftCards = [
    {
      "countryName": "United States of America",
      "currency": "USD",
      "productId": 12000000434,
      "brandName": "Mastercard® eReward Virtual Account, 6-Month Expiration ",
      "productImage": "https://app.giftango.com/GPCGraphics/C1951_1501_Mastercard_Reward_Pathward_Virtual_Sweep_Termination_Cover_Front_v3_083022_CR80_092222_300x190_RGB.png",
      "productDescription": "The MastercardÂ? eReward Virtual Account is a convenient and flexible way to recognize employees and encourage customer loyalty.Â \n\n  Available in open denominations\n  Maximum card balances up to $10,000\n ",
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

  const resetFields = () => {
    setUserName("");
    setRedeemAmount("");
    setRemark("");
    setRedeemRemarks("");
    setSelectedGiftCard(null);
  };

  useEffect(() => {
    if (record && open) {
      setUserName(record.username || "");
      setRedeemAmount(record?.transactionAmount || "");
      setRemark(record?.remark || "");
    } else {
      resetFields();
    }
  }, [record, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (record?.paymentMethodType === "virtualCardId" && !selectedGiftCard) {
      alert("Please select a gift card before approving.");
      return;
    }

    setLoading(true);
    try {
      await dataProvider.finalApprove(record?.id, {
        redeemRemarks,
        giftCardId: selectedGiftCard?.productId || null,
      });

      onClose();
      handleRefresh();
    } catch (error) {
      console.error("Error approving redeem record:", error);
      setResponseData("Error processing redemption.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    handleRefresh();
    resetFields();
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal isOpen={open} toggle={handleClose} size="lg" centered>
          <ModalHeader toggle={handleClose} className="border-bottom-0 pb-0">
            CashOut Confirmation
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="userName">Account</Label>
                    <Input id="userName" name="userName" type="text" value={userName} required disabled />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label>Payment Method Type</Label>
                    <Input id="paymentMethodType" type="text" value={record?.paymentMethodType} disabled />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label for="redeemAmount">Redeem Amount</Label>
                    <Input id="redeemAmount" name="redeemAmount" type="number" value={redeemAmount} disabled />
                  </FormGroup>
                </Col>

                {record?.paymentMode === "virtualCardId" && (
  <>
    <Col md={12} >
      <Row>
        {filteredGiftCards.map((card) => (
          <Col md={6} key={card.productId}>
            <Card
              onClick={() => setSelectedGiftCard(card)}
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


                <Col md={12}>
                  <FormGroup>
                    <Label for="redeemRemarks">CashOut Remarks</Label>
                    <Input
                      id="redeemRemarks"
                      name="redeemRemarks"
                      type="textarea"
                      value={redeemRemarks}
                      maxLength={30}
                      onChange={(e) => setRedeemRemarks(e.target.value)}
                    />
                  </FormGroup>
                </Col>

                {responseData && (
                  <Col sm={12}>
                    <Label className="text-danger mb-2">{responseData}</Label>
                  </Col>
                )}

                <Col md={12}>
                  <div className="d-flex justify-content-end">
                    <Button color="success" type="submit" className="mx-2" disabled={loading}>
                      {loading ? "Processing..." : "Confirm"}
                    </Button>
                    <Button color="secondary" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default FinalApproveRedeemDialog;
