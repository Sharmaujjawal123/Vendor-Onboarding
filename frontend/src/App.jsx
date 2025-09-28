import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VendorForm from "./components/VendorForm";
import SubmissionPage from "./components/Submission";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VendorForm />} />
        <Route path="/submission" element={<SubmissionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
