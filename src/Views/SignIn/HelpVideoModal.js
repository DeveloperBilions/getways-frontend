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
            width: "90%",
            maxWidth: 700,
            bgcolor: "background.paper",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          {/* Heading */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 3,
              color: "white",
              backgroundColor: "#000",
              p: 1.5,
              borderRadius: "8px",
              letterSpacing: 1,
            }}
          >
             Help Videos
          </Typography>

          {/* Video Grid */}
          <Grid container spacing={2}>
            {/* Login Video */}
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: "#000",
                  textTransform: "uppercase",
                }}
              >
                🔑 How to Login
              </Typography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #ddd",
                }}
              >
                <video
                  width="100%"
                  height="auto"
                  controls
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <source src={video1} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </Box>
            </Grid>

            {/* Signup Video */}
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: "#000",
                  textTransform: "uppercase",
                }}
              >
                📝 How to Signup
              </Typography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #ddd",
                }}
              >
                <video
                  width="100%"
                  height="auto"
                  controls
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <source src={video2} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </Box>
            </Grid>
          </Grid>

          {/* Close Button */}
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              mt: 3,
              px: 3,
              py: 1.2,
              fontSize: "1rem",
              fontWeight: "bold",
              backgroundColor: "#000",
              "&:hover": {
                backgroundColor: "#333",
                transform: "scale(1.05)",
                transition: "0.3s ease-in-out",
              },
            }}
          >
             Close
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default HelpVideoModal;
