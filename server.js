// const express = require("express");
// const cors = require("cors");
// const sql = require("msnodesqlv8");
// const path=require("path");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());


// app.use(express.static(path.join(__dirname, "public")));
// // Database connection string for Windows Authentication
// const connectionString = `Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}`;

// // Helper to allow async/await with msnodesqlv8
// function queryAsync(query) {
//   return new Promise((resolve, reject) => {
//     sql.query(connectionString, query, (err, rows) => {
//       if (err) reject(err);
//       else resolve(rows);
//     });
//   });
// }

// // ------------------- TOUR OPTIONS -------------------
// const TOUR_OPTIONS = {
//   serenity: {
//     id: "serenity",
//     title: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights",
//     days: [
//       {
//         dayNumber: 1,
//         date: "",
//         activities: [
//           { timeStart: "06:00", timeEnd: "08:00", title: "Travel to Tirupati", type: "Travel", location: "From Bangalore", estimatedDurationMinutes: 120, notes: "Start early in the morning" },
//           { timeStart: "08:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 210, notes: "Follow the queue; book special entry if needed" },
//           { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Hotel or Local Restaurant", estimatedDurationMinutes: 90, notes: "Try local Andhra cuisine" }
//         ]
//       },
//       {
//         dayNumber: 2,
//         date: "",
//         activities: [
//           { timeStart: "07:00", timeEnd: "09:00", title: "Srikalahasti Darshan", type: "Temple", location: "Srikalahasti Temple", estimatedDurationMinutes: 120, notes: "Famous for Vayu Linga" },
//           { timeStart: "09:30", timeEnd: "12:00", title: "Local Sightseeing & Photography", type: "Sightseeing", location: "Nearby scenic spots", estimatedDurationMinutes: 150, notes: "Capture the temple town beauty" }
//         ]
//       }
//     ],
//     hotels: [{ name: "Tirupati Grand Hotel", area: "Tirupati", recommendedFor: "Families, Couples", approxPriceRange: "₹2500 - ₹4000/night" }],
//     darshanEstimates: [
//       { templeName: "Tirumala Temple", recommendedSlot: "08:30 - 12:00", estimatedWaitMinutes: 180, notes: "Peak hours in morning" },
//       { templeName: "Srikalahasti Temple", recommendedSlot: "07:00 - 09:00", estimatedWaitMinutes: 120, notes: "Less crowded in early morning" }
//     ],
//     timelineForChart: [
//       { label: "Travel", day: 1, startHourDecimal: 6, endHourDecimal: 8 },
//       { label: "Tirumala Darshan", day: 1, startHourDecimal: 8.5, endHourDecimal: 12 },
//       { label: "Lunch", day: 1, startHourDecimal: 12.5, endHourDecimal: 14 },
//       { label: "Srikalahasti Darshan", day: 2, startHourDecimal: 7, endHourDecimal: 9 },
//       { label: "Sightseeing", day: 2, startHourDecimal: 9.5, endHourDecimal: 12 }
//     ],
//     packageTitle: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights"
//   },

//   templeTrails: {
//     id: "templeTrails",
//     title: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night (Free Dharshan)",
//     days: [
//       {
//         dayNumber: 1,
//         date: "",
//         activities: [
//           { timeStart: "06:00", timeEnd: "10:00", title: "Travel to Tirupati", type: "Travel", location: "From Chennai", estimatedDurationMinutes: 240, notes: "Morning bus ride" },
//           { timeStart: "10:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 90, notes: "Free darshan slot" },
//           { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Local eatery", estimatedDurationMinutes: 90, notes: "Andhra special dishes" }
//         ]
//       },
//       {
//         dayNumber: 2,
//         date: "",
//         activities: [
//           { timeStart: "07:00", timeEnd: "09:00", title: "Local Temple Hopping", type: "Temple", location: "Kapila Theertham & Govindaraja Swamy Temple", estimatedDurationMinutes: 120, notes: "Short walks and photo ops" }
//         ]
//       }
//     ],
//     hotels: [{ name: "Temple Trails Inn", area: "Tirupati", recommendedFor: "Solo travelers, Pilgrims", approxPriceRange: "₹1500 - ₹2500/night" }],
//     darshanEstimates: [
//       { templeName: "Tirumala Temple", recommendedSlot: "10:30 - 12:00", estimatedWaitMinutes: 90, notes: "Morning free darshan" }
//     ],
//     timelineForChart: [
//       { label: "Travel", day: 1, startHourDecimal: 6, endHourDecimal: 10 },
//       { label: "Tirumala Darshan", day: 1, startHourDecimal: 10.5, endHourDecimal: 12 },
//       { label: "Lunch", day: 1, startHourDecimal: 12.5, endHourDecimal: 14 },
//       { label: "Temple Hopping", day: 2, startHourDecimal: 7, endHourDecimal: 9 }
//     ],
//     packageTitle: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night (Free Dharshan)"
//   }
// };

// // ------------------- PLAN API -------------------
// app.post("/api/plan", async (req, res) => {
//   try {
//     const { tourId } = req.body;
//     if (!tourId || !TOUR_OPTIONS[tourId]) {
//       return res.status(400).json({ error: "Invalid tourId" });
//     }

//     // simulate AI delay
//     await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));

//     res.json({ success: true, plan: TOUR_OPTIONS[tourId] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch itinerary" });
//   }
// });

// // NEW API: Get package list (only ID and name)
// app.get("/api/package-list", async (req, res) => {
//   try {
//     const query = `
//       SELECT PackageID, PackageName
//       FROM [Sanchar6T_Dev].[dbo].[Package]
//       ORDER BY PackageID
//     `;
//     const rows = await queryAsync(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Server error");
//   }
// });

// // API to submit user feedback
// app.post("/api/submit-feedback", async (req, res) => {
//   try {
//     const { name, contactNo, emailId, userFeedback, packageId } = req.body;

//     if (!name || !contactNo || !emailId || !userFeedback || !packageId) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     const query = `
//       EXEC [dbo].[sp_UserFeedback]
//         @Flag='I',
//         @Name='${name}',
//         @ContactNo='${contactNo}',
//         @EmailId='${emailId}',
//         @UserFeedback='${userFeedback}',
//         @PackageId=${packageId},
//         @CreatedBy=0
//     `;

//     const result = await queryAsync(query);

//     res.json({ success: true, message: "Thank you for submitting, we will get back to you soon!" });
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// // ------------------- SERVER START -------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//the above code is with msnodesqlv8 below is with mssql


// the above is going good
// const express = require("express");
// const cors = require("cors");
// const sql = require("mssql");
// const path = require("path");
// require("dotenv").config();
// const nodemailer = require("nodemailer");




// const app = express();
// // app.use(cors());
// app.use(express.json());
// app.use(cors({
//   origin: "*", // allow all domains, or put your frontend URL here
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type"]
// }));


// // ------------------- DATABASE CONFIG -------------------
// const dbConfig = {
//   user: process.env.DB_USER,       
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER,   
//   port: parseInt(process.env.DB_PORT),  // <-- use port from .env
//   database: process.env.DB_NAME,
//   options: {
//     encrypt: false,                // false for local dev
//     trustServerCertificate: true
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// };

// // Serve static files from the "public" folder
// app.use(express.static(path.join(process.cwd(), "public")));




// // Setup Nodemailer with Gmail + App Password
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // your Gmail
//     pass: process.env.EMAIL_PASS.replace(/\s/g, ""), // 16-digit App password
//   },
// });

// // Helper function for queries
// async function queryAsync(query) {
//   let pool;
//   try {
//     pool = await sql.connect(dbConfig);
//     const result = await pool.request().query(query);
//     return result.recordset;
//   } catch (err) {
//     console.error("SQL error:", err);
//     throw err;
//   } finally {
//     if (pool) await pool.close();
//   }
// }

// // ------------------- TOUR OPTIONS -------------------
// // ------------------- TOUR OPTIONS -------------------
// const TOUR_OPTIONS = {
//   serenity: {
//     id: "serenity",
//     title: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights",
//     days: [
//       {
//         dayNumber: 1,
//         date: "",
//         activities: [
//           { timeStart: "06:00", timeEnd: "08:00", title: "Travel to Tirupati", type: "Travel", location: "From Bangalore", estimatedDurationMinutes: 120, notes: "Start early in the morning" },
//           { timeStart: "08:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 210, notes: "Follow the queue; book special entry if needed" },
//           { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Hotel or Local Restaurant", estimatedDurationMinutes: 90, notes: "Try local Andhra cuisine" }
//         ]
//       },
//       {
//         dayNumber: 2,
//         date: "",
//         activities: [
//           { timeStart: "07:00", timeEnd: "09:00", title: "Srikalahasti Darshan", type: "Temple", location: "Srikalahasti Temple", estimatedDurationMinutes: 120, notes: "Famous for Vayu Linga" },
//           { timeStart: "09:30", timeEnd: "12:00", title: "Local Sightseeing & Photography", type: "Sightseeing", location: "Nearby scenic spots", estimatedDurationMinutes: 150, notes: "Capture the temple town beauty" }
//         ]
//       }
//     ],
//     hotels: [{ name: "Tirupati Grand Hotel", area: "Tirupati", recommendedFor: "Families, Couples", approxPriceRange: "₹2500 - ₹4000/night" }],
//     darshanEstimates: [
//       { templeName: "Tirumala Temple", recommendedSlot: "08:30 - 12:00", estimatedWaitMinutes: 180, notes: "Peak hours in morning" },
//       { templeName: "Srikalahasti Temple", recommendedSlot: "07:00 - 09:00", estimatedWaitMinutes: 120, notes: "Less crowded in early morning" }
//     ],
//     timelineForChart: [
//       { label: "Travel", day: 1, startHourDecimal: 6, endHourDecimal: 8 },
//       { label: "Tirumala Darshan", day: 1, startHourDecimal: 8.5, endHourDecimal: 12 },
//       { label: "Lunch", day: 1, startHourDecimal: 12.5, endHourDecimal: 14 },
//       { label: "Srikalahasti Darshan", day: 2, startHourDecimal: 7, endHourDecimal: 9 },
//       { label: "Sightseeing", day: 2, startHourDecimal: 9.5, endHourDecimal: 12 }
//     ],
//     packageTitle: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights"
//   },

//   templeTrails: {
//     id: "templeTrails",
//     title: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night (Free Dharshan)",
//     days: [
//       {
//         dayNumber: 1,
//         date: "",
//         activities: [
//           { timeStart: "06:00", timeEnd: "10:00", title: "Travel to Tirupati", type: "Travel", location: "From Chennai", estimatedDurationMinutes: 240, notes: "Morning bus ride" },
//           { timeStart: "10:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 90, notes: "Free darshan slot" },
//           { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Local eatery", estimatedDurationMinutes: 90, notes: "Andhra special dishes" }
//         ]
//       },
//       {
//         dayNumber: 2,
//         date: "",
//         activities: [
//           { timeStart: "07:00", timeEnd: "09:00", title: "Local Temple Hopping", type: "Temple", location: "Kapila Theertham & Govindaraja Swamy Temple", estimatedDurationMinutes: 120, notes: "Short walks and photo ops" }
//         ]
//       }
//     ],
//     hotels: [{ name: "Temple Trails Inn", area: "Tirupati", recommendedFor: "Solo travelers, Pilgrims", approxPriceRange: "₹1500 - ₹2500/night" }],
//     darshanEstimates: [
//       { templeName: "Tirumala Temple", recommendedSlot: "10:30 - 12:00", estimatedWaitMinutes: 90, notes: "Morning free darshan" }
//     ],
//     timelineForChart: [
//       { label: "Travel", day: 1, startHourDecimal: 6, endHourDecimal: 10 },
//       { label: "Tirumala Darshan", day: 1, startHourDecimal: 10.5, endHourDecimal: 12 },
//       { label: "Lunch", day: 1, startHourDecimal: 12.5, endHourDecimal: 14 },
//       { label: "Temple Hopping", day: 2, startHourDecimal: 7, endHourDecimal: 9 }
//     ],
//     packageTitle: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night (Free Dharshan)"
//   }
// };

// // ------------------- PLAN API -------------------
// app.post("/api/plan", async (req, res) => {
//   try {
//     const { tourId } = req.body;
//     if (!tourId || !TOUR_OPTIONS[tourId]) return res.status(400).json({ error: "Invalid tourId" });

//     await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
//     res.json({ success: true, plan: TOUR_OPTIONS[tourId] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch itinerary" });
//   }
// });

// // ------------------- PACKAGE LIST API -------------------
// // app.get("/api/package-list", async (req, res) => {
// //   try {
// //     const rows = await queryAsync(`SELECT PackageID, PackageName FROM Package ORDER BY PackageID`);
// //     res.json(rows);
// //   } catch (err) {
// //     console.error("SQL error:", err);
// //     res.status(500).send("Server error");
// //   }
// // });


// // API to get package list
// app.get("/api/package-list", (req, res) => {
//   const packages = [
//     { PackageID: "1", PackageName: "Tirupati 1 Night / 1 Days Dharma Darshan Package" },
//     { PackageID: "2", PackageName: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights" }
//   ];
//   res.json(packages);
// });

// // ------------------- FEEDBACK API -------------------
// // app.post("/api/submit-feedback", async (req, res) => {
// //   try {
// //     const { name, contactNo, emailId, userFeedback, packageId } = req.body;
// //     if (!name || !contactNo || !emailId || !userFeedback || !packageId)
// //       return res.status(400).json({ error: "All fields are required" });

// //     const query = `
// //       EXEC sp_UserFeedback
// //         @Flag='I',
// //         @Name='${name}',
// //         @ContactNo='${contactNo}',
// //         @EmailId='${emailId}',
// //         @UserFeedback='${userFeedback}',
// //         @PackageId=${packageId},
// //         @CreatedBy=0
// //     `;
// //     await queryAsync(query);
// //     res.json({ success: true, message: "Thank you for submitting, we will get back to you soon!" });
// //   } catch (err) {
// //     console.error("SQL error:", err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // });
// //the above code isfor db 

// // API endpoint to receive contact form submissions
// app.post("/api/submit-feedback", async (req, res) => {
//   const { name, emailId, contactNo, userFeedback, packageId } = req.body;

//   if (!name || !emailId || !contactNo || !userFeedback || !packageId) {
//     return res.status(400).json({ success: false, message: "All fields are required" });
//   }

//   // Construct professional email body
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER, // receive submissions in your Gmail
//     subject: `New Contact Form Submission from ${name}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <h2 style="color: #6B4E3D;">New Contact Form Submission Received</h2>
//         <p>Dear Team,</p>
//         <p>We have received a new contact form submission from a visitor on the website. Below are the details:</p>
//         <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${emailId}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${contactNo}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Selected Package:</strong></td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${packageId}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Feedback / Message:</strong></td>
//             <td style="padding: 8px; border: 1px solid #ddd;">${userFeedback}</td>
//           </tr>
//         </table>
//         <p style="margin-top: 15px;">Please reach out to the visitor at the earliest convenience.</p>
//         <p>Best Regards,<br/>Sanchar6T Team</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return res.status(200).json({ success: true, message: "Feedback submitted successfully" });
//   } catch (err) {
//     console.error("Error sending email:", err);
//     return res.status(500).json({ success: false, message: "Server error, could not send email" });
//   }
// });

// // SPA fallback: serve index.html for all other routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(process.cwd(), "public", "index.html"));
// });
// // ------------------- START SERVER -------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
// the above is going good


// server.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const SibApiV3Sdk = require('@sendinblue/client');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// ✅ Mock API to return package list
app.get("/api/package-list", (req, res) => {
  const packages = [
    { PackageID: 1, PackageName: "  APTDC Tirupati 1 Night / 1 Days Dharma Darshan Package" },
    { PackageID: 2, PackageName: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights" },
    
  ];
  res.json(packages);
});

// ✅ Email submission endpoint
// app.post("/api/submit-feedback", async (req, res) => {
//   const { name, contactNo, emailId, userFeedback, packageId } = req.body;

//   if (!name || !contactNo || !emailId || !userFeedback || !packageId) {
//     return res.status(400).json({ success: false, message: "Missing required fields" });
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS.replace(/\s/g, ""), // remove accidental spaces
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: process.env.EMAIL_USER, // send to yourself (admin inbox)
//       subject: `📩 New Inquiry from ${name} - Package ID ${packageId}`,
//       html: `
//         <h2>New Contact Form Submission</h2>
//         <p><b>Name:</b> ${name}</p>
//         <p><b>Email:</b> ${emailId}</p>
//         <p><b>Phone:</b> ${contactNo}</p>
//         <p><b>Selected Package ID:</b> ${packageId}</p>
//         <p><b>Message:</b></p>
//         <p>${userFeedback}</p>
//         <hr>
//         <p>🕉️ Sent via Tirupati Package Tours Contact Form</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ success: true, message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Email send failed:", error);
//     res.status(500).json({ success: false, message: "Error sending email" });
//   }
// });

// Gmail SMTP setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sanchar6t@gmail.com", // Your Gmail address
    pass: "osmkddsswavncyim",   // Your Gmail App Password
  },
});

// API endpoint for contact form submission
app.post("/api/submit-feedback", async (req, res) => {
  const { name, emailId, contactNo, userFeedback, packageId } = req.body;

  // Validate required fields
  if (!name || !emailId || !contactNo || !userFeedback || !packageId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const mailOptions = {
    from: `"Website Contact" <sanchar6t@gmail.com>`,
    to: "sanchar6t@gmail.com", // Where you want to receive submissions
    subject: `New Contact Form Submission - Package ID: ${packageId}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${emailId}</p>
      <p><strong>Phone:</strong> ${contactNo}</p>
      <p><strong>Selected Package ID:</strong> ${packageId}</p>
      <p><strong>Feedback/Message:</strong><br/>${userFeedback}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});



// ✅ Feedback submission via WhatsApp
// app.post("/api/submit-feedback", (req, res) => {
//   const { name, contactNo, emailId, userFeedback, packageId } = req.body;

//   if (!name || !contactNo || !emailId || !userFeedback || !packageId) {
//     return res.status(400).json({ success: false, message: "Missing required fields" });
//   }

//   try {
//     // Create WhatsApp message link
//     const adminWhatsAppNumber = "919964060505"; // Replace with your number with country code
//     const message = `
// New Inquiry:
// Name: ${name}
// Email: ${emailId}
// Phone: ${contactNo}
// Package ID: ${packageId}
// Message: ${userFeedback}
// `;

//     // URL encode the message
//     const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;

//     console.log(`📩 Feedback received from ${name}, open WhatsApp link: ${whatsappUrl}`);

//     res.json({
//       success: true,
//       message: "Feedback ready to send via WhatsApp",
//       whatsappUrl
//     });

//   } catch (error) {
//     console.error("❌ WhatsApp message preparation failed:", error);
//     res.status(500).json({ success: false, message: "Error preparing WhatsApp message" });
//   }
// });




const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);
