import React, { useEffect, useState } from "react";
import "./Maintenance.css";
import { Parse } from "parse";

export const Maintenance = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const query = new Parse.Query("Settings");
        query.equalTo("type", "MaintananceMsg");
        const settingsRecord = await query.first();

        if (settingsRecord) {
          setMessages(settingsRecord.get("settings") || []);
        }
      } catch (error) {
        console.error("Error fetching emergency messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="center-container">
      <div className="image-container">
        <img src="/assets/maintenance1.svg" alt="Maintenance" className="svg-image" />
        <p className="overlay-text">{messages && messages[0]}</p>
      </div>
    </div>
  );
};
