import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";

export default function BillingAddressForm({ onSubmit }) {
  const { identity } = useGetIdentity();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [objectId, setObjectId] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadBillingInfo = async () => {
      try {
        const BillingInfo = Parse.Object.extend("BillingInfo");
        const query = new Parse.Query(BillingInfo);
        query.equalTo("userId", identity?.objectId);
        const result = await query.first();

        if (result) {
          setObjectId(result.id);
          setForm({
            firstName: result.get("firstName") || "",
            lastName: result.get("lastName") || "",
            address1: result.get("address1") || "",
            address2: result.get("address2") || "",
            city: result.get("city") || "",
            state: result.get("state") || "",
            zip: result.get("zip") || "",
            email: result.get("email") || "",
          });
          setEditMode(false);
        }
      } catch (err) {
        console.error("Load failed:", err);
        setErrorMsg("Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    };

    if (identity?.objectId) {
      loadBillingInfo();
    }
  }, [identity?.objectId]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = "This field is required";
      }
    });

    if (form.email && !emailRegex.test(form.email.trim())) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const isValid = validateForm();
    if (!isValid) {
      setSubmitting(false);
      return;
    }

    try {
      const BillingInfo = Parse.Object.extend("BillingInfo");
      const billingInfo = objectId
        ? await new Parse.Query(BillingInfo).get(objectId)
        : new BillingInfo();

      billingInfo.set("userId", identity?.objectId); // assuming objectId is user id
      Object.entries(form).forEach(([key, value]) => {
        billingInfo.set(key, value.trim());
      });

      const saved = await billingInfo.save();
      setObjectId(saved.id);
      setEditMode(false);

      setSuccessMsg("Billing information saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      onSubmit?.(form);
    } catch (err) {
      console.error("Save failed:", err);
      setErrorMsg("Failed to save billing information. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="container py-4">
      <Typography variant="h6" gutterBottom>
        Billing Address
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

     

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {[
            { name: "firstName", label: "First Name" },
            { name: "lastName", label: "Last Name" },
            { name: "address1", label: "Address Line 1" },
            { name: "address2", label: "Address Line 2" },
            { name: "city", label: "City" },
            { name: "state", label: "State" },
            { name: "zip", label: "ZIP Code" },
            { name: "email", label: "Email Address", type: "email" },
          ].map(({ name, label, type }) => (
            <Grid item xs={12} sm={name === "email" || name === "zip" ? 6 : 12} key={name}>
              <TextField
                label={label}
                name={name}
                type={type || "text"}
                value={form[name]}
                onChange={handleChange}
                fullWidth
                variant="standard"
                disabled={!editMode}
                error={Boolean(errors[name])}
                helperText={errors[name]}
              />
            </Grid>
          ))}
 
 <Grid item xs={12}>
  <Box display="flex" gap={2}>
    {!editMode && (
      <Button
        variant="outlined"
        onClick={() => setEditMode(true)}
        fullWidth
        sx={{ flex: 1 }}
      >
        Edit
      </Button>
    )}
    <Button
      type={editMode ? "submit" : "button"}
      variant="contained"
      color="primary"
      disabled={submitting}
      fullWidth
      sx={{ flex: 1 }}
      onClick={!editMode ? () => onSubmit?.(form) : undefined}
    >
      {submitting && editMode ? "Saving..." : "Continue"}
    </Button>
  </Box>
</Grid>

        </Grid>
      </form>
    </Box>
  );
}
