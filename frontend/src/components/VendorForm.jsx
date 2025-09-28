// part 4

// VendorForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VendorForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    vendor_name: "",
    vendor_email: "",
    vendor_contact_number: "",
    service_offering: "",
    vendor_country: "",
    currency: "",
    u_tax_id: "",
    short_description: "",

    // Fertilizer
    fertilizer_type: "",
    fertilizer_quantity: "",
    application_date: "",

    // Seeds
    seed_type: "",
    seed_quality: "",
    seed_quantity: "",

    // Soil Testing
    sample_type: "",
    testing_date: "",
    lab_assigned: "",

    // Tractor
    tractor_type: "",
    tractor_hours: "",
    driver_needed: false,
  });

  // file picker
  const [file, setFile] = useState(null);

  // UI state
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // small mock labs list to simulate "reference to Lab table"
  const [labs] = useState([
    { id: "lab_1", name: "GreenField Agri Lab" },
    { id: "lab_2", name: "AgriTest Solutions" },
    { id: "lab_3", name: "Soil & Crop Labs" },
  ]);
  const [labQuery, setLabQuery] = useState("");
  const filteredLabs = labs.filter((l) =>
    l.name.toLowerCase().includes(labQuery.toLowerCase())
  );

  // utility: today's date string for date min
  const today = new Date().toISOString().split("T")[0];

  // handle form changes (robust, functional update)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = { ...prev };

      if (type === "checkbox") next[name] = checked;
      else next[name] = value;

      // auto-select currency when country changes
      if (name === "vendor_country") {
        if (value === "India") next.currency = "INR";
        else if (value === "United States") next.currency = "USD";
        else if (value === "Europe") next.currency = "EUR";
        else next.currency = "";
      }

      // if service offering changed, clear the unrelated extra fields
      if (name === "service_offering") {
        // clear all extras first
        next.fertilizer_type = "";
        next.fertilizer_quantity = "";
        next.application_date = "";

        next.seed_type = "";
        next.seed_quality = "";
        next.seed_quantity = "";

        next.sample_type = "";
        next.testing_date = "";
        next.lab_assigned = "";

        next.tractor_type = "";
        next.tractor_hours = "";
        next.driver_needed = false;

        // then set the chosen offering
        next.service_offering = value;
      }

      return next;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Which groups to show
  const isFertilizer = form.service_offering === "Fertilizer";
  const isSeeds = form.service_offering === "Seeds";
  const isSoil = form.service_offering === "Soil Testing";
  const isTractor = form.service_offering === "Tractor";

  const getFileLabel = () => {
    if (form.vendor_country === "India") return "GST Document";
    if (form.vendor_country === "Europe") return "VAT Document";
    if (form.vendor_country === "United States") return "W8/W9 Document";
    return "Upload Document";
  };

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Append all form keys (stringify booleans)
      Object.keys(form).forEach((k) => {
        const v = form[k];
        if (typeof v === "boolean") data.append(k, v ? "true" : "false");
        else data.append(k, v ?? "");
      });

      if (file) data.append("document", file);

      console.log("Submitting form data:", Object.fromEntries(data.entries()));

      const response = await fetch("https://vendor-onboarding-two.vercel.app/submit", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (result.success) {
        setPopupMessage(
          `✅ Application Submitted Successfully!\nYour registration has been sent for verification 🌾\nRequest No: ${result.requestNumber || "N/A"}`
        );
        setShowPopup(true);

        setTimeout(() => {
          setShowPopup(false);
          navigate("/submission", {
            state: {
              submittedData: { ...form, fileName: file?.name },
              requestSysId: result.requestSysId || "N/A",
              requestNumber: result.requestNumber || "N/A",
            },
          });
        }, 2500);
      } else {
        setPopupMessage("❌ Submission Failed: " + (result.message || result.error || "Unknown error"));
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 4000);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setPopupMessage("⚠️ Network Error: Unable to submit application. Please try again.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-3xl space-y-6 border border-green-200 relative"
      >
        {/* Decorative icons */}
        <div className="absolute -top-4 -left-4 bg-green-200 text-green-800 rounded-full p-2 shadow">🌱</div>
        <div className="absolute -bottom-4 -right-4 bg-green-200 text-green-800 rounded-full p-2 shadow">🚜</div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <span className="bg-green-100 p-4 rounded-full text-4xl">🌾</span>
          </div>
          <h2 className="text-3xl font-extrabold text-green-800">Agriculture Vendor Registration</h2>
          <p className="text-gray-500 text-sm">Partner with us to grow together 🌱</p>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-green-800">Vendor/Company Name *</label>
            <input
              type="text"
              name="vendor_name"
              value={form.vendor_name}
              onChange={handleChange}
              required
              placeholder="Eg. Ujjawal Agro Pvt Ltd"
              className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-green-800">Business Email *</label>
            <input
              type="email"
              name="vendor_email"
              value={form.vendor_email}
              onChange={handleChange}
              required
              placeholder="business@company.com"
              className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-green-800">Contact Number *</label>
            <input
              type="text"
              name="vendor_contact_number"
              value={form.vendor_contact_number}
              onChange={handleChange}
              required
              placeholder="+91 98765 43210"
              className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium text-green-800">Primary Service Offering *</label>
            <select
              name="service_offering"
              value={form.service_offering}
              onChange={handleChange}
              required
              className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
            >
              <option value="">Select Your Primary Service</option>
              <option value="Soil Testing">🧪 Soil Testing</option>
              <option value="Fertilizer">🌱 Fertilizer</option>
              <option value="Seeds">🌾 Seeds</option>
              <option value="Tractor">🚜 Tractor</option>
              <option value="Irrigation">💧 Irrigation Equipment</option>
            </select>
          </div>
        </div>

        {/* Dynamic blocks by service offering */}

        {/* Fertilizer */}
        {isFertilizer && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Fertilizer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-green-800">Fertilizer Type *</label>
                <select
                  name="fertilizer_type"
                  value={form.fertilizer_type}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                >
                  <option value="">Select Type</option>
                  <option value="Organic">Organic</option>
                  <option value="Urea">Urea</option>
                  <option value="NPK">NPK</option>
                  <option value="Phosphatic">Phosphatic</option>
                </select>
              </div>

              <div>
                <label className="block text-green-800">Quantity (Kg) *</label>
                <input
                  type="number"
                  name="fertilizer_quantity"
                  value={form.fertilizer_quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Eg. 100"
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-green-800">Application Date *</label>
                <input
                  type="date"
                  name="application_date"
                  value={form.application_date}
                  onChange={handleChange}
                  required
                  min={today}
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Seeds */}
        {isSeeds && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Seed Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-green-800">Seed Type *</label>
                <select
                  name="seed_type"
                  value={form.seed_type}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                >
                  <option value="">Select Seed Type</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Open-pollinated">Open-pollinated</option>
                  <option value="GMO">GMO</option>
                </select>
              </div>

              <div>
                <label className="block text-green-800">Seed Quality *</label>
                <select
                  name="seed_quality"
                  value={form.seed_quality}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                >
                  <option value="">Select Quality</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-green-800">Quantity (Kg) *</label>
                <input
                  type="number"
                  name="seed_quantity"
                  value={form.seed_quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Eg. 50"
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Soil Testing */}
        {isSoil && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Soil Testing Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-green-800">Sample Type *</label>
                <select
                  name="sample_type"
                  value={form.sample_type}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                >
                  <option value="">Select Sample</option>
                  <option value="Soil">Soil</option>
                  <option value="Water">Water</option>
                  <option value="Plant Tissue">Plant Tissue</option>
                </select>
              </div>

              <div>
                <label className="block text-green-800">Testing Date *</label>
                <input
                  type="date"
                  name="testing_date"
                  value={form.testing_date}
                  onChange={handleChange}
                  required
                  min={today}
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-green-800">Lab Assigned *</label>
                <input
                  name="lab_assigned"
                  list="labs"
                  value={form.lab_assigned}
                  onChange={(e) => {
                    handleChange(e);
                    setLabQuery(e.target.value);
                  }}
                  placeholder="Search labs..."
                  required
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                />
                <datalist id="labs">
                  {filteredLabs.map((l) => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Tip: Start typing to select a lab.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tractor */}
        {isTractor && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Tractor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-green-800">Tractor Type *</label>
                <select
                  name="tractor_type"
                  value={form.tractor_type}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                >
                  <option value="">Select Type</option>
                  <option value="Mini">Mini</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>

              <div>
                <label className="block text-green-800">Hours Required *</label>
                <input
                  type="number"
                  name="tractor_hours"
                  value={form.tractor_hours}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Eg. 8"
                  className="w-full border-2 border-green-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div>
                  <label className="block text-green-800">Driver Needed</label>
                  <div className="mt-1">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="driver_needed"
                        checked={form.driver_needed}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-green-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Country & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-green-800">Country *</label>
            <select
              name="vendor_country"
              value={form.vendor_country}
              onChange={handleChange}
              required
              className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
            >
              <option value="">Select Country</option>
              <option value="India">🇮🇳 India</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="Europe">🇪🇺 Europe</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-green-800">Currency (Auto-Selected)</label>
            <input
              type="text"
              name="currency"
              value={form.currency}
              readOnly
              className="w-full border-2 border-green-100 bg-gray-50 rounded-lg p-2"
              placeholder="Select country first"
            />
          </div>
        </div>

        {/* Tax ID */}
        <div>
          <label className="block font-medium text-green-800">Tax Identification Number *</label>
          <input
            type="text"
            name="u_tax_id"
            value={form.u_tax_id}
            onChange={handleChange}
            required
            placeholder="Eg. GSTIN / VAT ID"
            className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
          />
        </div>

        {/* Business Description */}
        <div>
          <label className="block font-medium text-green-800">Business Description</label>
          <textarea
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            placeholder="Tell us about your services"
            className="w-full border-2 border-green-300 focus:border-green-500 rounded-lg p-2"
            rows="3"
          />
        </div>

        {/* Decorative File Upload */}
        {form.vendor_country && (
          <div>
            <label className="block font-medium text-green-800">{getFileLabel()} *</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center px-6 py-8 bg-green-50 text-green-700 rounded-2xl shadow-inner cursor-pointer hover:bg-green-100 border-2 border-dashed border-green-300 w-full">
                <svg className="w-10 h-10 mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0l-4 4m4-4l4 4M17 8v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span className="font-semibold text-sm">{file ? file.name : "Click to upload file (PDF, JPG, PNG)"}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <small className="text-xs text-gray-500 mt-2">Max 10MB. Supported: pdf, doc, jpg, png</small>
              </label>
            </div>
          </div>
        )}

        {/* Big Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-xl font-extrabold shadow-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "🔄 Submitting..." : "🌱 Submit Application"}
        </button>
      </form>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-3 border-t-4 border-green-500 max-w-md mx-4">
            <div className="text-lg font-semibold text-green-700 whitespace-pre-line">{popupMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}
