import React, { useEffect } from "react";
import "./Maintenance.css";

export const Maintenance = () => {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <React.Fragment>
      <div className="center-container">
        <img
          src="/assets/maintenance.svg"
          alt="Centered SVG"
          className="svg-image"
        />
      </div>
    </React.Fragment>
  );
};
