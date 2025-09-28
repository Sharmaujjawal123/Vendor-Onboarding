

// part 3

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Submission() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.submittedData;
  const requestNumber = location.state?.requestNumber || "N/A";

  const copyRequestNumber = () => {
    navigator.clipboard.writeText(requestNumber);
    alert(`Request Number ${requestNumber} copied to clipboard!`);
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>No data found. Please fill the form first.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Form
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-200">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl space-y-6 border border-green-200">
        <h2 className="text-2xl font-bold text-green-800 text-center">
          🌾 Submission Details
        </h2>
        <p className="text-center text-gray-600">Here’s what you submitted:</p>

        <div className="space-y-3 text-green-900">
          <p>
            <strong>Request Number:</strong> {requestNumber}
            <button
              onClick={copyRequestNumber}
              className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Copy
            </button>
          </p>
          <p><strong>Vendor Name:</strong> {data.vendor_name}</p>
          <p><strong>Email:</strong> {data.vendor_email}</p>
          <p><strong>Contact:</strong> {data.vendor_contact_number}</p>
          <p><strong>Service Offering:</strong> {data.service_offering}</p>
          <p><strong>Country:</strong> {data.vendor_country}</p>
          <p><strong>Currency:</strong> {data.currency}</p>
          <p><strong>Tax ID:</strong> {data.u_tax_id}</p>
          <p><strong>Description:</strong> {data.short_description}</p>
          <p><strong>File:</strong> {data.fileName || "Uploaded"}</p>

          {/* Extra fields based on Service Offering */}
          {data.service_offering === "Fertilizer" && (
            <>
              <p><strong>Fertilizer Type:</strong> {data.fertilizer_type}</p>
              <p><strong>Fertilizer Quantity:</strong> {data.fertilizer_quantity}</p>
              <p><strong>Application Date:</strong> {data.application_date}</p>
            </>
          )}

          {data.service_offering === "Seeds" && (
            <>
              <p><strong>Seed Type:</strong> {data.seed_type}</p>
              <p><strong>Seed Quality:</strong> {data.seed_quality}</p>
              <p><strong>Seed Quantity:</strong> {data.seed_quantity}</p>
            </>
          )}

          {data.service_offering === "Soil Testing" && (
            <>
              <p><strong>Sample Type:</strong> {data.sample_type}</p>
              <p><strong>Testing Date:</strong> {data.testing_date}</p>
              <p><strong>Lab Assigned:</strong> {data.lab_assigned}</p>
            </>
          )}

          {data.service_offering === "Tractor" && (
            <>
              <p><strong>Tractor Type:</strong> {data.tractor_type}</p>
              <p><strong>Hours Required:</strong> {data.hours_required}</p>
              <p><strong>Driver Needed:</strong> {data.driver_needed ? "Yes" : "No"}</p>
            </>
          )}

          {data.service_offering === "Irrigation" && (
            <>
              <p><strong>Irrigation Equipment:</strong> {data.irrigation_type}</p>
              <p><strong>Quantity:</strong> {data.irrigation_quantity}</p>
            </>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Form
          </button>
        </div>
      </div>
    </div>
  );
}
