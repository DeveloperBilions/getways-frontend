import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  FormGroup,
  Input,
} from "reactstrap";

import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const ReferralDialog = ({ open, onClose, referralCode }) => {
  const [copied, setCopied] = useState(false);

  var referralLink = `${process.env.REACT_APP_REFERRAL_URL}/create-user?referral=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <Modal isOpen={open} toggle={onClose} size="md" centered>
      <ModalHeader toggle={onClose} className="border-bottom-0">
        Generate Referral Link
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={2}>
            <FormGroup>
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--primary-color)",
                }}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </FormGroup>
          </Col>
          <Col md={10}>
            <FormGroup>
              <Input
                id="userName"
                name="userName"
                type="text"
                autoComplete="off"
                value={referralLink}
                required
                disabled
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default ReferralDialog;
