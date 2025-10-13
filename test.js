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

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Hard-coded transporter for tirupatipackagetours.com email
const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // GoDaddy SMTP
  port: 465,
  secure: true, // SSL
  auth: {
    user: "enquiry@tirupatipackagetours.com", // your domain email
    pass: "Nagesh1987@",                     // actual email password
  },
});

// Optional: Verify SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP connection failed:", err);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

// Contact form API endpoint
app.post("/api/submit-feedback", async (req, res) => {
  const { name, emailId, contactNo, userFeedback, packageId } = req.body;

  // Validate fields
  if (!name || !emailId || !contactNo || !userFeedback || !packageId) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const mailOptions = {
    from: `"Website Contact" <enquiry@tirupatipackagetours.com>`, // must match SMTP user
    to: "enquiry@tirupatipackagetours.com",                        // where to receive emails
    subject: `New Contact Form Submission - Package ID: ${packageId}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${emailId}</p>
      <p><strong>Phone:</strong> ${contactNo}</p>
      <p><strong>Package ID:</strong> ${packageId}</p>
      <p><strong>Feedback:</strong><br/>${userFeedback}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.response || error.toString(),
    });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
