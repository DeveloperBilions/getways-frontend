import React from "react";
import {
    Row,
    Col,
    FormGroup,
    Label,
    Form,
    Input,
    FormText,
    Card,
    Container,
    CardBody,
} from "reactstrap";
import { useLocation } from 'react-router-dom';
import { Button } from "@mui/material";

const ReferralLinkForm = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const referral = searchParams.get('referral');

    return (
        <React.Fragment>
            <h1 class="p-3 mb-2 bg-dark text-white text-center">GETWAYS</h1>
            <Container className="w-50">
                <Card className="mt-5">
                    <CardBody>
                        <Form>
                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label for="userName" className="pb-0 mb-0">
                                            Referral
                                        </Label>
                                        <Input
                                            id="userName"
                                            name="userName"
                                            type="text"
                                            autoComplete="off"
                                            value={referral}
                                            // onChange={(e) => setUserName(e.target.value)}
                                            required
                                            disabled
                                        />
                                    </FormGroup>
                                </Col>

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
                                            // value={userName}
                                            // onChange={(e) => setUserName(e.target.value)}
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
                                            // value={name}
                                            // onChange={(e) => setName(e.target.value)}
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
                                            // value={email}
                                            // onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </FormGroup>
                                </Col>

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
                                            // value={password}
                                            // onChange={(e) => setPassword(e.target.value)}
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
                                            // value={confirmPassword}
                                            // onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </FormGroup>
                                </Col>


                                 <Col md={12}>
                    <div className="d-flex justify-content-end">
                        <Button className="mx-2" variant="outlined" color="primary" type="submit">
                            Confirm
                        </Button>
                        <Button variant="outlined" color="secondary" >
                            Cancel
                        </Button>
                    </div>
                </Col> 
                            </Row>
                        </Form>
                    </CardBody>
                </Card>
            </Container>
        </React.Fragment>
    )
};

export default ReferralLinkForm;
