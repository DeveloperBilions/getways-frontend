import React, { useState } from "react";
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

const RedeemService = ({ open, onClose, record, fetchAllUsers }) => {

    const [serviceFee, setServiceFee] = useState(5);
    const [error, setError] = useState("");

    const resetFields = () => {
        setServiceFee(5);
        setError("");
    };

    const handleServiceFeeChange = (e) => {
        const value = e.target.value.trim();
        const parsedValue = parseInt(value, 10);

        if (!/^\d*$/.test(value)) {
            setError("Only numeric values are allowed.");
        } else if (parsedValue < 0 || parsedValue > 20) {
            setError("Service Fee must be between 0 and 20.");
        } else {
            setError("");
            setServiceFee(parsedValue || 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (serviceFee < 0 || serviceFee > 20) {
            setError("Service Fee must be between 0 and 20.");
            return;
        }

        const rawData = {
            userId: record?.id,
            redeemService: serviceFee
        }

        try {
            await Parse.Cloud.run("redeemServiceFee", rawData);
            onClose();
            fetchAllUsers();
            resetFields();
        } catch (error) {
            console.error("Error in User Redeem Fees Update", error);
        }
    };

    const handleCancel = () => {
        resetFields();
        onClose();
    };

    return (
        <Modal isOpen={open} toggle={handleCancel} size="sm" centered>
            <ModalHeader toggle={handleCancel} className="border-bottom-0">Redeem Service Fee</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Label for="userName">Redeem Service Fee (%)</Label>

                        <Col md={4}>
                            <FormGroup>
                                <Input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    autoComplete="off"
                                    value={serviceFee}
                                    onChange={handleServiceFeeChange}
                                    maxLength={2}
                                    required
                                />
                            </FormGroup>
                        </Col>

                        {error && <FormText color="danger" className="mb-2 mt-0">{error}</FormText>}

                        <Col md={12}>
                            <div className="d-flex justify-content-end">
                                <Button className="mx-2" color="success" type="submit">
                                    Confirm
                                </Button>
                                <Button color="secondary" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
        </Modal>
    )
};

export default RedeemService;
