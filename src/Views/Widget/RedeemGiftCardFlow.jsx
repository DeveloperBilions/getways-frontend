// RedeemGiftCardFlow.js
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  Spinner,
} from "reactstrap";
import { Box, Typography, Button } from "@mui/material";
import { Parse } from "parse";
import { useNotify } from "react-admin";
import UserGiftInfoDialog from "../Player/dialog/UserGiftInfoDialog";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RedeemGiftCardFlow = ({ amount, onClose, onBack, userId,platform }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [giftCards, setGiftCards] = useState([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const notify = useNotify();
  const perPage = 50;

  useEffect(() => {
    fetchGiftCards(searchTerm);
  }, [searchTerm]);

  const fetchGiftCards = async (search, page = 1) => {
    setLoadingGiftCards(true);
    setErrorMessage("");
    try {
      const masterResponse = await Parse.Cloud.run("fetchGiftCards", {
        searchTerm: "Mastercard",
        currentPage: page,
        perPage,
      });
      const allResponse = await Parse.Cloud.run("fetchGiftCards", {
        searchTerm: search.trim(),
        currentPage: page,
        perPage,
      });
      const allCards = [...masterResponse.result, ...allResponse.result];
      const unique = Array.from(
        new Map(allCards.map((card) => [card.productId, card])).values()
      );
      setGiftCards(unique);
      setTotalPages(Math.ceil(allResponse.totalCount / perPage));
    } catch (err) {
      setErrorMessage("Failed to load gift cards.");
    } finally {
      setLoadingGiftCards(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedGiftCard) return setErrorMessage("Select a gift card first.");
    setShowInfoDialog(true);
  };

  const handleSubmit = async (fname, lname, mail) => {
    try {
      setLoading(true);

      const payload = {
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        price: parseFloat(amount),
        productId: selectedGiftCard.productId,
        productImage: selectedGiftCard?.productImage,
        externalUserId: userId,
        externalUserFirstName: fname,
        externalUserLastName: lname,
        externalUserEmail: mail,
        platform
      };

      const response = await Parse.Cloud.run("purchaseGiftCardExternal", payload);

      if (response?.status === "success") {
        notify("Gift card added successfully", { type: "success" });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        setErrorMessage(response?.error || "Purchase failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Gift card purchase failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      {success ? (
        <Box textAlign="center">
          <Typography variant="h6" color="success.main" gutterBottom>
            🎉 Cash-out Successful!
          </Typography>
          <Typography>Your gift card has been added to your account.</Typography>
        </Box>
      ) : (
        <>
         <FormGroup>
                <Label style={{ fontWeight: "600", fontSize: "14px" }}>
                  Find your Gift card
                </Label>
                <Input
                  type="text"
                  placeholder="Search gift cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded"
                />
              </FormGroup>

              {errorMessage && (
                <Box className="alert alert-danger mt-2">{errorMessage}</Box>
              )}

              {loadingGiftCards ? (
                <Box style={{ textAlign: "center", marginTop: "20px" }}>
                  <Spinner size="sm" color="primary" /> Loading gift cards...
                </Box>
              ) : (
                <Box
                  style={{
                    maxHeight: "90vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    width: "100%",
                  }}
                >
                  <Row>
                    {giftCards.map((card) => (
                      <Col md={4} key={card.productId} className="mb-3">
                        <Card
                          onClick={() => setSelectedGiftCard(card)}
                          style={{
                            cursor: "pointer",
                            border:
                              selectedGiftCard?.productId === card.productId
                                ? "2px solid #007bff"
                                : "1px solid #ddd",
                            transition: "all 0.3s ease-in-out",
                            borderRadius: "10px",
                          }}
                        >
                          <CardImg
                            top
                            width="100%"
                            src={card.productImage}
                            alt={card.brandName}
                            style={{
                              // height: "120px",
                              objectFit: "contain",
                              padding: "10px 10px 0px 10px",
                              borderRadius: "15px",
                            }}
                          />
                          <CardBody>
                            <CardTitle
                              tag="h6"
                              style={{
                                fontWeight: "600",
                                color: "#222",
                                fontSize: "16px",
                                marginBottom: "8px",
                              }}
                            >
                              {card.brandName}
                            </CardTitle>
                            <CardText>
                              <small>
                                Value Range: ${card.valueRestrictions.minVal} -
                                ${card.valueRestrictions.maxVal}
                              </small>
                            </CardText>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Box>
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
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" fullWidth sx={{ mr: 1 }} onClick={onBack}>
              Back
            </Button>
            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </Box>
        </>
      )}

      <UserGiftInfoDialog
        open={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        onSubmit={({ firstName, lastName, email }) => {
          setShowInfoDialog(false);
          setFirstName(firstName);
          setLastName(lastName);
          setEmail(email);
          handleSubmit(firstName, lastName, email);
        }}
        initialData={{ firstName, lastName, email }}
      />
    </Box>
  );
};

export default RedeemGiftCardFlow;
