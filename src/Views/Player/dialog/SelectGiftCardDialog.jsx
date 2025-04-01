import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
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
  ModalFooter,
} from "reactstrap";
import { Parse } from "parse";
import { Box, Button, IconButton, Typography } from "@mui/material";
import "../../../Assets/css/cashoutDialog.css";
import { useNotify } from "react-admin";
import Close from "../../../Assets/icons/close.svg";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const SelectGiftCardDialog = ({
  open,
  onClose,
  onBack,
  redeemAmount,
  record,
}) => {
  const [perPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [giftCards, setGiftCards] = useState([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const userName = localStorage.getItem("username");
  const userId = localStorage.getItem("id");
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    if (open) {
      fetchGiftCards(searchTerm);
    }
  }, [open, searchTerm]);

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

  const handleConfirm = () => {
    if (!selectedGiftCard) {
      setErrorMessage("Please select a gift card to proceed.");
      return;
    } else {
      handleSubmit();
    }
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const purchasePayload = {
        orderId: orderId,
        price: parseFloat(redeemAmount),
        productId: selectedGiftCard.productId,
        externalUserId: userId,
        externalUserFirstName: userName,
        externalUserLastName: "User",
        externalUserEmail: record?.email,
      };

      const response = await Parse.Cloud.run(
        "purchaseGiftCard",
        purchasePayload
      );

      if (response && response.status === "success") {
        onClose();
        notify(`Gift card successfully added`, {
          type: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        setSuccessModalOpen(true);
        setTimeout(() => {
          onClose();
          setSuccessModalOpen(false);
        }, 2000);
      } else {
        setErrorMessage(response.message || "Purchase failed");
      }
    } catch (error) {
      console.error("Gift card purchase error:", error);
      setErrorMessage("Gift card purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={open}
        toggle={onClose}
        size={successModalOpen ? "md" : "lg"}
        centered
      >
        {successModalOpen ? (
          <Box
            sx={{
              display: "flex",
              height: "191px",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "24px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid #E7E7E7",
              boxShadow:
                "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
              // outline: "none",
            }}
          >
            <Typography
              variant="h6"
              style={{
                color: "#4CAF50",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              Cash-out Successful!
            </Typography>
            <Typography
              variant="body2"
              style={{
                color: "#4D4D4D",
                textAlign: "center",
              }}
            >
              Your gift card has been added to your account.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #E7E7E7",
              backgroundColor: "#FFFFFF",
              boxShadow:
                "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
            }}
          >
            <ModalHeader
              toggle={onClose}
              className="border-bottom-0 pb-0"
              style={{ fontWeight: "500", fontSize: "24px" }}
              close={
                <IconButton
                  onClick={onClose}
                  sx={{
                    position: "absolute",
                    right: "16px",
                    top: "16px",
                  }}
                >
                  <img src={Close} alt="cancel" width="24px" height="24px" />
                </IconButton>
              }
            >
              Cash out
            </ModalHeader>
            <ModalBody>
              <Box
                className="d-flex align-items-start rounded mb-4 justify-content-between flex-column"
                sx={{ bgcolor: "#F4F3FC", padding: "16px 22px" }}
              >
                <Typography sx={{ fontWeight: "600", fontSize: "14px" }}>
                  Terms & Conditions
                </Typography>
                <Typography sx={{ fontWeight: "400", fontSize: "14px" }}>
                  Valid for 6 months from the date of issue. Cannot be combined
                  with other offers.
                </Typography>
              </Box>

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
                    maxHeight: "300px",
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
            </ModalBody>
            <ModalFooter className="custom-modal-footer">
              <Col md={12}>
                <Box
                  className="d-flex w-100 justify-content-between"
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "stretch" },
                    gap: { xs: 2, sm: 2 },
                    marginBottom: { xs: 2, sm: 2 },
                    width: "100% !important",
                  }}
                >
                  <Button
                    className="custom-button cancel"
                    style={{ border: "1px solid #E7E7E7", borderRadius: "8px" }}
                    onClick={onBack}
                  >
                    <Typography
                      sx={{
                        fontSize: "18px",
                        textTransform: "none",
                        fontWeight: "500",
                        fontFamily: "Inter",
                      }}
                    >
                      Back
                    </Typography>
                  </Button>
                  <Button
                    className="custom-button"
                    style={{
                      backgroundColor: "#2E5BFF",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                    disabled={loading}
                    onClick={handleConfirm}
                  >
                    <Typography
                      sx={{
                        fontSize: "18px",
                        textTransform: "none",
                        fontWeight: "500",
                        fontFamily: "Inter",
                      }}
                    >
                      {loading ? "Processing..." : "Confirm"}
                    </Typography>
                  </Button>
                </Box>
              </Col>
            </ModalFooter>
          </Box>
        )}
      </Modal>
    </>
  );
};

export default SelectGiftCardDialog;
