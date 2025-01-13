import React from "react";
import "./Maintenance.css";

export const Maintenance = () => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10 main-title">
          <h1>Website</h1>
          <h2>under construction</h2>
          <h4>Try Again in <strong>10 Mins...</strong></h4>
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col-sm-10 col-md-6 col-lg-6 svg-img p-5 ">
          <img src="/assets/maintenance.svg" alt="Logo" />
        </div>
      </div>
    </div>
  );
};
