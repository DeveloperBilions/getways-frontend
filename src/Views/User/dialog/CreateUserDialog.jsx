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

const CreateUserDialog = ({ open, onClose, fetchAllUsers }) => {
    // State for form fields (initially empty)
    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    // const [balance, setBalance] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const resetFields = () => {
        setUserName("");
        setName("");
        setEmail("");
        // setBalance("");
        setPassword("");
        setConfirmPassword("");
        setErrorMessage("");
    };

    const validatePassword = (password) => {
        const passwordRegex = /^.{6,}$/;
        return passwordRegex.test(password);
    };

    const handleCancel = () => {
        onClose();
        resetFields();
    };

    // Function to create a new user in Parse
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validatePassword(password)) {
            setErrorMessage(
                "Password must be at least 6 characters long."
            );
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            await Parse.Cloud.run("createUser", {
                username: userName,
                name,
                email,
                password,
                // balance: parseFloat(balance),
            });
            onClose();
            fetchAllUsers();
            resetFields();
        } catch (error) {
            console.error("Error Creating User details", error);
        }
    };

    return (
        <Modal isOpen={open} toggle={handleCancel} size="md" centered>
            <ModalHeader toggle={handleCancel} className="border-bottom-0">
                Add New user
            </ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="userName" className="pb-0 mb-0">
                                    User Name
                                </Label>
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
                                <Label for="name" className="pb-0 mb-0">
                                    Name
                                </Label>
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
                                <Label for="email" className="pb-0 mb-0">
                                    Email
                                </Label>
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
                                <Label for="balance" className="pb-0 mb-0">
                                    Balance
                                </Label>
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
                            <FormGroup>
                                <Label for="password" className="pb-0 mb-0">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="text"
                                    autoComplete="off"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <FormText>
                                    Password must be at least 6 characters long.
                                </FormText>
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label for="confirmPassword" className="pb-0 mb-0">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="text"
                                    autoComplete="off"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </Col>

                        {errorMessage && (
                            <Col sm={12}>
                                <Label
                                    for="errorResponse"
                                    invalid={true}
                                    className="text-danger mb-2"
                                >
                                    {errorMessage}
                                </Label>
                            </Col>
                        )}

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
    );
};

export default CreateUserDialog;
