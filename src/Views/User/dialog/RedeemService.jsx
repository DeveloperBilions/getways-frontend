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
  ModalFooter,
} from "reactstrap";
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";
import { Box } from "@mui/material";
// Initialize Parse
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const RedeemService = ({ open, onClose, record, fetchAllUsers }) => {
  const { identity } = useGetIdentity();
  const [serviceFee, setServiceFee] = useState();
  const [redeemServiceEnabled, setRedeemServiceEnabled] = useState(false);
  const [redeemServiceZeroAllowed, setRedeemServiceZeroAllowed] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setServiceFee();
    setRedeemServiceEnabled(false);
    setError("");
  };

  const parentServiceFee = async () => {
    try {
      const response = await Parse.Cloud.run("redeemParentServiceFee", {
        userId: record?.id,
      });
      setServiceFee(response?.redeemService || 0);
      setRedeemServiceEnabled(response?.redeemServiceEnabled || false);
      setRedeemServiceZeroAllowed(response?.isReedeemZeroAllowed || false);
    } catch (error) {
      console.error("Error fetching parent service fee:", error);
    }
  };

  useEffect(() => {
    if (record && open) {
      parentServiceFee();
    } else {
      resetFields();
    }
  }, [record, open]);

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

    if (!record?.id) {
      setError("User Not Found");
      return;
    }
    const rawData = {
      userId: record?.id,
      redeemService: serviceFee,
      redeemServiceEnabled: redeemServiceEnabled,
      redeemServiceZeroAllowed,
    };

    setLoading(true);
    try {
      await Parse.Cloud.run("redeemServiceFee", rawData);
      onClose();
      setLoading(false);
      fetchAllUsers();
      resetFields();
    } catch (error) {
      console.error("Error in User Redeem Fees Update", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetFields();
    onClose();
  };

  return (
    <React.Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Modal
          isOpen={open}
          toggle={handleCancel}
          // size="md"
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={handleCancel}
            className="custom-modal-header border-bottom-0"
          >
            Redeem Service Fee
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <Label for="serviceFee" className="custom-label">
                    Redeem Service Fee (%)
                  </Label>
                  <FormGroup>
                    <Input
                      id="serviceFee"
                      name="serviceFee"
                      type="text"
                      autoComplete="off"
                      value={serviceFee}
                      onChange={handleServiceFeeChange}
                      maxLength={2}
                      className="custom-input"
                      required
                      disabled={
                        !identity?.redeemServiceEnabled &&
                        identity?.role === "Master-Agent"
                      }
                    />
                    {error && (
                      <FormText color="danger" className="mb-2 mt-0">
                        {error}
                      </FormText>
                    )}
                  </FormGroup>
                </Col>
                <Box className="d-flex flex-column">
                  {identity?.role === "Master-Agent" &&
                    identity?.redeemServiceEnabled === true && (
                      <Col
                        md={12}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px",
                          borderRadius: "5px",
                        }}
                      >
                        <Label
                          for="redeemSwitch"
                          check
                          style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            fontFamily: "var(--font-family)",
                            marginLeft: "5px",
                          }}
                        >
                          Allow Agent to change Redeem Service ?
                        </Label>
                        <FormGroup check className="form-switch">
                          <Input
                            type="switch"
                            id="redeemSwitch"
                            checked={redeemServiceEnabled}
                            className="green-switch"
                            onChange={() =>
                              setRedeemServiceEnabled(!redeemServiceEnabled)
                            }
                          />
                        </FormGroup>
                      </Col>
                    )}
                  {identity?.role === "Super-User" && (
                    <Col
                      md={12}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        backgroundColor: "#F6F4F4",
                        borderRadius: "5px",
                      }}
                    >
                      <Label
                        for="redeemSwitch"
                        check
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          fontFamily: "var(--font-family)",
                          marginLeft: "5px",
                        }}
                      >
                        Allow Agent to change Redeem Service ?
                      </Label>
                      <FormGroup check className="form-switch">
                        <Input
                          type="switch"
                          id="redeemSwitch"
                          checked={redeemServiceEnabled}
                          className="green-switch"
                          onChange={() =>
                            setRedeemServiceEnabled(!redeemServiceEnabled)
                          }
                        />
                      </FormGroup>
                    </Col>
                  )}
                  {identity?.role === "Master-Agent" &&
                    identity?.isReedeemZeroAllowed === true && (
                      <Col
                        md={12}
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px",
                          backgroundColor: "#F6F4F4",
                          borderRadius: "5px",
                        }}
                      >
                        <Label
                          for="redeemSwitch1"
                          check
                          style={{
                            fontSize: "14px",
                            fontWeight: 400,
                            fontFamily: "var(--font-family)",
                            marginLeft: "5px",
                          }}
                        >
                          Allow Agent to Add 0 Redeem Service ?
                        </Label>
                        <FormGroup check className="form-switch">
                          <Input
                            type="switch"
                            id="redeemSwitch1"
                            className="green-switch"
                            checked={redeemServiceZeroAllowed}
                            onChange={() =>
                              setRedeemServiceZeroAllowed(
                                !redeemServiceZeroAllowed
                              )
                            }
                          />
                        </FormGroup>
                      </Col>
                    )}
                  {identity?.role === "Super-User" && (
                    <Col
                      md={12}
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        backgroundColor: "#F6F4F4",
                        borderRadius: "5px",
                      }}
                    >
                      <Label
                        for="redeemSwitch1"
                        check
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          fontFamily: "var(--font-family)",
                          marginLeft: "5px",
                        }}
                      >
                        Allow Agent to Add 0 Redeem Service ?
                      </Label>
                      <FormGroup check className="form-switch">
                        <Input
                          type="switch"
                          id="redeemSwitch1"
                          className="green-switch"
                          checked={redeemServiceZeroAllowed}
                          onChange={() =>
                            setRedeemServiceZeroAllowed(
                              !redeemServiceZeroAllowed
                            )
                          }
                        />
                      </FormGroup>
                    </Col>
                  )}
                </Box>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter className="custom-modal-footer">
            <Col md={12} className="mt-3">
              <Box
                className="d-flex w-100 justify-content-between"
                sx={{
                  flexDirection: { xs: "column", sm: "row" }, // Column on small screens, row on larger screens
                  alignItems: { xs: "stretch", sm: "stretch" }, // Stretch items to take full width in both modes
                  gap: { xs: 2, sm: 2 }, // Add spacing between buttons
                  marginBottom: { xs: 2, sm: 2 }, // Add margin at the bottom
                  width: "100% !important", // Ensure the container takes full width
                  paddingRight: { xs: 0, sm: 1 },
                }}
              >
                {identity?.redeemServiceEnabled &&
                  identity?.role === "Master-Agent" && (
                    <Button className="custom-button confirm" type="submit">
                      Confirm
                    </Button>
                  )}
                {identity?.role === "Super-User" && (
                  <Button className="custom-button confirm" type="submit">
                    Confirm
                  </Button>
                )}

                <Button className="custom-button cancel" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Col>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};
export default RedeemService;
