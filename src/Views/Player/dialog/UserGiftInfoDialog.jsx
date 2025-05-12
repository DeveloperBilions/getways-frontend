import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
} from "reactstrap";
import { Button } from "@mui/material";
import { Parse } from "parse";

const UserGiftInfoDialog = ({ open, onClose, onSubmit }) => {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!fname || !lname || !userEmail) {
      setError("All fields are required.");
      return;
    }

    onSubmit({ firstName: fname, lastName: lname, email: userEmail });
  };

  return (
    <Modal isOpen={open} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Enter Your Details</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>First Name</Label>
          <Input value={fname} onChange={(e) => setFname(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Last Name</Label>
          <Input value={lname} onChange={(e) => setLname(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </FormGroup>
        {error && <div className="text-danger mt-2">{error}</div>}
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save & Confirm</Button>
      </ModalFooter>
    </Modal>
  );
};


export default UserGiftInfoDialog;
