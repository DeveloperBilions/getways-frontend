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

import { useGetIdentity, usePermissions } from 'react-admin';
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CreateUserDialog = ({ open, onClose, fetchAllUsers }) => {
    const { identity } = useGetIdentity();
    const { permissions } = usePermissions();
    console.log("@@@@@", permissions);

    // State for form fields (initially empty)
    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    // const [balance, setBalance] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [parentOptions, setParentOptions] = useState([]);
    const [parentType, setParentType] = useState("");
    const [userType, setUserType] = useState("");

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

    const fetchUsersByRole = async () => {
        try {
            const users = await Parse.Cloud.run("getUsersByRole", { roleName: "Agent" });
            setParentOptions(users);
        } catch (error) {
            console.error("Error fetching users by role:", error.message);
            return [];
        }
    };

    useEffect(() => {
        fetchUsersByRole();
    }, []);

    // Combine parentOptions with identity
    const combinedOptions = [
        { id: identity?.objectId, name: identity?.name, role: identity?.role },
        ...parentOptions,
    ];

    console.log("=====", combinedOptions);

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

        const data = {
            username: userName,
            name,
            email,
            password,
            parentType,
            userType,
            userParentId: identity?.objectId,
            userParentName: identity?.name,
        };

        try {
            if (permissions === "Super-User") {
                console.log("----- in super user");


            } else if (permissions === "Agent") {
                console.log("----- in agent");
                await Parse.Cloud.run("createUser", {
                    roleName: "Player",
                    username: userName,
                    name,
                    email,
                    password,
                    // balance: parseFloat(balance),
                    userParentId: identity?.objectId,
                    userParentName: identity?.name
                });
                onClose();
                fetchAllUsers();
                resetFields();
            }
            return
            await Parse.Cloud.run("createUser", {
                username: userName,
                name,
                email,
                password,
                // balance: parseFloat(balance),
                userParentId: identity?.objectId,
                userParentName: identity?.name
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

                        {permissions === "Super-User" && (
                            <>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="exampleSelect">
                                            User Type
                                        </Label>
                                        <Input
                                            id="exampleSelect"
                                            name="select"
                                            type="select"
                                            value={userType}
                                            onChange={(e) => setUserType(e.target.value)}
                                            required
                                        >
                                            <option value="Agent">Agent</option>
                                            <option value="Player">Player</option>
                                        </Input>
                                    </FormGroup>
                                </Col>

                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="exampleSelect">
                                            Parent Type
                                        </Label>
                                        <Input
                                            id="exampleSelect"
                                            name="select"
                                            type="select"
                                            value={parentType}
                                            onChange={(e) => setParentType(e.target.value)}
                                            required
                                        >
                                            {combinedOptions.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {`${user.role}: ${user.name}`}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </>
                        )}

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
