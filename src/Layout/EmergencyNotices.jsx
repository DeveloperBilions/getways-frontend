import React, { useEffect, useState } from "react";
import { Parse } from "parse";
import { Alert } from "@mui/material";

const EmergencyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const query = new Parse.Query("Settings");
        query.equalTo("type", "emergencymsg");
        const settingsRecord = await query.first();

        if (settingsRecord) {
          setMessages(settingsRecord.get("settings") || []);
        }
      } catch (error) {
        console.error("Error fetching emergency messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      const messageInterval = setInterval(() => {
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 500); // Blink duration before switching
      }, 5000); // Change message every 5 seconds

      return () => clearInterval(messageInterval);
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div style={{ position: "relative", zIndex: 1000 }}>
      <Alert severity="error" className="mb-2">
        {messages[currentIndex]}
      </Alert>
  </div>
  );
};

export default EmergencyMessages;
