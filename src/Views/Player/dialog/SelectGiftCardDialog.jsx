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
import { Box, Button, Typography } from "@mui/material";
import "../../../Assets/css/cashoutDialog.css"; // Assuming the same CSS file for styling

// Parse initialization (same as in your original code)
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const SelectGiftCardDialog = ({ open, onClose, onConfirm, record,onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(50); // Number of cards per page
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [giftCards, setGiftCards] = useState([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [loadingGiftCards, setLoadingGiftCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch gift cards when the dialog opens or search term changes
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
    }
    onConfirm(selectedGiftCard); // Pass the selected gift card to the parent component
    onClose();
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="lg" centered>
      <Box
        sx={{
          borderRadius: "8px",
          border: "1px solid #E7E7E7",
          backgroundColor: "#FFFFFF",
          boxShadow:
            "4px 4px 16px 0px rgba(255, 255, 255, 0.25), -4px -4px 16px 0px rgba(255, 255, 255, 0.25)",
          // outline: "none",
        }}
      >
        <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
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
              Valid for 6 months from the date of issue. Cannot be combined with
              other offers.
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
            <Box style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                          height: "120px",
                          objectFit: "contain",
                          padding: "10px",
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
                            Value Range: ${card.valueRestrictions.minVal} - $
                            {card.valueRestrictions.maxVal}
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
                flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
                gap: { xs: 2, sm: 2 }, // Add spacing between buttons
                marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
                width: "100% !important", // Ensure the container takes full width
              }}
            >
              <Button
                className="custom-button cancel"
                style={{ border: "1px solid #E7E7E7", borderRadius: "8px" }}
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                className="custom-button"
                style={{
                  backgroundColor: "#2E5BFF",
                  color: "#fff",
                  borderRadius: "8px",
                }}
              >
                Confirm
              </Button>
            </Box>
          </Col>
        </ModalFooter>
      </Box>
    </Modal>
  );
};

export default SelectGiftCardDialog;
