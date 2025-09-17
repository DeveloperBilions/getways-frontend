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
import { Box } from "@mui/material";
import { Loader } from "../../Loader";
import { Parse } from "parse";
import { useGetIdentity } from "react-admin";

Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;

const CommissionRateModal = ({
  open,
  onClose,
  record,
  fetchAllUsers,
  handleRefresh,
}) => {
  const { identity } = useGetIdentity();
  const [commissionRate, setCommissionRate] = useState();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setCommissionRate();
    setError("");
  };
  const loadCommissionRate = async () => {
    try {
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("objectId", record?.id);
      const user = await userQuery.first({ useMasterKey: true });
      setCommissionRate(user?.get("commissionRate") ?? 0);
    } catch (err) {
      console.error("Error loading commission rate:", err);
    }
  };

  useEffect(() => {
    if (record && open) {
      loadCommissionRate();
    } else {
      resetFields();
    }
  }, [record, open]);

  const handleCommissionChange = (e) => {
    const value = e.target.value.trim();
    const parsedValue = parseInt(value, 10);
    if (!/^\d*$/.test(value)) {
      setError("Only numeric values are allowed.");
    } else if (parsedValue < 0 || parsedValue > 100) {
      setError("Commission Rate must be between 0 and 100.");
    } else {
      setError("");
      setCommissionRate(parsedValue || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (commissionRate < 0 || commissionRate > 100) {
      setError("Commission Rate must be between 0 and 100.");
      return;
    }
    if (!record?.id) {
      setError("User Not Found");
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch the user
      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo("objectId", record.id);
      const user = await userQuery.first({ useMasterKey: true });

      if (!user) {
        setError("User not found");
        setLoading(false);
        return;
      }

      // 2. Update user's commissionRate
      user.set("commissionRate", commissionRate);

      const isMasterAgent = user.get("roleName") === "Master-Agent";

      if (isMasterAgent) {
        // 3. Find child Agents
        const childQuery = new Parse.Query(Parse.User);
        childQuery.equalTo("userParentId", user.id);
        childQuery.equalTo("roleName", "Agent");
        const childAgents = await childQuery.find({ useMasterKey: true });

        // 4. Update all child Agents
        await Promise.all(
          childAgents.map((child) => {
            child.set("commissionRate", commissionRate);
            return child.save(null, { useMasterKey: true });
          })
        );
      }
      // 5. Save parent user
      await user.save(null, { useMasterKey: true });

      fetchAllUsers();
      handleRefresh();
      onClose();
      resetFields();
    } catch (err) {
      console.error("Error updating commission rate:", err);
      setError("Update failed. Please try again.");
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
          centered
          className="custom-modal"
        >
          <ModalHeader
            toggle={handleCancel}
            className="custom-modal-header border-bottom-0"
          >
            Update Conversion Rate
          </ModalHeader>
          <ModalBody className="custom-modal-body">
            <Form>
              <Row>
                <Col md={12}>
                  <Label for="commissionRate" className="custom-label">
                    Conversion Rate (%)
                  </Label>
                  <FormGroup>
                    <Input
                      id="commissionRate"
                      type="text"
                      autoComplete="off"
                      value={commissionRate}
                      onChange={handleCommissionChange}
                      maxLength={3}
                      className="custom-input"
                      required
                    />
                    {error && (
                      <FormText color="danger" className="mb-2 mt-0">
                        {error}
                      </FormText>
                    )}
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter className="custom-modal-footer">
            <Col md={12} className="mt-3">
              <Box
                className="d-flex w-100 justify-content-between"
                sx={{
                  flexDirection: { xs: "column-reverse", sm: "row" },
                  alignItems: { xs: "stretch", sm: "stretch" },
                  gap: { xs: 2, sm: 2 },
                  marginBottom: { xs: 2, sm: 2 },
                  width: "100% !important",
                  paddingRight: { xs: 0, sm: 1 },
                }}
              >
                <Button className="custom-button cancel" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  className="custom-button confirm"
                  onClick={handleSubmit}
                >
                  Confirm
                </Button>
              </Box>
            </Col>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default CommissionRateModal;
