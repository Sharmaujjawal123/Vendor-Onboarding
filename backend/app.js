// part 4 final 

import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// Utility: log submissions into a file
const logFile = path.join(process.cwd(), "submission_log.txt");
function logSubmission(data) {
  fs.appendFileSync(
    logFile,
    `[${new Date().toISOString()}] ${JSON.stringify(data, null, 2)}\n\n`
  );
}

app.post("/submit", upload.single("document"), async (req, res) => {
  try {
    console.log("📥 Received submission:", req.body);

    const {
      vendor_name,
      vendor_email,
      vendor_contact_number,
      service_offering,
      vendor_country,
      currency,
      u_tax_id,
      short_description,
    } = req.body;

    // Dropdown mappings
    const countryMap = { India: "india", "United States": "united_states", Europe: "europe" };
    const currencyMap = { INR: "inr", USD: "usd", EUR: "eur" };
    const serviceOfferingMap = {
      "Soil Testing": "soil_testing",
      Fertilizer: "fertilizer",
      Seeds: "seeds",
      Tractor: "tractor",
      Irrigation: "irrigation",
    };

    // Step 1: Create ServiceNow request
    const payload = {
      sysparm_quantity: 1,
      variables: {
        vendor_name,
        vendor_email,
        vendor_contact_number,
        service_offering: serviceOfferingMap[service_offering] || service_offering,
        u_vendor_country: countryMap[vendor_country] || vendor_country,
        u_currency: currencyMap[currency] || currency,
        u_tax_id,
        short_description,
      },
    };

    console.log("➡️ Sending payload to ServiceNow:", payload);

    const orderResp = await fetch(
      "https://dev317486.service-now.com/api/sn_sc/servicecatalog/items/ec86f0bac3003210f40e514ed4013171/order_now",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from("Ujjawal.Ve:Uwala@99310").toString("base64"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!orderResp.ok) {
      throw new Error(`❌ ServiceNow order failed: ${orderResp.status} ${orderResp.statusText}`);
    }

    const orderData = await orderResp.json();
    console.log("✅ ServiceNow order response:", orderData);

    if (!orderData.result || !orderData.result.sys_id) {
      throw new Error("No sys_id returned from ServiceNow order");
    }

    const requestSysId = orderData.result.sys_id;
    const requestNumber = orderData.result.request_number; // ✅ Added request_number

    // Step 2: Fetch sc_req_item
    const itemResp = await fetch(
      `https://dev317486.service-now.com/api/now/table/sc_req_item?sysparm_query=request=${requestSysId}`,
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from("Ujjawal.Ve:Uwala@99310").toString("base64"),
        },
      }
    );

    if (!itemResp.ok) {
      throw new Error(`❌ Failed to fetch sc_req_item: ${itemResp.status} ${itemResp.statusText}`);
    }

    const items = (await itemResp.json()).result;
    let reqItemSysId = items && items.length > 0 ? items[0].sys_id : null;

    // Step 3: Country-specific file upload
    let variableName = "";
    if (vendor_country === "India") variableName = "gst_file";
    else if (vendor_country === "Europe") variableName = "vat_file";
    else if (vendor_country === "United States") variableName = "w9_file";

    let attachData = null;
    if (req.file && variableName && reqItemSysId) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileName = `${variableName}_${req.file.originalname}`;
        const mimeType = req.file.mimetype || "application/octet-stream";

        const attachResp = await fetch(
          `https://dev317486.service-now.com/api/now/attachment/file?table_name=sc_req_item&table_sys_id=${reqItemSysId}&file_name=${encodeURIComponent(fileName)}`,
          {
            method: "POST",
            headers: {
              Authorization:
                "Basic " + Buffer.from("Ujjawal.Ve:Uwala@99310").toString("base64"),
              "Content-Type": mimeType,
            },
            body: fileBuffer,
          }
        );

        if (attachResp.ok) {
          attachData = await attachResp.json();
          console.log("📎 File uploaded successfully:", attachData);
        } else {
          console.error(
            "❌ File upload failed:",
            attachResp.status,
            attachResp.statusText
          );
          console.error("Response:", await attachResp.text());
        }
      } catch (fileError) {
        console.error("File handling error:", fileError);
      } finally {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // Clean up temp file
      }
    }

    // Log submission
    logSubmission({
      vendor_name,
      vendor_email,
      vendor_contact_number,
      service_offering,
      vendor_country,
      requestSysId,
      requestNumber, // ✅ Log request_number
      reqItemSysId,
      attachmentUploaded: !!attachData,
    });

    // Final response to frontend
    res.json({
      success: true,
      message: "🌾 Vendor registration submitted successfully!",
      requestSysId,
      requestNumber, // ✅ Send to frontend
      reqItemSysId,
      attachment: attachData,
      submittedData: req.body,
    });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Failed to submit vendor registration",
    });
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));


