import { useSearchParams } from 'react-router-dom';
import RechargeWidgetPopup from './RechargeWidget';
import { useEffect, useState } from 'react';
import { Parse } from "parse";
Parse.initialize(process.env.REACT_APP_APPID, process.env.REACT_APP_MASTER_KEY);
Parse.serverURL = process.env.REACT_APP_URL;
const RechargeWidgetPage = () => {
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const walletId = searchParams.get("walletId");
  const remark = searchParams.get("remark");
  const platform = searchParams.get("platform") || "desktop";
  const type = searchParams.get("type"); // 'recharge' or 'redeem'
  const [showRechargeWidget, setShowRechargeWidget] = useState(true);
  const token    = searchParams.get("token");                 // 🔑 NEW
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!token) {
        setError("Missing token in the URL.");
        setLoading(false);
        return;
      }

      try {
        const { valid } = await Parse.Cloud.run("verifyAccessToken", {
          platformName: platform,   // use the same name you stored in DB
          token
        });

        if (!cancelled) {
          if (valid) {
            setShowWidget(true);    // show the popup
          } else {
            setError("Token is invalid or has expired.");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("verifyAccessToken error:", err);
        if (!cancelled) {
          setError("Could not verify your token.");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [platform, token]);
  if (loading)  return <p>Loading&hellip;</p>;
  if (error)    return <p style={{ color: "red" }}>{error}</p>;

  return (
    <RechargeWidgetPopup
    open={showWidget}
    onClose={() => setShowWidget(false)}
      walletId={walletId}
      remark={remark}
      platform={platform}
      type={type}
      userId={userId}
      onOptionClick={(id, details) => {
        console.log("Clicked:", id, details);
      }}
    />
  );
};

export default RechargeWidgetPage;
