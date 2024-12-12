import React, { useState, useEffect } from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    FormGroup,
    Label,
    Form,
    Input,
    FormText,
} from "reactstrap";

import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const ReferralDialog = ({ open, onClose, fetchAllUsers, referralCode }) => {
    // var referralLink = `http://localhost:3000/#/create-user?referral=${referralCode}`;
    var referralLink = `${process.env.REACT_APP_REFERRAL_URL}/#/create-user?referral=${referralCode}`;

    return (
        <Modal isOpen={open} toggle={onClose} size="md" centered>
            <ModalHeader toggle={onClose} className="border-bottom-0">
                Generate Referral Link
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={2}>
                        <FormGroup>
                            <Button onClick={() => navigator.clipboard.writeText(referralLink)}>Copy</Button>
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
    )
};

export default ReferralDialog;
