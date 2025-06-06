import { useLocation } from "react-router-dom";
import PayArcCheckout from "../Player/PayArcHostedFields";

export default function CheckoutPayARC() {
  const location = useLocation();
  return (
    <PayArcCheckout rechargeAmount={location?.state?.rechargeAmount} />
  );
}
