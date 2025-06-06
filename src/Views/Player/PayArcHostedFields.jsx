import React, { useEffect, useState, useRef } from "react";
import { useGetIdentity } from "react-admin";
import { Parse } from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const PayArcCheckout = ({rechargeAmount}) => {
  const [clientId, setClientId] = useState("WjLE4zjEwwDEzYPk");
  const { identity } = useGetIdentity();

  const placeholderRef = useRef();
  const resultContentRef = useRef();

  // Load PayArc & jQuery Scripts
  useEffect(() => {
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) return resolve();

        const script = document.createElement("script");
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadScripts = async () => {
      try {
        await loadScript(
          "https://code.jquery.com/jquery-3.7.1.min.js",
          "jquery"
        );
        await loadScript(
          "https://portal.payarc.net/js/iframeprocess.js",
          "payarc-iframe"
        );
      } catch (error) {
        console.error("Failed to load scripts", error);
      }
    };

    loadScripts();
  }, []);
  const payarcStyles = `

.checkout {
  display: flex;
  width: 100%;
  justify-content: space-around;
}


::placeholder {
  color: #bdc3c7;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #bdc3c7;
  margin-bottom: 5px;
}

.input-panel button {
  width: 100%;
  padding: 10px;
  background: #419DF1;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.input-panel button:hover {
  background: #2f71b0;
}

/* Right Panel */
.result-panel {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 600px;
}

.result-panel .placeholder {
  font-size: 16px;
  color: #95a5a6;
}

.result-panel .result-content {
  display: none;
  font-size: 16px;
  color: #121744;
  width: 100%;
}

#card-token-container {
  display: flex;
  flex-wrap: wrap;
}

#credit-card-number {
  width: 100%;
}

.half-width {
  width: 50%;
}

.half-width div {
  width: 100%;
  height: 65px;
}

#credit-card-zip {
  width: 100%;
}

.btn {
  width: 100%;
  padding: 14px;
  background: #000000 !important;
  color: white !important;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 16px;
  transition: background 0.2s ease;
}

.btn:hover {
  background: #1f1f1f !important;
}



.checkout-container * {
  box-sizing: border-box;
}

.checkout-header {
  text-align: center;
  margin-bottom: 20px;
}

.checkout-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #bdc3c7;
  padding-bottom: 10px;
}

.checkout-payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkout-btn  {
  width: 100%;
  padding: 14px;
  background: #000000 !important;
  color: white !important;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 16px;
  transition: background 0.2s ease;
}

.checkout-btn :hover {
  background: #1f1f1f !important;
}

.checkout-btn-card {
  background: #34495e;
}

.checkout-btn-card:hover {
  background: #121744;
}

#paypal-button-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
  .payarc-all {
    box-sizing: border-box;
  }
  .payarc-input {
    width: 100%;
    padding: 12px;
    border-radius: 4px;
    resize: vertical;
  }
  .payarc-label {
    display: none;
  }
  .payarc-container {
    border-radius: 5px;
    background-color: transparent;
  }
  .payarc-label-container {
    float: left;
    width: 25%;
  }
  .payarc-input-container {
    float: left;
    width: 55%;
    margin-top: 6px;
  }
  .payarc-row:after {
    content: "";
    display: table;
    clear: both;
  }
  .payarc-input-default {
    color: black;
    font-size: 14px;
    border-style: solid;
    border-width: 1px;
    border-color: gray;
  }
  .payarc-input-success {
    color: #5cb85c;
    font-size: 14px;
    border-style: solid;
    border-width: 1px;
    border-color: #5cb85c;
  }
  .payarc-input-error {
    color: #d9534f;
    font-size: 14px;
    border-style: solid;
    border-width: 1px;
    border-color: #d9534f;
  }
`;
  const PAYARC_SETTINGS = {
    FORM_STATUS: "form-status",
    INITIATE_PAYMENT: "initiate-payment",
    FIELDS_CONTAINER: "card-token-container",
    TOKEN_CALLBACK: {
      success: async (obj) => {
        const response = JSON.parse(obj.response);
        const token = response.token;
        const el = document.getElementById("card-token");
        if (el) el.textContent = token;
    
        console.log("Tokenization successful!", token);
    
        try {
          const chargeResponse = await Parse.Cloud.run("createPayarcCharge", {
            token_id: token,
            amount: rechargeAmount * 100,
            currency: "usd",
            description: `Recharge by ${identity?.username || 'User'}`
          });
    
          if (chargeResponse && chargeResponse.status === "succeeded") {
            const user = await Parse.User.current()?.fetch();
            const identity = user?.toJSON();
    
            const TransactionDetails = Parse.Object.extend("TransactionRecords");
            const transaction = new TransactionDetails();
    
            transaction.set("type", "recharge");
            transaction.set("gameId", "786");
            transaction.set("username", identity?.username || "");
            transaction.set("userId", identity?.objectId);
            transaction.set("transactionDate", new Date());
            transaction.set("transactionAmount", rechargeAmount);
            transaction.set("remark", "Payarc Recharge");
            transaction.set("useWallet", false);
            transaction.set("userParentId", user?.get("userParentId") || "");
            transaction.set("status", 2); // Success
            transaction.set("portal", "Payarc");
            transaction.set("transactionIdFromStripe", token);
            transaction.set("referralLink", response?.payment_form_url || "");
            transaction.set("walletAddr", identity?.walletAddr || "");
    
            await transaction.save(null, { useMasterKey: true });
            alert("Recharge completed and transaction saved successfully!");
          } else {
            alert("Charge failed or declined by PayArc");
          }
        } catch (error) {
          console.error("Charge or save failed:", error);
          alert("Something went wrong during payment or saving transaction.");
        }
      },
      error: (obj) => {
        alert(`ERROR: ${obj.status} - ${obj.statusText}`);
        if (![422, 409].includes(obj.status)) {
          alert("Payment gateway error. Please try again.");
        }
      },
      paymentWindowClosed: () => {
        console.log("Payment window closed");
      },
    },
    walletPayment: {
      amount: rechargeAmount * 100,
      html: walletHtml(rechargeAmount), // ✅ pass value here
      css: walletCss(),
      onWindowOpened: () => {
        if (placeholderRef.current) {
          placeholderRef.current.innerHTML = "Waiting for payment...";
          placeholderRef.current.style.display = "block";
        }
        if (resultContentRef.current)
          resultContentRef.current.style.display = "none";
      },
      onWindowClosed: () => {
        if (placeholderRef.current)
          placeholderRef.current.style.display = "none";
        if (resultContentRef.current)
          resultContentRef.current.style.display = "block";
      },
      onTokenReceived: (token) => {
        if (placeholderRef.current) {
          placeholderRef.current.innerHTML = `Payment token: ${token}`;
          placeholderRef.current.style.display = "block";
        }
        if (resultContentRef.current)
          resultContentRef.current.style.display = "none";
      },
      windowWidth: 600,
      windowHeight: 450,
    }
  };

  useEffect(() => {
    if (window.ApplePaySession) {
      document
        .querySelectorAll(".apple-pay-button")
        .forEach((btn) => (btn.style.display = "block"));
    }

    if (clientId && window.initPayarcTokenizer) {
      const interval = setInterval(() => {
        const allReady =
          document.getElementById("credit-card-number") &&
          document.getElementById("credit-card-exp") &&
          document.getElementById("credit-card-cvv") &&
          document.getElementById("credit-card-zip") &&
          document.getElementById("form-status");

        if (allReady) {
          clearInterval(interval);
          window.initPayarcTokenizer(clientId, PAYARC_SETTINGS);
        }
      }, 100);
    }

    localStorage.setItem("iframe-demo", JSON.stringify({ clientId }));
  }, [clientId]);

  const handleClientIdChange = (e) => {
    const value = e.target.value;
    setClientId(value);
    localStorage.setItem("iframe-demo", JSON.stringify({ clientId: value }));

    if (value && window.initPayarcTokenizer) {
      window.initPayarcTokenizer(value, PAYARC_SETTINGS);
    }
  };

  const handlePayment = () => {
    if (window.getPayarcToken) {
      window.getPayarcToken(document.getElementById("initiate-payment"));
    }
  };

  return (
    <div
    >
      <style
        id="payarc-styles"
        dangerouslySetInnerHTML={{ __html: payarcStyles }}
      />
      <div
        style={{ display: "flex", justifyContent: "center", padding: "20px" }}
      >
        <div
          ref={placeholderRef}
          className="placeholder"
          style={{ color: "#95a5a6" }}
        >
          {clientId ? "" : "Waiting for Client ID..."}
        </div>

        <div
          ref={resultContentRef}
          className="result-content"
          style={{
            display: clientId ? "block" : "none",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <div
            className="checkout-card"
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid #e0e0e0",
              textAlign:"center"
            }}
          >
                     <span>Recharge Amount:{rechargeAmount}</span>

            <div id="card-token-container">
              
              <div
                id="credit-card-number"
                data-payarc="CARD_NUMBER"
                data-placeholder="Card Number"
                style={{ height: 65 }}
              ></div>
              <div style={{ display: "flex", gap: "10px",width:"100%" }}>
                <div
                  id="credit-card-exp"
                  data-payarc="EXP"
                  data-placeholder="MM/YY"
                  style={{ flex: 1, height: 65 ,width:"100%" }}
                ></div>
                <div
                  id="credit-card-cvv"
                  data-payarc="CVV"
                  data-placeholder="CVV"
                  style={{ flex: 1, height: 65 , width:"100%" }}
                ></div>
              </div>
              <div
                id="credit-card-zip"
                data-payarc="ZIP"
                data-placeholder="ZIP Code"
                style={{ height: 65, }}
              ></div>
            </div>
            <div id="card-token"></div>
            <div
              id="form-status"
              style={{ color: "red", textAlign: "center", marginTop: "10px" }}
            ></div>

            <button
              id="initiate-payment"
              onClick={handlePayment}
              className="btn"
              style={{ marginTop: "15px" }}
            >
              Buy
            </button>

            <div
              style={{ textAlign: "center", margin: "10px 0", color: "black" }}
            >
              Prefer a wallet payment? Select one below.
            </div>

            {/* <button
              className="checkout-btn apple-pay-button"
              style={{ display: "none", background: "#000", color: "#fff" }}
              data-payarc-wallet="apple-pay"
            >
              Apple Pay
            </button> */}
            <button class="checkout-btn" data-payarc-wallet="apple-pay">Apple Pay</button>

            <button
              className="checkout-btn"
              style={{ background: "#4285F4", color: "#fff" }}
              data-payarc-wallet="google-pay"
            >
              Google Pay
            </button>
            <div id="paypal-button-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

function walletHtml(rechargeAmount) {
  return `<div class="bg-color">
  <div class="ant-checkout-container">
      <div class="center-align">
          <div class="ant-checkout-card">
              <div class="ant-checkout-header">
                  <h2>Checkout</h2>
              </div>
              <div class="ant-checkout-item">
                  <span>Total</span>
                  <span>${rechargeAmount}</span>
              </div>
              <div class="ant-checkout-payment-methods">
                  <div id='apple-pay-placeholder'></div>
                  <div id='google-pay-placeholder'></div>
              </div>
          </div>
      </div>
  </div>
</div>`;
}

function walletCss() {
  return `.ant-checkout-container * {
    box-sizing: border-box;
}
.ant-checkout-card {
    width: 50%;
    background: #ecf0f1;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
}
.ant-checkout-header {
    text-align: center;
    margin-bottom: 20px;
}
.ant-checkout-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    border-bottom: 1px solid #bdc3c7;
    padding-bottom: 10px;
}
.ant-checkout-payment-methods {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.ant-checkout-btn {
    width: 100%;
    padding: 10px;
    background: #419DF1;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s ease;
}
.ant-checkout-btn:hover {
    background: #2f71b0;
}
.ant-checkout-btn-card {
    background: #34495e;
}
.ant-checkout-btn-card:hover {
    background: #2c3e50;
}
.center-align {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 90px);
}
.logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    padding: 10px;
}
.logo-img {
    width: 150px;
    height: auto;
}
.bg-color {
    background: #121744;
}
#apple-pay-placeholder {
    width: 100% !important;
}
`;
}

export default PayArcCheckout;
