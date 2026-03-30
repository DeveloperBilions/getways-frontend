import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { Parse } from "parse";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

// Constants
const SDK_VERSION = "3.5.5";
const SDK_URL = `https://commercehub-secure-data-capture.fiservapps.com/${SDK_VERSION}/checkout.js`;
const SDK_SCRIPT_ID = "commercehub-sdk";

// Single status enum replacing scattered boolean states
const Status = Object.freeze({
  LOADING_SDK: "LOADING_SDK",
  ACQUIRING_CREDENTIALS: "ACQUIRING_CREDENTIALS",
  MOUNTING_FORM: "MOUNTING_FORM",
  READY: "READY",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
});

const SUCCESS_REDIRECT_DELAY_MS = 3000;
const DASHBOARD_ROUTE = "/playerDashboard";
const INTEGRATION_TYPE = "FRAME";
const CHECKOUT_CONTAINER_ID = "commerce-hub-checkout-form";

// Structured frontend logger
const log = (level, message, data) => {
  const entry = { ts: new Date().toISOString(), level, message };
  if (data) entry.data = data;
  // eslint-disable-next-line no-console
  console[level === "error" ? "error" : "log"]("[CommerceHub]", JSON.stringify(entry));
};

// Commerce Hub Hosted Components — embeds Fiserv payment form as iframe
const CommerceHubHostedComponents = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Flow detection: widget (URL params) vs regular (navigation state)
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const isWidgetFlow = !!searchParams.get("sessionId");

  const widgetParams = useMemo(() => {
    if (!isWidgetFlow) return null;
    return {
      sessionId: searchParams.get("sessionId"),
      accessToken: searchParams.get("accessToken"),
      amount: searchParams.get("amount"),
      transactionId: searchParams.get("transactionId"),
      merchantId: searchParams.get("merchantId"),
    };
  }, [isWidgetFlow, searchParams]);

  const { rechargeAmount, remark } = location.state || {};
  const finalAmount = isWidgetFlow
    ? parseFloat(widgetParams?.amount)
    : rechargeAmount;

  // Single state machine
  const [status, setStatus] = useState(Status.LOADING_SDK);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [credentialsData, setCredentialsData] = useState(null);

  // Refs to prevent double-runs and enable cancellation
  const formMountedRef = useRef(false);
  const credentialsFetchedRef = useRef(false);
  const cancelledRef = useRef(false);

  // Redirect if no amount in regular flow
  useEffect(() => {
    if (!finalAmount && !isWidgetFlow) {
      navigate(DASHBOARD_ROUTE);
    }
  }, [finalAmount, isWidgetFlow, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // STEP 4: Load SDK in browser
  useEffect(() => {
    const existing = document.getElementById(SDK_SCRIPT_ID);

    if (existing) {
      if (window.fiserv?.components) {
        if (status === Status.LOADING_SDK) {
          setStatus(Status.ACQUIRING_CREDENTIALS);
        }
      } else {
        const onLoad = () => {
          if (!cancelledRef.current && status === Status.LOADING_SDK) {
            setStatus(Status.ACQUIRING_CREDENTIALS);
          }
        };
        const onError = () => {
          if (!cancelledRef.current) {
            setErrorMessage("Failed to load payment SDK. Please refresh the page.");
            setStatus(Status.ERROR);
          }
        };
        existing.addEventListener("load", onLoad);
        existing.addEventListener("error", onError);
        return () => {
          existing.removeEventListener("load", onLoad);
          existing.removeEventListener("error", onError);
        };
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SDK_SCRIPT_ID;
    script.src = SDK_URL;
    script.async = true;

    script.onload = () => {
      log("info", "SDK loaded", { version: SDK_VERSION });
      if (!cancelledRef.current) {
        setStatus(Status.ACQUIRING_CREDENTIALS);
      }
    };

    script.onerror = () => {
      log("error", "SDK load failed");
      if (!cancelledRef.current) {
        setErrorMessage("Failed to load payment SDK. Please refresh the page.");
        setStatus(Status.ERROR);
      }
    };

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Widget flow: hydrate credentials from URL params
  useEffect(() => {
    if (!isWidgetFlow || !widgetParams?.sessionId || !widgetParams?.accessToken) return;
    setCredentialsData({
      sessionId: widgetParams.sessionId,
      accessToken: widgetParams.accessToken,
      amount: parseFloat(widgetParams.amount),
      transactionId: widgetParams.transactionId,
      merchantId: widgetParams.merchantId,
    });
  }, [isWidgetFlow, widgetParams]);

  // STEP 3: Acquire credentials (regular flow only)
  useEffect(() => {
    if (
      status !== Status.ACQUIRING_CREDENTIALS ||
      isWidgetFlow ||
      !finalAmount ||
      credentialsFetchedRef.current
    ) {
      return;
    }
    credentialsFetchedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        log("info", "Requesting credentials", { amount: finalAmount });

        const user = Parse.User.current();
        const response = await Parse.Cloud.run("commerceHubInitRecharge", {
          amount: finalAmount,
          remark,
          customerInfo: {
            name: user?.get("username") || "Customer",
            email: user?.get("email") || undefined,
          },
        });

        if (cancelled || cancelledRef.current) return;

        if (!response.success || !response.credentials?.sessionId) {
          throw new Error("Failed to obtain payment credentials");
        }

        log("info", "Credentials acquired", {
          transactionId: response.transactionId,
        });

        setCredentialsData({
          sessionId: response.credentials.sessionId,
          accessToken: response.credentials.accessToken,
          amount: finalAmount,
          transactionId: response.transactionId,
          merchantTransactionId: response.merchantTransactionId,
          publicKey: response.credentials.publicKey,
          keyId: response.credentials.keyId,
        });

        setStatus(Status.MOUNTING_FORM);
      } catch (err) {
        if (cancelled || cancelledRef.current) return;
        log("error", "Credentials fetch failed", { message: err.message });
        setErrorMessage(
          err.message || "Failed to initialize payment. Please try again.",
        );
        setStatus(Status.ERROR);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, isWidgetFlow, finalAmount, remark]);

  // Widget flow: transition to MOUNTING_FORM once SDK + credentials ready
  useEffect(() => {
    if (
      isWidgetFlow &&
      credentialsData &&
      status === Status.ACQUIRING_CREDENTIALS
    ) {
      setStatus(Status.MOUNTING_FORM);
    }
  }, [isWidgetFlow, credentialsData, status]);

  // STEP 6: Submit charges API request
  const handlePaymentCompletion = useCallback(
    async (credentials) => {
      if (cancelledRef.current) return;
      setStatus(Status.PROCESSING);

      try {
        log("info", "Submitting charges", {
          transactionId: credentials.transactionId,
        });

        const response = await Parse.Cloud.run("commerceHubCompleteRecharge", {
          transactionId: credentials.transactionId,
          paymentToken: credentials.sessionId,
        });

        if (cancelledRef.current) return;

        if (response.success && response.status === "completed") {
          log("info", "Payment successful", {
            transactionId: credentials.transactionId,
          });
          setPaymentResult({
            status: "success",
            amount: credentials.amount,
            transactionId: credentials.transactionId,
          });
          setStatus(Status.SUCCESS);
        } else {
          const msg = response.message || "Payment was not approved";
          setErrorMessage(msg);
          setPaymentResult({ status: "failed", reason: msg });
          setStatus(Status.ERROR);
        }
      } catch (err) {
        if (cancelledRef.current) return;
        const msg = err.message || "Failed to process payment";
        log("error", "Charges failed", { message: msg });
        setErrorMessage(msg);
        setPaymentResult({ status: "failed", reason: msg });
        setStatus(Status.ERROR);
      }
    },
    [],
  );

  // STEP 5: Create the payment form (iframe)
  useEffect(() => {
    if (
      status !== Status.MOUNTING_FORM ||
      !credentialsData ||
      formMountedRef.current
    ) {
      return;
    }

    if (!window.fiserv?.components) {
      setErrorMessage("Payment SDK not loaded. Please refresh the page.");
      setStatus(Status.ERROR);
      return;
    }

    formMountedRef.current = true;

    const environment =
      process.env.REACT_APP_COMMERCE_HUB_ENVIRONMENT || "CERT";
    const apiKey = process.env.REACT_APP_COMMERCE_HUB_API_KEY;
    const merchantId = process.env.REACT_APP_COMMERCE_HUB_MERCHANT_ID;
    const terminalId =
      process.env.REACT_APP_COMMERCE_HUB_TERMINAL_ID || "10000001";
    const pageId = process.env.REACT_APP_COMMERCE_HUB_PAGE_ID;
    const pageVersion = process.env.REACT_APP_COMMERCE_HUB_PAGE_VERSION;

    if (!apiKey || !merchantId || !pageId || !pageVersion) {
      setErrorMessage(
        "Payment configuration incomplete. Missing API key, merchant ID, page ID, or page version.",
      );
      setStatus(Status.ERROR);
      return;
    }

    log("info", "Mounting hosted checkout form", { environment, pageId, pageVersion });

    try {
      const formPromise = window.fiserv.components.hostedCheckout({
        credentials: {
          environment,
          apiKey,
          accessToken: credentialsData.accessToken,
          merchantId,
          terminalId,
          pageId,
          pageVersion,
        },
        integrationOptions: {
          type: INTEGRATION_TYPE,
          parentElementId: CHECKOUT_CONTAINER_ID,
        },
      });

      // Iframe renders immediately, show to user
      setStatus(Status.READY);

      // On successful capture an empty response is sent back, then submit charges
      formPromise
        .then(() => {
          if (!cancelledRef.current) {
            handlePaymentCompletion(credentialsData);
          }
        })
        .catch(() => {
          // Best practice: still submit the transaction even on error
          if (!cancelledRef.current) {
            handlePaymentCompletion(credentialsData);
          }
        });
    } catch (err) {
      log("error", "Form creation failed", { message: err.message });
      setErrorMessage(
        err.message || "Failed to create payment form. Please check configuration.",
      );
      setStatus(Status.ERROR);
    }
  }, [status, credentialsData, handlePaymentCompletion]);

  // Redirect to dashboard on success
  useEffect(() => {
    if (status !== Status.SUCCESS) return;
    const timer = setTimeout(
      () => navigate(DASHBOARD_ROUTE),
      SUCCESS_REDIRECT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [status, navigate]);

  // Derived UI flags
  const showLoader =
    status === Status.LOADING_SDK ||
    status === Status.ACQUIRING_CREDENTIALS ||
    status === Status.MOUNTING_FORM ||
    status === Status.PROCESSING;

  const showError = status === Status.ERROR && !!errorMessage;
  const showForm = status !== Status.SUCCESS;

  return (
    <Box className="container-fluid py-4">
      <Box display="flex" justifyContent="start" mb={2}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(DASHBOARD_ROUTE)}
        >
          Back
        </Button>
      </Box>

      {status === Status.SUCCESS && (
        <Box
          sx={{ textAlign: "center", py: 6 }}
          role="status"
          aria-live="polite"
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#10B981",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Typography variant="h3" sx={{ color: "#fff" }}>
              ✓
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Redirecting to dashboard...
          </Typography>
        </Box>
      )}

      {showLoader && !showError && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            py: 6,
          }}
          role="status"
          aria-live="polite"
          aria-label="Loading secure payment form"
        >
          <CircularProgress size={50} sx={{ color: "#0066CC" }} />
          <Typography variant="body1" sx={{ mt: 2, color: "#6B7280" }}>
            {status === Status.PROCESSING
              ? "Processing payment..."
              : "Loading secure payment form..."}
          </Typography>
        </Box>
      )}

      {showError && (
        <Box sx={{ p: 2 }} role="alert">
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      {showForm && (
        <Box
          id={CHECKOUT_CONTAINER_ID}
          sx={{
            width: "100%",
            minHeight: 500,
            display: status === Status.READY ? "block" : "none",
          }}
        />
      )}
    </Box>
  );
};

export default CommerceHubHostedComponents;
