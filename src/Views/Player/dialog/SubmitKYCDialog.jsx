import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Link,
} from '@mui/material';
import axios from 'axios';
import Parse from 'parse';
import { submitTransfiKyc } from '../../../Utils/transfi';

export default function SubmitKYCDialog({ open, onClose, onSuccess, identity }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: 'US',
    myuserId: identity?.objectId
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [redirectLink, setRedirectLink] = useState('');

  useEffect(() => {
    if (identity?.objectId) {
      checkKycStatus(identity?.objectId);
    }
  }, [identity]);

  const checkKycStatus = async (id) => {
    try {
      const TransfiUserInfo = Parse.Object.extend('TransfiUserInfo');
      const query = new Parse.Query(TransfiUserInfo);
      query.equalTo('userId', id);
      const result = await query.first({ useMasterKey: true });

      if (result) {
        const status = result.get('kycStatus');
        setKycStatus(status);
        setRedirectLink(result.get('redirectUrl'));
      } else {
        setKycStatus('not_found');
      }
    } catch (err) {
      console.error('Error checking KYC status:', err);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isNonEmpty = (value) => {
    return value && value.trim().length > 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    // Client-side validation
    if (
      !isNonEmpty(formData.firstName) ||
      !isNonEmpty(formData.lastName) ||
      !isValidEmail(formData.email)
    ) {
      setError('Please enter valid details. Fields cannot be empty or contain only spaces.');
      return;
    }

    setLoading(true);

    try {
      const { redirectUrl } = await submitTransfiKyc({
        myuserId: identity?.objectId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
      });
      localStorage.setItem("kycCompletedOnce", "true");

      setSuccess(true);
      onSuccess?.();

      // Open KYC link in new tab
      window.open(redirectUrl, '_blank');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Show status-specific views
  if (kycStatus && kycStatus !== 'not_found') {
    if (kycStatus === 'kyc_success') return null;

    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>KYC Status: {kycStatus.replace(/_/g, ' ').toUpperCase()}</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            Your KYC is currently <strong>{kycStatus.replace(/_/g, ' ')}</strong>. Please complete it if needed.
          </Alert>
          {redirectLink && (
            <Typography mt={2}>
              <Link href={redirectLink} target="_blank" rel="noopener">
                Go to KYC Portal
              </Link>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Submit KYC</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">KYC submitted successfully!</Alert>}
        <TextField
          margin="normal"
          fullWidth
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          name="country"
          label="Country"
          value={formData.country}
          disabled
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
