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
    var referralLink = `http://localhost:3000/#/create-user?referral=${referralCode}`;
    function generateRandomString() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    return (
        <Modal isOpen={open} toggle={onClose} size="md" centered>
            <ModalHeader toggle={onClose} className="border-bottom-0">
                Generate Referral Link
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={2}>
                        <FormGroup>
                            <button onClick={()=> navigator.clipboard.writeText(referralLink)}>copy</button>
                        </FormGroup>
                    </Col>
                    <Col md={10}>
                        <FormGroup>
                            <Label for="userName" className="pb-0 mb-0">
                                Referral
                            </Label>
                            <Input
                                id="userName"
                                name="userName"
                                type="text"
                                autoComplete="off"
                                value={referralLink}
                                // onChange={(e) => setUserName(e.target.value)}
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
