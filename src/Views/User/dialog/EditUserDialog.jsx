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
} from "reactstrap";
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const EditUserDialog = ({ open, onClose, record, fetchAllUsers }) => {
    // State for form fields (initially empty)
    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    // const [balance, setBalance] = useState("");

    const resetFields = () => {
        setUserName("");
        setName("");
        setEmail("");
        // setBalance("");
    };

    useEffect(() => {
        if (record && open) {
            // Populate fields when modal opens
            setUserName(record.username || "");
            setName(record.name || "");
            setEmail(record.email || "");
            // setBalance(record.balance || "");
        } else {
            // Reset fields when modal closes
            resetFields();
        }
    }, [record, open]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await Parse.Cloud.run("updateUser", {
                userId: record.id,
                username: userName,
                name,
                email,
                // balance: parseFloat(balance),
            });
            onClose();
            fetchAllUsers();
            resetFields();
        } catch (error) {
            console.error("Error Editing User details", error);
        }
    };

    return (
        <Modal isOpen={open} toggle={onClose} size="md" centered>
            <ModalHeader toggle={onClose} className="border-bottom-0">Edit User Details</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="userName">User Name</Label>
                                <Input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    autoComplete="off"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label for="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="off"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </Col>

                        {/* <Col md={12}>
                            <FormGroup>
                                <Label for="balance">Balance</Label>
                                <Input
                                    id="balance"
                                    name="balance"
                                    type="number"
                                    autoComplete="off"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </Col> */}

                        <Col md={12}>
                            <div className="d-flex justify-content-end">
                                <Button className="mx-2" color="success" type="submit">
                                    Confirm
                                </Button>
                                <Button color="secondary" onClick={onClose}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default EditUserDialog;
