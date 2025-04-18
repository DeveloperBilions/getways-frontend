import React from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import video1 from "../../Assets/videos/HelpVideo1.mp4";
import video2 from "../../Assets/videos/HelpVideo2.mp4";
import CloseIcon from "../../Assets/icons/closeIcon.png";

const HelpVideoModal = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: "90%",
            width: "630px",
            bgcolor: "background.paper",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
            padding: 3,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "20px",
                color: "#000000",
              }}
            >
              How can we help you?
            </Typography>

            <Button
              onClick={handleClose}
              sx={{
                minWidth: "auto",
                padding: 0,
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <img src={CloseIcon} alt="Close" />
            </Button>
          </Box>

          {/* Video Grid */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  borderRadius: 2,
                  background: "#FFFFFF",
                  border: "1px solid #E7E7E7",
                }}
              >
                <video
                  width="100%"
                  controls
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                    objectFit: "cover",
                    height: "150px",
                  }}
                >
                  <source src={video1} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 1,
                    paddingLeft: 1,
                    paddingRight: 1,
                    fontWeight: 500,
                    fontSize: "18px",
                    color: "#000000",
                  }}
                >
                  How to Login
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    paddingLeft: 1,
                    paddingRight: 1,
                    paddingBottom: 1,
                    fontWeight: 400,
                    color: "#0000008F",
                  }}
                >
                  This video will guide you step-by-step through the login
                  process.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  borderRadius: 2,
                  background: "#FFFFFF",
                  border: "1px solid #E7E7E7",
                }}
              >
                <video
                  width="100%"
                  controls
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                    objectFit: "cover",
                    height: "150px",
                  }}
                >
                  <source src={video2} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 1,
                    paddingLeft: 1,
                    paddingRight: 1,
                    fontWeight: 500,
                    fontSize: "18px",
                    color: "#000000",
                  }}
                >
                  How to Signup
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    paddingLeft: 1,
                    paddingRight: 1,
                    paddingBottom: 1,
                    fontWeight: 400,
                    color: "#0000008F",
                  }}
                >
                  This video will guide you step-by-step through the signup
                  process.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Modal>
  );
};

export default HelpVideoModal;
