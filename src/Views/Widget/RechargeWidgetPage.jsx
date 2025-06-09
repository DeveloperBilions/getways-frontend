import { useSearchParams } from 'react-router-dom';
import RechargeWidgetPopup from './RechargeWidget';
import { useState } from 'react';

const RechargeWidgetPage = () => {
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const walletId = searchParams.get("walletId");
  const remark = searchParams.get("remark");
  const platform = searchParams.get("platform") || "desktop";
  const type = searchParams.get("type"); // 'recharge' or 'redeem'
  const [showRechargeWidget, setShowRechargeWidget] = useState(true);

  return (
    <RechargeWidgetPopup
    open={showRechargeWidget}
    onClose={() => setShowRechargeWidget(false)} // ✅ closes widget      userId={userId}
      walletId={walletId}
      remark={remark}
      platform={platform}
      type={type}
      onOptionClick={(id, details) => {
        console.log("Clicked:", id, details);
      }}
    />
  );
};

export default RechargeWidgetPage;
