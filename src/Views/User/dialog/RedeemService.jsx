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
// loader
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";
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
        <Modal isOpen={open} toggle={handleCancel} size="md" centered>
          <ModalHeader toggle={handleCancel} className="border-bottom-0">
            Redeem Service Fee
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <Label for="serviceFee">Redeem Service Fee (%)</Label>
                  <FormGroup>
                    <Input
                      id="serviceFee"
                      name="serviceFee"
                      type="text"
                      autoComplete="off"
                      value={serviceFee}
                      onChange={handleServiceFeeChange}
                      maxLength={2}
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

                {identity?.role === "Master-Agent" &&
                  identity?.redeemServiceEnabled === true && (
                    <Col md={12} className="mt-3">
                      <FormGroup check className="form-switch">
                        <Input
                          type="switch"
                          id="redeemSwitch"
                          checked={redeemServiceEnabled}
                          onChange={() =>
                            setRedeemServiceEnabled(!redeemServiceEnabled)
                          }
                        />
                        <Label
                          for="redeemSwitch"
                          check
                          style={{ fontSize: "14px" }}
                        >
                          Allow Agent to change Redeem Service ?
                        </Label>
                      </FormGroup>
                    </Col>
                  )}
                {identity?.role === "Super-User" && (
                  <Col md={12} className="mt-3">
                    <FormGroup check className="form-switch">
                      <Input
                        type="switch"
                        id="redeemSwitch"
                        checked={redeemServiceEnabled}
                        onChange={() =>
                          setRedeemServiceEnabled(!redeemServiceEnabled)
                        }
                      />
                      <Label
                        for="redeemSwitch"
                        check
                        style={{ fontSize: "14px" }}
                      >
                        Allow Agent to change Redeem Service ?
                      </Label>
                    </FormGroup>
                  </Col>
                )}
                {identity?.role === "Master-Agent" &&
                  identity?.isReedeemZeroAllowed === true && (
                    <Col md={12} className="mt-3">
                      <FormGroup check className="form-switch">
                        <Input
                          type="switch"
                          id="redeemSwitch1"
                          checked={redeemServiceZeroAllowed}
                          onChange={() =>
                            setRedeemServiceZeroAllowed(
                              !redeemServiceZeroAllowed
                            )
                          }
                        />
                        <Label
                          for="redeemSwitch1"
                          check
                          style={{ fontSize: "14px" }}
                        >
                          Allow Agent to Add 0 Redeem Service ?
                        </Label>
                      </FormGroup>
                    </Col>
                  )}
                {identity?.role === "Super-User" && (
                  <Col md={12} className="mt-3">
                    <FormGroup check className="form-switch">
                      <Input
                        type="switch"
                        id="redeemSwitch1"
                        checked={redeemServiceZeroAllowed}
                        onChange={() =>
                          setRedeemServiceZeroAllowed(!redeemServiceZeroAllowed)
                        }
                      />
                      <Label
                        for="redeemSwitch1"
                        check
                        style={{ fontSize: "14px" }}
                      >
                        Allow Agent to Add 0 Redeem Service ?
                      </Label>
                    </FormGroup>
                  </Col>
                )}
                <Col md={12} className="mt-3">
                  <div className="d-flex justify-content-end">
                    {identity?.redeemServiceEnabled &&
                      identity?.role === "Master-Agent" && (
                        <Button className="mx-2" color="success" type="submit">
                          Confirm
                        </Button>
                      )}
                    {identity?.role === "Super-User" && (
                      <Button className="mx-2" color="success" type="submit">
                        Confirm
                      </Button>
                    )}

                    <Button color="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default RedeemService;
