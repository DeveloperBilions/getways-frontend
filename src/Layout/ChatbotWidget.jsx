import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Fade,
  Slide,
  Zoom,
  Badge,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Parse from "parse";
import { getRoleBasedOptions } from "../utils";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentStep, setCurrentStep] = useState("main"); // main -> sub -> final
  const [selectedMainOption, setSelectedMainOption] = useState(null);
  const [selectedSubOption, setSelectedSubOption] = useState(null);
  const [isTextFieldEnabled, setIsTextFieldEnabled] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const role = localStorage.getItem("role");

  const { mainOptions, subOptions, finalOptions } = getRoleBasedOptions(role);

  // Show initial options when chat opens
  useEffect(() => {
    if (isOpen && chat.length === 0) {
      setChat([
        {
          role: "assistant",
          text: "Hello! How can I assist you today? Please select a category:",
        },
      ]);
      setCurrentStep("main");
      setShowOptions(true);
      setIsTextFieldEnabled(false);
    }
  }, [isOpen]);

  // Automatically scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && !hasScrolledUp) {
      scrollToBottom();
    } else if (
      isOpen &&
      chat.length > 0 &&
      chat[chat.length - 1].role === "assistant"
    ) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [chat]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  // Track scroll position to show scroll button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;

    setHasScrolledUp(!isAtBottom);
    setShowScrollButton(!isAtBottom);

    if (isAtBottom) {
      setUnreadCount(0);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setHasScrolledUp(false);
      setShowScrollButton(false);
      setUnreadCount(0);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const clearChat = () => {
    setChat([
      {
        role: "assistant",
        text: "Hello! How can I assist you today? Please select a category:",
      },
    ]);
    setCurrentStep("main");
    setSelectedMainOption(null);
    setSelectedSubOption(null);
    setShowOptions(true);
    setShowScrollButton(false);
    setIsTextFieldEnabled(false);
    setUnreadCount(0);
  };

  const handleMainOptionSelect = (option) => {
    setShowOptions(false);
    
    if (option.id === "other") {
      setIsTextFieldEnabled(true);
      setCurrentStep("other");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSelectedMainOption(option.id);
      setCurrentStep("sub");
      setChat((prev) => [
        ...prev,
        { role: "user", text: option.label },
        {
          role: "assistant",
          text: `You've selected ${option.label}. Please choose a specific topic:`,
        },
      ]);
      setShowOptions(true);
    }
  };

  const handleSubOptionSelect = (option) => {
    setShowOptions(false);
    setChat((prev) => [...prev, { role: "user", text: option.label }]);
    setSelectedSubOption(option.id);
    setCurrentStep("final");
    setChat((prev) => [
      ...prev,
      {
        role: "assistant",
        text: `Let's narrow it down further. What would you like to know about ${option.label}?`,
      },
    ]);
    setShowOptions(true);
  };

  const handleFinalOptionSelect = async (option) => {
    setShowOptions(false);
    setChat((prev) => [...prev, { role: "user", text: option }]);
    await sendMessageToBackend(option);
    setCurrentStep("main");
    setSelectedMainOption(null);
    setSelectedSubOption(null);
    setShowOptions(true);
  };

  const sendMessageToBackend = async (message) => {
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await Parse.Cloud.run("chatbot", {
        role: role,
        message: message,
        conversationHistory: chat,
      });

      setTimeout(() => {
        if (res.success) {
          setChat((prev) => [...prev, { role: "assistant", text: res.data }]);
        } else {
          setChat((prev) => [
            ...prev,
            {
              role: "assistant",
              text:
                "⚠️ " +
                (res.message || "Something went wrong. Please try again."),
            },
          ]);
        }
        setIsLoading(false);
      }, 500);
    } catch (e) {
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "⚠️ Could not reach chatbot service. Please check your connection and try again.",
          },
        ]);
        setIsLoading(false);
      }, 500);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    await sendMessageToBackend(input);
    setCurrentStep("main");
    setSelectedMainOption(null);
    setSelectedSubOption(null);
    setShowOptions(true);
  };

  // Typing indicator animation component
  const TypingIndicator = () => (
    <Box sx={{ display: "flex", gap: 0.5, p: 0.5 }}>
      <Zoom in={true} style={{ transitionDelay: "0ms" }}>
        <Box
          sx={{
            width: 4,
            height: 4,
            bgcolor: "primary.main",
            borderRadius: "50%",
          }}
          className="typing-dot"
        />
      </Zoom>
      <Zoom in={true} style={{ transitionDelay: "200ms" }}>
        <Box
          sx={{
            width: 4,
            height: 4,
            bgcolor: "primary.main",
            borderRadius: "50%",
          }}
          className="typing-dot"
        />
      </Zoom>
      <Zoom in={true} style={{ transitionDelay: "400ms" }}>
        <Box
          sx={{
            width: 4,
            height: 4,
            bgcolor: "primary.main",
            borderRadius: "50%",
          }}
          className="typing-dot"
        />
      </Zoom>
    </Box>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1300,
        "& .MuiPaper-root": {
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      {isOpen ? (
        <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              width: { xs: "95vw", sm: 400 },
              height: { xs: "80vh", sm: 500 },
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2.5,
                py: 1.5,
                backgroundColor: "primary.main",
                color: "white",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Zoom in={true}>
                  <ChatIcon sx={{ mr: 1.5 }} />
                </Zoom>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Gateways Support
                </Typography>
              </Box>
              <Box>
                <Tooltip title="Clear conversation">
                  <IconButton
                    onClick={clearChat}
                    size="small"
                    sx={{
                      color: "white",
                      opacity: 0.8,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Close chat">
                  <IconButton
                    onClick={toggleChat}
                    size="small"
                    sx={{
                      color: "white",
                      ml: 1,
                      "&:hover": {
                        transform: "rotate(90deg)",
                        transition: "transform 0.3s",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box
              ref={chatContainerRef}
              onScroll={handleScroll}
              sx={{
                flex: 1,
                p: 2.5,
                overflowY: "auto",
                bgcolor: "#f8f9fa",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                position: "relative",
                scrollBehavior: "smooth",
              }}
            >
              {chat.map((msg, index) => (
                <Fade key={index} in={true} timeout={500}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "90%",
                        p: 2,
                        borderRadius:
                          msg.role === "user"
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                        bgcolor: msg.role === "user" ? "primary.main" : "white",
                        color: msg.role === "user" ? "white" : "text.primary",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        position: "relative",
                        "&:hover": {
                          boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                          transform: "translateY(-1px)",
                          transition: "all 0.2s",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 1.6, fontSize: 12 }}
                      >
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))}

              {showOptions && (
                <Fade in={true}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      justifyContent: "flex-start",
                    }}
                  >
                    {currentStep === "main" &&
                      mainOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant="contained"
                          size="small"
                          onClick={() => handleMainOptionSelect(option)}
                          sx={{
                            borderRadius: 2,
                            fontSize: 12,
                            textTransform: "none",
                            bgcolor: "white",
                            color: "primary.main",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            "&:hover": {
                              bgcolor: "primary.light",
                              color: "white",
                            },
                          }}
                        >
                          {option.icon} {option.label}
                        </Button>
                      ))}
                    {currentStep === "sub" &&
                      subOptions[selectedMainOption].map((option) => (
                        <Button
                          key={option.id}
                          variant="contained"
                          size="small"
                          onClick={() => handleSubOptionSelect(option)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            bgcolor: "white",
                            color: "primary.main",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            "&:hover": {
                              bgcolor: "primary.light",
                              color: "white",
                            },
                          }}
                        >
                          {option.icon} {option.label}
                        </Button>
                      ))}
                    {currentStep === "final" &&
                      finalOptions[selectedSubOption].map((option, index) => (
                        <Button
                          key={index}
                          variant="contained"
                          size="small"
                          onClick={() => handleFinalOptionSelect(option)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            bgcolor: "white",
                            color: "primary.main",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            "&:hover": {
                              bgcolor: "primary.light",
                              color: "white",
                            },
                            width: "100%",
                            justifyContent: "flex-start",
                            textAlign: "left",
                            py: 1,
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                  </Box>
                </Fade>
              )}

              {isLoading && (
                <Fade in={true}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mt: 1,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "white",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      <TypingIndicator />
                    </Box>
                  </Box>
                </Fade>
              )}

              {showScrollButton && (
                <Zoom in={true}>
                  <Box
                    sx={{
                      position: "sticky",
                      bottom: 10,
                      alignSelf: "center",
                      zIndex: 2,
                    }}
                  >
                    <Tooltip title="Scroll to bottom">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={scrollToBottom}
                        sx={{
                          bgcolor: "white",
                          boxShadow: 2,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 3,
                          },
                          transition: "all 0.2s",
                        }}
                      >
                        {unreadCount > 0 ? (
                          <Badge color="error" badgeContent={unreadCount}>
                            <ExpandMoreIcon />
                          </Badge>
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Zoom>
              )}
            </Box>

            <Divider />

            {isTextFieldEnabled && (
              <Box sx={{ p: 1.5, bgcolor: "white" }}>
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#f0f2f5",
                    borderRadius: 3,
                    px: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    inputRef={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    placeholder="Type a message..."
                    disabled={isLoading}
                    InputProps={{
                      disableUnderline: true,
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: 12,
                      },
                      "& .MuiInputBase-root": {
                        p: 1,
                      },
                    }}
                  />
                  <Tooltip title="Send message">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        sx={{
                          ml: 1,
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            bgcolor: "primary.light",
                            color: "white",
                          },
                          "&.Mui-disabled": {
                            color: "text.disabled",
                          },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} thickness={4} />
                        ) : (
                          <SendIcon sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </Paper>
        </Slide>
      ) : (
        <Zoom in={!isOpen} timeout={500}>
          <Box>
            <Badge
              color="error"
              badgeContent={unreadCount > 0 ? unreadCount : null}
              overlap="circular"
            >
              <IconButton
                color="primary"
                aria-label="Open chat"
                sx={{
                  bgcolor: "white",
                  borderRadius: "50%",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  width: 45,
                  height: 45,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1) rotate(10deg)",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                  },
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.4)",
                    },
                    "70%": {
                      boxShadow: "0 0 0 15px rgba(25, 118, 210, 0)",
                    },
                    "100%": {
                      boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)",
                    },
                  },
                  animation: unreadCount > 0 ? "pulse 2s infinite" : "none",
                }}
                onClick={toggleChat}
              >
                <ChatIcon fontSize="medium" />
              </IconButton>
            </Badge>
          </Box>
        </Zoom>
      )}

      {/* Custom CSS for typing animation */}
      <Box
        sx={{
          "@keyframes bounce": {
            "0%, 100%": {
              transform: "translateY(0)",
            },
            "50%": {
              transform: "translateY(-5px)",
            },
          },
          "& .typing-dot": {
            animation: "bounce 1.4s infinite ease-in-out both",
          },
          "& .typing-dot:nth-of-type(1)": {
            animationDelay: "0s",
          },
          "& .typing-dot:nth-of-type(2)": {
            animationDelay: "0.2s",
          },
          "& .typing-dot:nth-of-type(3)": {
            animationDelay: "0.4s",
          },
        }}
      />
    </Box>
  );
};

export default ChatbotWidget;
