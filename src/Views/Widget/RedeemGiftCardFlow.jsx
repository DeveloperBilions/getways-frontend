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

const RedeemGiftCardFlow = ({ amount, onClose, onBack, userId }) => {
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
    const user = await Parse.User.current()?.fetch();
    setFirstName(user?.get("gift_firstName") || "");
    setLastName(user?.get("gift_lastName") || "");
    setEmail(user?.get("gift_email") || "");
    setShowInfoDialog(true);
  };

  const handleSubmit = async (fname, lname, mail) => {
    try {
      setLoading(true);
      const user = await Parse.User.current()?.fetch();
      user.set("gift_firstName", fname);
      user.set("gift_lastName", lname);
      user.set("gift_email", mail);
      await user.save(null, { useMasterKey: true });

      const payload = {
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        price: parseFloat(amount),
        productId: selectedGiftCard.productId,
        productImage: selectedGiftCard?.productImage,
        externalUserId: userId,
        externalUserFirstName: fname,
        externalUserLastName: lname,
        externalUserEmail: mail,
      };

      const response = await Parse.Cloud.run("purchaseGiftCard", payload);

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
       <Button onClick={onBack} size="small" variant="outlined">
          ← Back
        </Button>
      {success ? (
        <Box textAlign="center">
          <Typography variant="h6" color="success.main" gutterBottom>
            🎉 Cash-out Successful!
          </Typography>
          <Typography>Your gift card has been added to your account.</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Select a Gift Card
          </Typography>
          <Input
            type="text"
            placeholder="Search gift cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded"
          />
          {errorMessage && <Box color="error.main" mt={1}>{errorMessage}</Box>}

          {loadingGiftCards ? (
            <Box mt={2} textAlign="center">
              <Spinner color="primary" size="sm" /> Loading cards...
            </Box>
          ) : (
            <Row>
              {giftCards.map((card) => (
                <Col md={4} key={card.productId} className="mb-3">
                  <Card
                    onClick={() => setSelectedGiftCard(card)}
                    style={{
                      border:
                        selectedGiftCard?.productId === card.productId
                          ? "2px solid #007bff"
                          : "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  >
                    <CardImg
                      top
                      width="100%"
                      src={card.productImage}
                      alt={card.brandName}
                      style={{ objectFit: "contain", padding: 10 }}
                    />
                    <CardBody>
                      <CardTitle tag="h6">{card.brandName}</CardTitle>
                      <CardText>
                        ${card.valueRestrictions.minVal} - ${card.valueRestrictions.maxVal}
                      </CardText>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

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
