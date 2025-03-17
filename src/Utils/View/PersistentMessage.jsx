import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useGetIdentity } from "react-admin";
import { checkActiveRechargeLimit } from "../utils";
import { Alert } from "@mui/material";

const PersistentMessage = () => {
  const { identity } = useGetIdentity(); // Get the current logged-in user
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    const fetchLimitStatus = async () => {
      try {
        const transactionCheck = await checkActiveRechargeLimit(identity.objectId, 0); // Check limit with 0 recharge
        console.log(transactionCheck,"transactionChecktransactionCheck")
        setHasReachedLimit(!transactionCheck.success); // If limit exceeded, show message
      } catch (error) {
        console.error("Error checking recharge limit:", error);
      }
    };

    fetchLimitStatus();
  }, [identity]);

  if (!hasReachedLimit) return null; // Don't show message if limit is not exceeded

  return (
    <div style={{ position: "relative", zIndex: 1000 }}>
    <Alert severity="error" className="mb-2">
      You have reached the daily maximum threshold limit for recharge. Please try again.
      </Alert>
  </div>
  );
};

export default PersistentMessage;
