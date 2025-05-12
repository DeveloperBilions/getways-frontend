import React from "react";
import { Typography, Card, CardContent, Grid, Box } from "@mui/material";
import Copy from "../../Assets/icons/Copy.svg";
import LinkButton from "../../Assets/icons/LinkButton.svg";

const GiftCardsDisplay = ({
  giftCards,
  totalGiftCard,
  totalAvailableGiftCard,
  totalExpiredGiftCard,
}) => {
  // const giftCards = [
  //   {
  //     name: "Amazon",
  //     validUntil: "Dec 31, 2023",
  //     amount: 100,
  //     code: "AMZN-1234-5678-98AB",
  //   },
  //   {
  //     name: "Mastercard eReward Virtual Account",
  //     validUntil: "Dec 31, 2023",
  //     amount: 20,
  //     code: "AMZN-1234-5678-98AB",
  //   },
  //   {
  //     name: "Venue 2 - Spa",
  //     validUntil: "Dec 31, 2023",
  //     amount: 10,
  //     code: "AMZN-1234-5678-98AB",
  //   },
  //   {
  //     name: "Venue 3 - Boutique",
  //     validUntil: "Dec 31, 2023",
  //     amount: 100,
  //     code: "AMZN-1234-5678-98AB",
  //   },
  // ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #E7E7E7",
      }}
    >
      <Typography sx={{ fontSize: 20, fontWeight: 500, mb: 2 }}>
        Your Gift Cards
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: "#F4F3FC",
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ pb: "16px !important" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total number of Gift cards
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#2E5BFF",
                }}
              >
                {totalGiftCard}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: "#F4F3FC",
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ pb: "16px !important" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Available Gift cards
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#2E5BFF",
                }}
              >
                {totalAvailableGiftCard}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: "#F4F3FC",
              borderRadius: "8px",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ pb: "16px !important" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Expired Gift cards
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#2E5BFF",
                }}
              >
                {totalExpiredGiftCard}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {giftCards.map((card, index) => (
        <Box
          key={index}
          sx={{
            border: "1px solid #E7E7E7",
            borderRadius: "8px",
            padding: "16px",
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <img
                  src={card?.productImage}
                  height={40}
                  width={60}
                  alt="product"
                  style={{ marginRight: 8 }}
                />
                <Typography sx={{ fontSize: 16, fontWeight: 400 }}>
                  {card.apiResponse?.productName}
                </Typography>
              </Box>
              <Typography
                sx={{ fontSize: 12, fontWeight: 400, color: "#808080" }}
              >
                Valid until{" "}
                {new Date(
                  card.apiResponse?.vouchers[0]?.validityDate
                ).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {card.apiResponse?.vouchers[0]?.voucherCurrency} &nbsp;
                {card.price}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#F5F5F5",
              border: "1px solid #E7E7E7",
              borderRadius: "8px",
              padding: "10px 12px",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 400 }}>
                {card.orderId}
              </Typography>
            </Box>
            <Box>
              <img
                src={Copy}
                alt="Copy"
                onClick={() => handleCopyCode(card.orderId)}
                style={{ cursor: "pointer" }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 2,
              cursor: "pointer",
            }}
            onClick={() => {
              const url = card?.apiResponse?.vouchers[0]?.code;
              if (url) window.open(url, "_blank");
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                color: "#2E5BFF",
                cursor: "pointer",
                fontWeight: 600,
                mr: 1,
              }}
            >
              Use now
            </Typography>
            <img src={LinkButton} alt="LinkButton" />
          </Box>
          {card.apiResponse?.howToUse && (
            <Box sx={{ mt: 1 }}>
              <Typography
                sx={{ fontSize: 14 }}
                dangerouslySetInnerHTML={{
                  __html: card.apiResponse.howToUse,
                }}
              />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default GiftCardsDisplay;
