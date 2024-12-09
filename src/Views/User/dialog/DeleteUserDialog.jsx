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
} from "reactstrap";
import { Parse } from "parse";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const DeleteUserDialog = ({ open, onClose, record, fetchAllUsers }) => {
    const [deleteInput, setDeleteInput] = useState("");


    const handleInputChange = (event) => {
        setDeleteInput(event.target.value);
    };

    const handleCancel = () => {
        onClose();
        setDeleteInput("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const userId = record.id;
            await Parse.Cloud.run("deleteUser", {
                userId
            });
            onClose();
            fetchAllUsers();
        } catch (error) {
            console.error("Error Deleting User details", error);
        }
    };

    return (
        <Modal isOpen={open} toggle={handleCancel} size="md" centered>
            <ModalHeader toggle={handleCancel} className="border-bottom-0">Delete User</ModalHeader>
            <ModalBody>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="name" className="pb-0 mb-0">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="off"
                                    value={record.name}
                                    disabled
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label for="email" className="pb-0 mb-0">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    value={record.email}
                                    disabled
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <FormGroup>
                                <Label for="delete" className="pb-0 mb-1">To confirm this, type”DELETE”</Label>
                                <Input
                                    id="delete"
                                    name="delete"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="DELETE"
                                    value={deleteInput}
                                    onChange={handleInputChange}
                                    required
                                />
                            </FormGroup>
                        </Col>

                        <Col md={12}>
                            <div className="d-flex justify-content-end">
                                <Button className="mx-2" color="danger" type="submit" onClick={handleSubmit} disabled={deleteInput !== "DELETE"}>
                                    Delete
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

export default DeleteUserDialog;
