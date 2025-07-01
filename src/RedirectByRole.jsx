// src/Views/RedirectByRole.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "react-admin";

const RedirectByRole = () => {
  const navigate = useNavigate();
  const { permissions, isLoading } = usePermissions();

  useEffect(() => {
    if (!isLoading) {
      if (!permissions) {
        navigate("/login", { replace: true });
      } else if (permissions === "Player") {
        navigate("/playerDashboard", { replace: true });
      } else {
        navigate("/users", { replace: true });
      }
    }
  }, [permissions, isLoading, navigate]);

  return null;
};

export default RedirectByRole;
