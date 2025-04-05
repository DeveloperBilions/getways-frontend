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
import { regenerateTransfiKycLink, submitTransfiKyc } from '../../../Utils/transfi';

export default function SubmitKYCDialog({ open, onClose, onSuccess, identity }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: 'US',
    dob: '',
    myuserId: identity?.objectId
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [redirectLink, setRedirectLink] = useState('');
  const [linkExpired, setLinkExpired] = useState(false);

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
        const generatedAt = result.get("linkGeneratedAt");

        setKycStatus(status);
        setRedirectLink(result.get('redirectUrl'));
       
        if (['kyc_failed', 'kyc_rejected'].includes(status)) {
          setLinkExpired(true);
        }
        
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
      !isValidEmail(formData.email) ||
      !isNonEmpty(formData.dob)
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
        dob: formData.dob,
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
  const handleGenerateNewKycLink = async () => {
    setLoading(true);
    setError('');
    try {
      const { redirectUrl } = await regenerateTransfiKycLink(identity?.objectId);
      setRedirectLink(redirectUrl);
      setLinkExpired(false);
      window.open(redirectUrl, '_blank');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate new KYC link');
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
          {redirectLink && !linkExpired && (
            <>
            <Alert severity="info">
            Your KYC is currently <strong>{kycStatus.replace(/_/g, ' ')}</strong>. Please complete it if needed.
          </Alert>
            <Typography mt={2}>
              <Link href={redirectLink} target="_blank" rel="noopener">
                Go to KYC Portal
              </Link>
            </Typography>
            </>
          )}
           {linkExpired && (
  <Typography mt={2}>
    <Alert severity="warning" sx={{ mb: 2 }}>
    Your KYC attempt was rejected or failed. Please generate a new link to try again.    </Alert>
    <Button
      variant="outlined"
      onClick={handleGenerateNewKycLink}
      disabled={loading}
    >
      {loading ? <CircularProgress size={20} /> : 'Generate New KYC Link'}
    </Button>
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
      <Alert severity="warning" sx={{ mb: 2 }}>
          Please ensure the details you enter match the information on the document you will upload for the KYC process.
        </Alert>
        <Alert severity="warning" sx={{ mb: 2 }}>
        For verification, please use your email and a debit card registered to your name as it appears on your Driving License.
        </Alert>
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
          name="dob"
          label="Date of Birth"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
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
