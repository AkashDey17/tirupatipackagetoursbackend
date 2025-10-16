// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Gmail SMTP setup
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "sanchar6t@gmail.com", // Your Gmail address
//     pass: "osmkddsswavncyim",   // Your Gmail App Password
//   },
// });

// // API endpoint for contact form submission
// app.post("/api/submit-feedback", async (req, res) => {
//   const { name, emailId, contactNo, userFeedback, packageId } = req.body;

//   // Validate required fields
//   if (!name || !emailId || !contactNo || !userFeedback || !packageId) {
//     return res.status(400).json({
//       success: false,
//       message: "All fields are required",
//     });
//   }

//   const mailOptions = {
//     from: `"Website Contact" <sanchar6t@gmail.com>`,
//     to: "sanchar6t@gmail.com", // Where you want to receive submissions
//     subject: `New Contact Form Submission - Package ID: ${packageId}`,
//     html: `
//       <h2>New Contact Form Submission</h2>
//       <p><strong>Name:</strong> ${name}</p>
//       <p><strong>Email:</strong> ${emailId}</p>
//       <p><strong>Phone:</strong> ${contactNo}</p>
//       <p><strong>Selected Package ID:</strong> ${packageId}</p>
//       <p><strong>Feedback/Message:</strong><br/>${userFeedback}</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return res.json({ success: true, message: "Feedback submitted successfully" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error. Please try again later.",
//       error: error.message,
//     });
//   }
// });

// // Start server
// const PORT = 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/// below code is perfect
// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Hard-coded transporter for tirupatipackagetours.com email
// const transporter = nodemailer.createTransport({
//   host: "smtpout.secureserver.net", // GoDaddy SMTP
//   port: 465,
//   secure: true, // SSL
//   auth: {
//     user: "enquiry@tirupatipackagetours.com", // your domain email
//     pass: "Nagesh1987@",                     // actual email password
//   },
// });

// // Optional: Verify SMTP connection on startup
// transporter.verify((err, success) => {
//   if (err) {
//     console.error("SMTP connection failed:", err);
//   } else {
//     console.log("✅ SMTP server is ready to send emails");
//   }
// });

// // Contact form API endpoint
// app.post("/api/submit-feedback", async (req, res) => {
//   const { name, emailId, contactNo, userFeedback, packageId } = req.body;

//   // Validate fields
//   if (!name || !emailId || !contactNo || !userFeedback || !packageId) {
//     return res.status(400).json({ success: false, message: "All fields are required" });
//   }

//   const mailOptions = {
//     from: `"Website Contact" <enquiry@tirupatipackagetours.com>`, // must match SMTP user
//     to: "enquiry@tirupatipackagetours.com",                        // where to receive emails
//     subject: `New Contact Form Submission - Package ID: ${packageId}`,
//     html: `
//       <h2>New Contact Form Submission</h2>
//       <p><strong>Name:</strong> ${name}</p>
//       <p><strong>Email:</strong> ${emailId}</p>
//       <p><strong>Phone:</strong> ${contactNo}</p>
//       <p><strong>Package ID:</strong> ${packageId}</p>
//       <p><strong>Feedback:</strong><br/>${userFeedback}</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.json({ success: true, message: "Feedback submitted successfully" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send email",
//       error: error.response || error.toString(),
//     });
//   }
// });

// // Start server
// app.listen(5000, () => console.log("Server running on port 5000"));


const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(bodyParser.json());

// --- PhonePe Sandbox Test Credentials ---
const MERCHANT_ID = "TEST-M222NJL8ZHVEM_25041";
const CLIENT_SECRET = "NjIxZTdiZGYtMzlkOS00ZTkyLWFhNjItZTZhNTBjNTgyM2I0";
const CLIENT_VERSION = "1";
const SANDBOX_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

// --- Helper: Get OAuth Token ---
async function getOAuthToken() {
  try {
    const formData = new URLSearchParams({
      client_id: MERCHANT_ID,
      client_secret: CLIENT_SECRET,
      client_version: CLIENT_VERSION,
      grant_type: "client_credentials",
    });

    const response = await axios.post(
      `${SANDBOX_BASE_URL}/v1/oauth/token`,
      formData.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data.access_token;
  } catch (err) {
    console.error("Error getting OAuth token:", err.response?.data || err.message);
    return null;
  }
}

// --- Create Payment Order ---
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { merchantOrderId, amount } = req.body;
    if (!merchantOrderId || !amount) {
      return res.status(400).json({ error: "merchantOrderId and amount are required" });
    }

    const token = await getOAuthToken();
    if (!token) return res.status(500).json({ error: "Failed to get OAuth token" });

    const requestBody = {
      merchantOrderId,
      amount: parseInt(amount), // amount in paise
      expireAfter: 1200,
      metaInfo: {},
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Payment for testing",
        // merchantUrls: { redirectUrl: `http://localhost:5000/api/payment/callback` },
        merchantUrls: { 
      redirectUrl: `http://localhost:8080/payment-result?orderId=${merchantOrderId}` 
    },
        paymentModeConfig: {
          enabledPaymentModes: [],
          disabledPaymentModes: [],
        },
      },
    };

    const response = await axios.post(
      `${SANDBOX_BASE_URL}/checkout/v2/pay`,
      requestBody,
      { headers: { Authorization: `O-Bearer ${token}`, "Content-Type": "application/json" } }
    );

    res.json({ orderId: merchantOrderId, phonepeResponse: response.data });
  } catch (err) {
    console.error("Error creating order:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// --- Callback Endpoint ---

app.post("/api/payment/callback", async (req, res) => {
  console.log("PhonePe Callback received:", req.body);


 res.sendStatus(200); 
});


// --- Test Endpoint ---
app.get("/", (req, res) => res.send("PhonePe Node.js Sandbox Backend Running"));

// --- Start Server ---
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

