import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { KYCReport } from "../../Utils/utils";

const Kyc = () => {
  const [rawData, setRawData] = useState([]);
  // KYC status data in the provided format
  const fetchKycRecords = async () => {
    const kycCalc = await KYCReport([]);
    setRawData(kycCalc.data);
  };

  useEffect(() => {
    fetchKycRecords();
  }, []);

  const calculateKycData = () => {
    return [
      {
        id: 0,
        value: rawData.kyc_expired,
        label: "KYC Expired",
        color: "#FF8042"
      },
      { 
        id: 1, 
        value: rawData.kyc_failed, 
        label: "KYC Failed", 
        color: "#f44336" 
      },
      { 
        id: 2, 
        value: rawData.kyc_initiated, 
        label: "KYC Initiated", 
        color: "#FFBB28" 
      },
      { 
        id: 3, 
        value: rawData.kyc_pending, 
        label: "KYC Pending", 
        color: "#2196f3" 
      },
      { 
        id: 4, 
        value: rawData.kyc_success, 
        label: "KYC Success", 
        color: "#4caf50" 
      }
    ];
  };

  // Generate pie chart data using the same approach as your other reports
  const pieChartData = calculateKycData();

  // Calculate total
  const total = Object.values(rawData).reduce((sum, value) => sum + value, 0);

  return (
    <div style={{ width: '100%', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>KYC Status Overview</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <PieChart
          series={[
            {
              data: pieChartData,
              highlightScope: {
                faded: "global",
                highlighted: "item",
              },
              faded: {
                innerRadius: 30,
                additionalRadius: -30,
                color: "gray",
              }
            },
          ]}
          height={400}
          width={500}
          margin={{
            top: 0,
            bottom: 100,
            left: 30,
            right: 30,
          }}
          legend={{
            direction: "row",
            position: {
              vertical: "bottom",
              horizontal: "middle",
            },
          }}
        />
      </div>
      
      <div style={{ marginTop: '16px' }}>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Total KYC Requests: {total}
        </p>
      </div>
    </div>
  );
};

export default Kyc;
