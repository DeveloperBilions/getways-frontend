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
import UserGiftInfoDialog from "./UserGiftInfoDialog";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

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
        const masterCards = masterResponse.result || [];

        const allResponse = await Parse.Cloud.run("fetchGiftCards", {
          searchTerm: "",
          currentPage: page,
          perPage,
        });

        const allCards = allResponse.result || [];

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
        console.log(response, "responseresponseresponseresponse");
        combinedResults = response.result || [];
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

  const handleConfirm = async () => {
    if (!selectedGiftCard) {
      setErrorMessage("Please select a gift card to proceed.");
      return;
    }

    const user = await Parse.User.current()?.fetch();
    const savedFirst = user?.get("gift_firstName");
    const savedLast = user?.get("gift_lastName");
    const savedEmail = user?.get("gift_email");

   // if (!savedFirst || !savedLast || !savedEmail) {
      setShowInfoDialog(true); // Open dialog to collect info
    //   return;
    // }

    setFirstName(savedFirst);
    setLastName(savedLast);
    setEmail(savedEmail);

  //  handleSubmit(savedFirst, savedLast, savedEmail);
  };

  const handleSubmit = async (
    fname = firstName,
    lname = lastName,
    userEmail = email
  ) => {
    try {
      setLoading(true);
      const user = await Parse.User.current()?.fetch();
      user.set("gift_firstName", fname);
      user.set("gift_lastName", lname);
      user.set("gift_email", userEmail);
      await user.save(null, { useMasterKey: true });

      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const purchasePayload = {
        orderId: orderId,
        price: parseFloat(redeemAmount),
        productId: selectedGiftCard.productId,
        productImage:selectedGiftCard?.productImage,
        externalUserId: userId,
        externalUserFirstName: fname,
        externalUserLastName: lname,
        externalUserEmail: userEmail,
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
          setSuccessModalOpen(false);
        }, 2000);
      } else {
        setErrorMessage(response.error || "Purchase failed");
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
                      variant="outlined"

                      sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
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
                    variant="contained"
                    color="primary"
                    sx={{ width: "50%", paddingBottom: "10px", paddingTop: "10px" }}
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
  initialData={{ firstName, lastName, email }} // pass saved info here
/>

    </>
  );
};

export default SelectGiftCardDialog;
