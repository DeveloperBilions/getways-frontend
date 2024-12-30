import React from "react";
import "./Loader.css";

export const Loader = () => {
  return (
    <React.Fragment>
      <div className="loading-container" tabIndex="1">
        <div className="loader">
          <img src="/assets/Loading.gif" alt="Loading..." />
          <p>Loading...</p>
        </div>
      </div>
    </React.Fragment>
  );
};

export const KPILoader = () => {
  return (
    <React.Fragment>
      <div className="kpi-loading-container" tabIndex="1" />
    </React.Fragment>
  );
};
