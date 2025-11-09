

// // the below code is same  as sanchar6t code

// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
//  const sql = require("mssql/msnodesqlv8");
// const nodemailer = require("nodemailer");
// const bcrypt = require("bcryptjs");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// // ------------------- DATABASE CONFIG -------------------
// const dbConfig = {
//   server: process.env.DB_SERVER,
//   database: process.env.DB_NAME,
//   options: {
//     trustedConnection: true,
//     trustServerCertificate: true,
//   },
//   driver: "msnodesqlv8",
// };

// app.get("/", (req, res) => {
//   res.send("✅ Server is running");
// });

// // ------------------- OTP SETUP -------------------
// let otpStore = {}; // Use Redis or DB in production

// // ------------------- HELPERS -------------------
// function safeDate(dateStr) {
//   if (!dateStr) return null;
//   const d = new Date(dateStr);
//   return isNaN(d.getTime()) ? null : d;
// }

// // ------------------- ROUTES -------------------

// // Send OTP
// app.post("/api/send-otp", async (req, res) => {
//   const { email, name } = req.body;
//   if (!email) return res.status(400).json({ error: "Email is required" });

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   otpStore[email] = otp;

//   try {
//     await transporter.sendMail({
//       from: `"Sanchar6T Support" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your One-Time Password (OTP) Verification",
//       html: `
//         <div style="font-family: Arial, sans-serif; color: #333;">
//           <h2>Hello ${name || "User"},</h2>
//           <p>Your OTP is:</p>
//           <h1 style="letter-spacing: 3px; color: #3D85C6;">${otp}</h1>
//           <p>Valid for <b>5 minutes</b>.</p>
//         </div>
//       `,
//     });
//     console.log(`OTP sent to ${email}: ${otp}`);
//     res.json({ success: true, message: "OTP sent" });
//   } catch (err) {
//     console.error("OTP error:", err);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// });

// // Itinerary generation
// app.post("/itinerary", async (req, res) => {
//   try {
//     const { city, days } = req.body;
//     const prompt = `Plan a ${days}-day itinerary for ${city}. Include timings, places, meals, transport, fun activities.`;

//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: "You are a travel itinerary planner." },
//           { role: "user", content: prompt },
//         ],
//         max_tokens: 1200,
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     let itineraryText = response.data.choices[0].message.content;
//     itineraryText = itineraryText.replace(/#+\s?/g, "").replace(/\*\*/g, "");
//     itineraryText = itineraryText.replace(/(Day\s*\d+)/gi, `<h3 style="color:#226cb2;">$1</h3>`);

//     res.json({ itinerary: itineraryText });
//   } catch (err) {
//     console.error(err.message, err.response?.data);
//     res.status(500).json({ error: "Failed to generate itinerary" });
//   }
// });

// // ------------------- BUS BOOKING DETAILS -------------------

// // Get all bus booking details
// app.get("/api/bus-booking-details", async (req, res) => {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request().query(`
//       SELECT TOP 1000 *
//       FROM [dbo].[BusBookingDetails]
//       ORDER BY BusBooKingDetailID
//     `);
//     res.json(result.recordset);
//   } catch (err) {
//     console.error("SQL GET error:", err);
//     res.status(500).json({ error: "Failed to fetch bus booking details" });
//   }
// });

// // Get bus booking detail by ID
// app.get("/api/bus-booking-details/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//       .input("BusBooKingDetailID", sql.Int, id)
//       .query("SELECT * FROM [dbo].[BusBookingDetails] WHERE BusBooKingDetailID = @BusBooKingDetailID");
//     if (!result.recordset.length) return res.status(404).json({ message: "Not found" });
//     res.json(result.recordset[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch bus booking detail" });
//   }
// });

// // Insert bus booking detail
// app.post("/api/bus-booking-details", async (req, res) => {
//   try {
//     const { OperatorID, PackageID, WkEndSeatPrice, WkDaySeatPrice, DepartureTime, Arrivaltime, Status, CreatedBy } = req.body;
//     const pool = await sql.connect(dbConfig);

//     await pool.request()
//       .input("Flag", sql.Char(1), "I")
//       .input("BusBooKingDetailID", sql.Int, 0)
//       .input("OperatorID", sql.Int, OperatorID)
//       .input("PackageID", sql.Int, PackageID)
//       .input("WkEndSeatPrice", sql.Numeric(18,0), WkEndSeatPrice)
//       .input("WkDaySeatPrice", sql.Numeric(18,0), WkDaySeatPrice)
//       .input("DepartureTime", sql.DateTime, safeDate(DepartureTime))
//       .input("Arrivaltime", sql.DateTime, safeDate(Arrivaltime))
//       .input("AvaialbleSeats", sql.DateTime, null)
//       .input("Status", sql.VarChar(250), Status)
//       .input("CreatedBy", sql.Int, CreatedBy)
//       .execute("sp_BusBookingDetails");

//     res.status(201).json({ message: "Bus booking detail created successfully" });
//   } catch (err) {
//     console.error("SQL INSERT error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get all buses with amenities
// app.get("/api/bus-details", async (req, res) => {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request().query(`
//       SELECT 
//         b.[BusBooKingDetailID],
//         b.[OperatorID],
//         b.[PackageID],
//         b.[WkEndSeatPrice],
//         b.[WkDaySeatPrice],
//         b.[DepartureTime],
//         b.[Arrivaltime],
//         b.[Status],
//         b.[PackageName],
//         b.[BusNo],
//         b.[BusSeats],
//         b.[BusType],
//         b.[FemaleSeatNo],
//         a.[AMName]
//       FROM [dbo].[vw_BusBookingDetails] b
//       LEFT JOIN [dbo].[vw_BusAmenities] a
//         ON b.OperatorID = a.BusOperatorID
//     `);

//     const buses = {};
//     result.recordset.forEach(row => {
//       if (!buses[row.BusBooKingDetailID]) {
//         buses[row.BusBooKingDetailID] = { ...row, amenities: [] };
//       }
//       if (row.AMName) buses[row.BusBooKingDetailID].amenities.push(row.AMName);
//     });

//     res.json(Object.values(buses));
//   } catch (err) {
//     console.error("SQL error:", err);
//     res.status(500).json({ error: "Failed to fetch bus details" });
//   }
// });

// /////////////////////////////////////////


// // ------------------- below are apis for seat blocking after payment is sucessful -------------------

// /// =======================
// // Reduce Bus Seats API
// // =======================
// /// ------------------- BUS SEAT MANAGEMENT APIS -------------------

// /// ✅ Reduce available seats after payment success
// app.post("/api/bus/reduceSeat", async (req, res) => {
//   try {
//     const { BusOperatorID, BookedSeats } = req.body;

//     if (!BusOperatorID || !BookedSeats) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const pool = await sql.connect(dbConfig);

//     // 1️⃣ Fetch current seats
//     const current = await pool.request()
//       .input("BusOperatorID", sql.Int, BusOperatorID)
//       .query(`SELECT BusSeats FROM BusOperator WHERE BusOperatorID = @BusOperatorID`);

//     if (current.recordset.length === 0) {
//       return res.status(404).json({ message: "Bus not found" });
//     }

//     const currentSeats = current.recordset[0].BusSeats;
//     const remainingSeats = Math.max(currentSeats - BookedSeats, 0);

//     // 2️⃣ Update seat count
//     await pool.request()
//       .input("BusOperatorID", sql.Int, BusOperatorID)
//       .input("BusSeats", sql.Int, remainingSeats)
//       .query(`
//         UPDATE BusOperator
//         SET BusSeats = @BusSeats
//         WHERE BusOperatorID = @BusOperatorID
//       `);

//     res.status(200).json({
//       success: true,
//       message: `✅ Reduced ${BookedSeats} seat(s) successfully.`,
//       remainingSeats,
//     });
//   } catch (error) {
//     console.error("❌ Error reducing seats:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });


// // ✅ Get remaining seats for a bus
// app.get("/api/bus/bookedSeats", async (req, res) => {
//   try {
//     const { busId } = req.query;
//     if (!busId) return res.status(400).json({ message: "Bus ID is required" });

//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request()
//       .input("BusOperatorID", sql.Int, busId)
//       .query(`SELECT BusSeats FROM BusOperator WHERE BusOperatorID = @BusOperatorID`);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ message: "Bus not found" });
//     }

//     const remainingSeats = result.recordset[0].BusSeats;

//     res.status(200).json({
//       success: true,
//       remainingSeats,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching booked seats:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });


// // ✅ Get seat layout + remaining seats + price dynamically
// app.get("/api/bus/seatLayout", async (req, res) => {
//   try {
//     const { busId } = req.query;
//     if (!busId) return res.status(400).json({ message: "Bus ID is required" });

//     const pool = await sql.connect(dbConfig);

//     // 1️⃣ Fetch operator info
//     const result = await pool.request()
//       .input("BusOperatorID", sql.Int, busId)
//       .query(`
//         SELECT 
//           b.BusSeats,
//           d.WkEndSeatPrice,
//           d.WkDaySeatPrice,
//           b.BusType
//         FROM BusOperator b
//         LEFT JOIN BusBookingDetails d ON b.BusOperatorID = d.OperatorID
//         WHERE b.BusOperatorID = @BusOperatorID
//       `);

//     if (result.recordset.length === 0)
//       return res.status(404).json({ message: "Bus not found" });

//     const bus = result.recordset[0];

//     // 2️⃣ Get all booked seats from BusBookingSeat table
//     const bookedRes = await pool.request()
//       .input("BusOperatorID", sql.Int, busId)
//       .query(`SELECT SeatNo FROM BusBookingSeat WHERE BusOperatorID = @BusOperatorID`);

//     const bookedSeats = bookedRes.recordset.map(r => r.SeatNo);

//     // 3️⃣ Generate seat IDs (example L1-L18, U1-U18)
//     const allSeats = [];
//     for (let i = 1; i <= 18; i++) allSeats.push(`L${i}`);
//     for (let i = 1; i <= 18; i++) allSeats.push(`U${i}`);

//     const today = new Date();
//     const day = today.getDay(); // 0=Sun, 6=Sat
//     const price = (day === 0 || day === 6)
//       ? bus.WkEndSeatPrice
//       : bus.WkDaySeatPrice;

//     res.status(200).json({
//       success: true,
//       busId,
//       seatLayout: allSeats,
//       bookedSeats,
//       remainingSeats: bus.BusSeats,
//       price,
//       busType: bus.BusType
//     });
//   } catch (error) {
//     console.error("❌ Error fetching seat layout:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });


// // ✅ Updated /api/bus/bookedSeats endpoint
// app.get("/api/bus/bookedSeats", async (req, res) => {
//   try {
//     const busId = req.query.busId;
//     if (!busId)
//       return res.status(400).json({ success: false, message: "busId is required" });

//     const pool = await sql.connect(dbConfig);
//     const result = await pool
//       .request()
//       .input("BusOperatorID", sql.Int, busId)
//       .query(`SELECT SeatNo FROM BusBookingSeat WHERE BusOperatorID = @BusOperatorID`);

//     const bookedSeats = result.recordset.map(r => r.SeatNo);
//     res.json({ success: true, bookedSeats });
//   } catch (err) {
//     console.error("❌ Error fetching booked seats:", err);
//     res.status(500).json({ success: false, message: "Error fetching seats" });
//   }
// });

// // ✅ New route to sync remaining seats
// app.post("/api/bus/syncSeats", async (req, res) => {
//   try {
//     const { BusOperatorID } = req.body;
//     const pool = await sql.connect(dbConfig);

//     // Count total booked seats
//     const countResult = await pool.request()
//       .input("BusOperatorID", sql.Int, BusOperatorID)
//       .query(`SELECT COUNT(*) AS TotalBooked FROM BusBookingSeat WHERE BusOperatorID = @BusOperatorID`);

//     const totalBooked = countResult.recordset[0].TotalBooked;

//     // Update BusOperator.BusSeats (remaining seats)
//     await pool.request()
//       .input("BusOperatorID", sql.Int, BusOperatorID)
//       .query(`
//         UPDATE BusOperator
//         SET BusSeats = TotalSeats - ${totalBooked}
//         WHERE BusOperatorID = @BusOperatorID
//       `);

//     res.json({ success: true, message: "Seat count synced successfully" });
//   } catch (error) {
//     console.error("❌ Error syncing seats:", error);
//     res.status(500).json({ success: false, message: "Error syncing seats" });
//   }
// });


// // Book a seat
// app.post("/api/bus-booking-seat", async (req, res) => {
//   try {
//     const payload = req.body;
//     const pool = await sql.connect(dbConfig);
//     const proc = "dbo.sp_BusBookingSeat";
//     const saveFlag = payload.SavePassengerDetails === "Y" ? "Yes" : "No";

//     const request = pool.request();
//     request.input("Flag", sql.Char(1), "I");
//     request.input("BusBookingSeatID", sql.Int, payload.BusBookingSeatID ?? 0);
//     request.input("BusBookingDetailsID", sql.Int, payload.BusBookingDetailsID);
//     request.input("BusOperatorID", sql.Int, payload.BusOperatorID);
//     request.input("UserID", sql.Int, payload.UserID ?? 0);
//     request.input("ForSelf", sql.Bit, payload.ForSelf ? 1 : 0);
//     request.input("IsPrimary", sql.Int, payload.IsPrimary ?? 1);
//     request.input("SeatNo", sql.NVarChar(50), payload.SeatNo ?? null);
//     request.input("FirstName", sql.VarChar(250), payload.FirstName ?? null);
//     request.input("MiddleName", sql.VarChar(250), payload.MiddleName ?? null);
//     request.input("LastName", sql.VarChar(250), payload.LastName ?? null);
//     request.input("Email", sql.VarChar(150), payload.Email ?? null);
//     request.input("ContactNo", sql.VarChar(50), payload.ContactNo ?? null);
//     request.input("Gender", sql.VarChar(50), payload.Gender ?? null);
//     request.input("AadharNo", sql.VarChar(20), payload.AadharNo ?? null);
//     request.input("PancardNo", sql.VarChar(20), payload.PancardNo ?? null);
//     request.input("BloodGroup", sql.VarChar(10), payload.BloodGroup ?? null);
//     request.input("DOB", sql.DateTime, safeDate(payload.DOB));
//     request.input("FoodPref", sql.VarChar(100), payload.FoodPref ?? null);
//     request.input("Disabled", sql.Bit, payload.Disabled ? 1 : 0);
//     request.input("Pregnant", sql.Bit, payload.Pregnant ? 1 : 0);
//     request.input("RegisteredCompanyNumber", sql.VarChar(50), payload.RegisteredCompanyNumber ?? null);
//     request.input("RegisteredCompanyName", sql.VarChar(50), payload.RegisteredCompanyName ?? null);
//     request.input("DrivingLicence", sql.VarChar(100), payload.DrivingLicence ?? null);
//     request.input("PassportNo", sql.VarChar(100), payload.PassportNo ?? null);
//     request.input("RationCard", sql.VarChar(100), payload.RationCard ?? null);
//     request.input("VoterID", sql.VarChar(100), payload.VoterID ?? null);
//     request.input("Others", sql.VarChar(500), payload.Others ?? null);
//     request.input("NRI", sql.Bit, payload.NRI ? 1 : 0);
//     request.input("CreatedBy", sql.Int, payload.CreatedBy ?? 1);
//     request.input("SavePassengerDetails", sql.VarChar(50), saveFlag);

//     const result = await request.execute(proc);
//     res.status(201).json({ message: "Booking saved successfully", result: result.recordset });
//   } catch (err) {
//     console.error("SQL INSERT error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ------------------- USER SIGNUP & LOGIN -------------------



//  app.get("/api/package-list", (req, res) => {
//   const packages = [
//     { PackageID: "1", PackageName: "Tirupati 1 Night / 1 Days Dharma Darshan Package" },
//     { PackageID: "2", PackageName: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights" }
//   ];
//   res.json(packages);
// });
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



// app.get("/api/busBoardingCounts", async (req, res) => {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request().query(`
//       SELECT 
//           bo.BusOperatorID,
//           COUNT(bbp.BusBoardingPointID) AS NumBoardingPoints
//       FROM BusOperator bo
//       LEFT JOIN BusBookingSeat bbs 
//           ON bbs.BusOperatorID = bo.BusOperatorID
//       LEFT JOIN BusBoardingPoint bbp
//           ON bbp.BusBooKingDetailID = bbs.BusBookingDetailsID
//       GROUP BY bo.BusOperatorID;
//     `);
//     res.json(result.recordset);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database error", details: err.message });
//   } finally {
//     sql.close();
//   }
// });



// // ------------------- START SERVER -------------------
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
















//////////////////////////////////////////////////


const express = require("express");
const sql = require("mssql");
const moment = require("moment-timezone");
 const cors = require("cors");
const axios = require("axios");

 const nodemailer = require("nodemailer");
 const bcrypt = require("bcryptjs");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;




const dbConfig = {
  user: "sqladmin",
  password: "Sanchar6t1",
  server: "sqldatabase01.cx204wkac5t2.ap-south-1.rds.amazonaws.com",
  port: 1433,
  database: "Sanchar6T_Dev",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};


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



// ✅ 1. Test database connection
app.get("/api/test-connection", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT GETDATE() AS CurrentTime;");
    res.json({
      success: true,
      message: "Connected successfully to RDS SQL Server!",
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Connection failed:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    sql.close();
  }
});

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

// ------------------- OTP SETUP -------------------
let otpStore = {}; // Use Redis or DB in production

// ------------------- HELPERS -------------------
function safeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ------------------- ROUTES -------------------

// Send OTP
app.post("/api/send-otp", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: `"Sanchar6T Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP) Verification",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hello ${name || "User"},</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 3px; color: #3D85C6;">${otp}</h1>
          <p>Valid for <b>5 minutes</b>.</p>
        </div>
      `,
    });
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Itinerary generation
app.post("/itinerary", async (req, res) => {
  try {
    const { city, days } = req.body;
    const prompt = `Plan a ${days}-day itinerary for ${city}. Include timings, places, meals, transport, fun activities.`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a travel itinerary planner." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let itineraryText = response.data.choices[0].message.content;
    itineraryText = itineraryText.replace(/#+\s?/g, "").replace(/\*\*/g, "");
    itineraryText = itineraryText.replace(/(Day\s*\d+)/gi, `<h3 style="color:#226cb2;">$1</h3>`);

    res.json({ itinerary: itineraryText });
  } catch (err) {
    console.error(err.message, err.response?.data);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
});

// ------------------- BUS BOOKING DETAILS -------------------

// Get bus booking detail by ID
app.get("/api/bus-booking-details/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("BusBooKingDetailID", sql.Int, id)
      .query("SELECT * FROM [dbo].[BusBookingDetails] WHERE BusBooKingDetailID = @BusBooKingDetailID");
    if (!result.recordset.length) return res.status(404).json({ message: "Not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bus booking detail" });
  }
});

// Insert bus booking detail
app.post("/api/bus-booking-details", async (req, res) => {
  try {
    const { OperatorID, PackageID, WkEndSeatPrice, WkDaySeatPrice, DepartureTime, Arrivaltime, Status, CreatedBy } = req.body;
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("Flag", sql.Char(1), "I")
      .input("BusBooKingDetailID", sql.Int, 0)
      .input("OperatorID", sql.Int, OperatorID)
      .input("PackageID", sql.Int, PackageID)
      .input("WkEndSeatPrice", sql.Numeric(18,0), WkEndSeatPrice)
      .input("WkDaySeatPrice", sql.Numeric(18,0), WkDaySeatPrice)
      .input("DepartureTime", sql.DateTime, safeDate(DepartureTime))
      .input("Arrivaltime", sql.DateTime, safeDate(Arrivaltime))
      .input("AvaialbleSeats", sql.DateTime, null)
      .input("Status", sql.VarChar(250), Status)
      .input("CreatedBy", sql.Int, CreatedBy)
      .execute("sp_BusBookingDetails");

    res.status(201).json({ message: "Bus booking detail created successfully" });
  } catch (err) {
    console.error("SQL INSERT error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/bus-details", async (req, res) => {
  try {
    const { packageId } = req.query;
    let pool = await sql.connect(dbConfig);
    let request = pool.request();

    // Base query
    let query = `
      SELECT 
        b.[BusBooKingDetailID],
        b.[OperatorID],
        b.[PackageID],
        b.[WkEndSeatPrice],
        b.[WkDaySeatPrice],
        b.[DepartureTime],
        b.[Arrivaltime],
        b.[Status],
        b.[PackageName],
        b.[BusNo],
        b.[BusSeats],
        b.[BusType],
        b.[FemaleSeatNo],
        a.[AMName]
      FROM [dbo].[vw_BusBookingDetails] b
      LEFT JOIN [dbo].[vw_BusAmenities] a ON b.OperatorID = a.BusOperatorID
      LEFT JOIN [dbo].[vw_BusOperator] o ON b.OperatorID = o.BusOperatorID
      WHERE o.[SourceSystem] = 'TirupatiPackage'
    `;

    // Optional filter
    if (packageId) {
      query += " AND b.[PackageID] = @packageId";
      request.input("packageId", sql.Int, packageId);
    }

    // Add ordering
    query += " ORDER BY b.DepartureTime";
    console.log("Executing query:", query);

    const result = await request.query(query);

    const buses = {};
    result.recordset.forEach(row => {
      if (!buses[row.BusBooKingDetailID]) {
        buses[row.BusBooKingDetailID] = {
          BusBooKingDetailID: row.BusBooKingDetailID,
          OperatorID: row.OperatorID,
          PackageID: row.PackageID,
          WkEndSeatPrice: row.WkEndSeatPrice,
          WkDaySeatPrice: row.WkDaySeatPrice,
          DepartureTime: row.DepartureTime,
          Arrivaltime: row.Arrivaltime,
          Status: row.Status,
          PackageName: row.PackageName,
          BusNo: row.BusNo,
          BusSeats: row.BusSeats,
          BusType: row.BusType,
          FemaleSeatNo: row.FemaleSeatNo,
          amenities: []
        };
      }
      if (row.AMName) buses[row.BusBooKingDetailID].amenities.push(row.AMName);
    });

    // ✅ Maintain order by DepartureTime
    const busArray = Object.values(buses).sort(
      (a, b) => new Date(a.DepartureTime) - new Date(b.DepartureTime)
    );

    res.json(busArray);
  } catch (err) {
    console.error("Error fetching bus details:", err);
    res.status(500).json({ error: "Server error fetching bus details" });
  }
});

app.get("/bus-booking-details/by-operator-package/:operatorId/:packageId", async (req, res) => {
  const { operatorId, packageId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("operatorId", sql.Int, operatorId)
      .input("packageId", sql.Int, packageId)
      .query(`
        SELECT TOP 1 BusBooKingDetailID 
        FROM BusBookingDetails
        WHERE OperatorID = @operatorId AND PackageID = @packageId
        ORDER BY CreatedDt DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Not found", busBookingDetailId: null });
    }

    res.json({ busBookingDetailId: result.recordset[0].BusBooKingDetailID });
  } catch (err) {
    console.error("Error fetching BusBookingDetailID", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/api/bus/seatLayout", async (req, res) => {
  try {
    const { busId, journeyDate } = req.query;

    if (!busId || !journeyDate) {
      return res.status(400).json({
        success: false,
        message: "Bus ID and Journey Date are required",
      });
    }

    const pool = await sql.connect(dbConfig);

    // ✅ Step 1: Auto-unblock past-dated bookings
    await pool.request().query(`
      UPDATE BusBookingSeat
      SET LockStatus = 'Unblocked',
          Status = CASE WHEN PaymentStatus = 'Pending' THEN 'Cancelled' ELSE Status END
      WHERE JourneyDate < CAST(GETDATE() AS DATE)
        AND LockStatus != 'Unblocked';
    `);


    // ✅ Step 2: Fetch seat layout for the selected bus & date
    const result = await pool.request()
      .input("BusId", sql.Int, busId)
      .input("JourneyDate", sql.Date, journeyDate)
      .query(`
        SELECT 
  bbd.WkDaySeatPrice AS weekday,
  bbd.WkEndSeatPrice AS weekend,

  (SELECT COUNT(*) 
   FROM BusBookingSeat bbs 
   WHERE bbs.BusBookingDetailsID = @BusId
     AND bbs.Status = 'Booked'
     AND CAST(bbs.JourneyDate AS DATE) = CAST(@JourneyDate AS DATE)
  ) AS bookedCount,

  (bo.BusSeats 
   - (
       SELECT COUNT(*) 
       FROM BusBookingSeat bbs 
       WHERE bbs.BusBookingDetailsID = @BusId
         AND bbs.Status = 'Booked'
         AND CAST(bbs.JourneyDate AS DATE) = CAST(@JourneyDate AS DATE)
     )
   - (
       SELECT COUNT(*) 
       FROM SeatLock sl 
       WHERE sl.BusBookingDetailsID = @BusId
         AND CAST(sl.JourneyDate AS DATE) = CAST(@JourneyDate AS DATE)
         AND sl.ExpiresAt > GETUTCDATE()
     )
  ) AS remainingSeats,

  (SELECT STRING_AGG(SeatNo, ',') 
   FROM BusBookingSeat bbs 
   WHERE bbs.BusBookingDetailsID = @BusId
     AND bbs.Status = 'Booked'
     AND CAST(bbs.JourneyDate AS DATE) = CAST(@JourneyDate AS DATE)
  ) AS bookedSeats,

  (SELECT STRING_AGG(SeatNo, ',') 
   FROM SeatLock sl 
   WHERE sl.BusBookingDetailsID = @BusId
     AND CAST(sl.JourneyDate AS DATE) = CAST(@JourneyDate AS DATE)
     AND sl.ExpiresAt > GETUTCDATE()
  ) AS lockedSeats,

  bo.FemaleSeatNo
FROM BusOperator bo
JOIN BusBookingDetails bbd ON bo.BusOperatorID = bbd.OperatorID
WHERE bbd.BusBookingDetailID = @BusId;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ success: false, message: "Bus not found" });
    }

    const data = result.recordset[0];

    const bookedSeats = data.bookedSeats
      ? data.bookedSeats.split(",").map((s) => s.trim())
      : [];

    const lockedSeats = data.lockedSeats
      ? data.lockedSeats.split(",").map((s) => s.trim())
      : [];

    res.json({
      success: true,
      price: {
        weekday: Number(data.weekday) || 0,
        weekend: Number(data.weekend) || 0,
      },
      bookedSeats,
      lockedSeats,
      remainingSeats: data.remainingSeats || 0,
      femaleSeatNo: data.FemaleSeatNo || null,
    });
    console.log("🚀 Checking Seat Layout:", { busId, journeyDate });

  } catch (error) {
    console.error("❌ Error in /api/bus/seatLayout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
////////////////////////////////
// app.post("/api/bus-booking-seat", async (req, res) => {
//   try {
//     const payload = req.body;

//     // Validate JourneyDate
//     if (!payload.JourneyDate) {
//       return res.status(400).json({ success: false, message: "JourneyDate is required" });
//     }

//     const pool = await sql.connect(dbConfig);
//     const proc = "dbo.sp_BusBookingSeat";
//     const saveFlag = payload.SavePassengerDetails === "Y" ? "Yes" : "No";

//     const seats = Array.isArray(payload.SeatNo) ? payload.SeatNo : [payload.SeatNo];

//     //Date helper – trusts YYYY-MM-DD, avoids UTC conversion
//     const safeDate = (date) => {
//       if (!date) return null;
//       if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
//         return date; // already normalized by frontend
//       }
//       const d = new Date(date);
//       if (isNaN(d.getTime())) return null;
//       const yyyy = d.getFullYear();
//       const mm = String(d.getMonth() + 1).padStart(2, "0");
//       const dd = String(d.getDate()).padStart(2, "0");
//       return `${yyyy}-${mm}-${dd}`;
//     };

//     for (const seat of seats) {
//       const request = pool.request();
//       request.input("Flag", sql.Char(1), "I");
//       request.input("BusBookingSeatID", sql.Int, payload.BusBookingSeatID ?? 0);
//       request.input("BusBookingDetailsID", sql.Int, payload.BusBookingDetailsID);
//       request.input("BusOperatorID", sql.Int, payload.BusOperatorID);

//       //If user clicked NO (PassengerID = 0) → send NULL to DB
//       request.input("UserID", sql.Int, payload.UserID === 0 ? null : payload.UserID);

//       request.input("ForSelf", sql.Bit, payload.ForSelf ? 1 : 0);
//       request.input("IsPrimary", sql.Int, payload.IsPrimary ?? 1);
//       request.input("SeatNo", sql.NVarChar(50), seat);
//       request.input("FirstName", sql.VarChar(250), payload.FirstName ?? null);
//       request.input("MiddleName", sql.VarChar(250), payload.MiddleName ?? null);
//       request.input("LastName", sql.VarChar(250), payload.LastName ?? null);
//       request.input("Email", sql.VarChar(150), payload.Email ?? null);
//       request.input("ContactNo", sql.VarChar(50), payload.ContactNo ?? null);
//       request.input("Gender", sql.VarChar(50), payload.Gender ?? null);
//       request.input("AadharNo", sql.VarChar(20), payload.AadharNo ?? null);
//       request.input("PancardNo", sql.VarChar(20), payload.PancardNo ?? null);
//       request.input("BloodGroup", sql.VarChar(10), payload.BloodGroup ?? null);
//       request.input("DOB", sql.DateTime, safeDate(payload.DOB));
//       request.input("FoodPref", sql.VarChar(100), payload.FoodPref ?? null);
//       request.input("Disabled", sql.Bit, payload.Disabled ? 1 : 0);
//       request.input("Pregnant", sql.Bit, payload.Pregnant ? 1 : 0);
//       request.input("RegisteredCompanyNumber", sql.VarChar(50), payload.RegisteredCompanyNumber ?? null);
//       request.input("RegisteredCompanyName", sql.VarChar(50), payload.RegisteredCompanyName ?? null);
//       request.input("DrivingLicence", sql.VarChar(100), payload.DrivingLicence ?? null);
//       request.input("PassportNo", sql.VarChar(100), payload.PassportNo ?? null);
//       request.input("RationCard", sql.VarChar(100), payload.RationCard ?? null);
//       request.input("VoterID", sql.VarChar(100), payload.VoterID ?? null);
//       request.input("Others", sql.VarChar(500), payload.Others ?? null);
//       request.input("NRI", sql.Bit, payload.NRI ? 1 : 0);
//       request.input("CreatedBy", sql.Int, payload.CreatedBy ?? 1);
//       request.input("SavePassengerDetails", sql.VarChar(50), saveFlag);

      
//       request.input("JourneyDate", sql.Date, payload.JourneyDate);

//       await request.execute(proc);

//       // ==========================================================
//       // ✅ NEW ADDITION: Manage SeatLock table & Booking Status by JourneyDate
//       // ==========================================================

//       // 1️⃣ Remove temporary lock for this seat on the same journey date
//       const unlockRequest = pool.request();
//       unlockRequest.input("BusOperatorID", sql.Int, payload.BusOperatorID);
//       unlockRequest.input("SeatNo", sql.VarChar(50), seat);
//       unlockRequest.input("JourneyDate", sql.Date, payload.JourneyDate);
//       await unlockRequest.query(`
//         DELETE FROM SeatLock
//         WHERE BusOperatorID = @BusOperatorID
//           AND SeatNo = @SeatNo
//           AND CAST(JourneyDate AS DATE) = @JourneyDate
//       `);

//       // 2️⃣ Update booking status to "Booked" and mark PaymentStatus as "Pending" for this date
//       const updateRequest = pool.request();
//       updateRequest.input("BusOperatorID", sql.Int, payload.BusOperatorID);
//       updateRequest.input("SeatNo", sql.VarChar(50), seat);
//       updateRequest.input("JourneyDate", sql.Date, payload.JourneyDate);
//       await updateRequest.query(`
//         UPDATE BusBookingSeat
//         SET Status = 'Booked',
//             PaymentStatus = 'Pending',
//             LockStatus = 'Unlocked'
//         WHERE BusOperatorID = @BusOperatorID
//           AND SeatNo = @SeatNo
//           AND CAST(JourneyDate AS DATE) = @JourneyDate
//       `);
//     }

//     res.status(201).json({ message: "✅ Booking saved successfully for given JourneyDate" });
//   } catch (err) {
//     console.error("❌ SQL INSERT error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
//////////////////////////////////////
app.post("/api/bus-booking-seat", async (req, res) => {
  try {
    const payload = req.body;

    // Validate JourneyDate
    if (!payload.JourneyDate) {
      return res
        .status(400)
        .json({ success: false, message: "JourneyDate is required" });
    }

    const pool = await sql.connect(dbConfig);
    const proc = "dbo.sp_BusBookingSeat";
    const saveFlag = payload.SavePassengerDetails === "Y" ? "Yes" : "No";

    const seats = Array.isArray(payload.SeatNo) ? payload.SeatNo : [payload.SeatNo];

    // ✅ Helper to normalize date
    const safeDate = (date) => {
      if (!date) return null;
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date; // already normalized by frontend
      }
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    // ============================================
    // ✅ Insert for each seat
    // ============================================
    let lastInsertedSeatId = null;

    for (const seat of seats) {
      const request = pool.request();

      request.input("Flag", sql.Char(1), "I");
      request.input("BusBookingSeatID", sql.Int, payload.BusBookingSeatID ?? 0);
      request.input("BusBookingDetailsID", sql.Int, payload.BusBookingDetailsID);
      request.input("BusOperatorID", sql.Int, payload.BusOperatorID);

      //If user clicked NO (PassengerID = 0) → send NULL to DB
      request.input("UserID", sql.Int, payload.UserID === 0 ? null : payload.UserID);

      request.input("ForSelf", sql.Bit, payload.ForSelf ? 1 : 0);
      request.input("IsPrimary", sql.Int, payload.IsPrimary ?? 1);
      request.input("SeatNo", sql.NVarChar(50), seat);
      request.input("FirstName", sql.VarChar(250), payload.FirstName ?? null);
      request.input("MiddleName", sql.VarChar(250), payload.MiddleName ?? null);
      request.input("LastName", sql.VarChar(250), payload.LastName ?? null);
      request.input("Email", sql.VarChar(150), payload.Email ?? null);
      request.input("ContactNo", sql.VarChar(50), payload.ContactNo ?? null);
      request.input("Gender", sql.VarChar(50), payload.Gender ?? null);
      request.input("AadharNo", sql.VarChar(20), payload.AadharNo ?? null);
      request.input("PancardNo", sql.VarChar(20), payload.PancardNo ?? null);
      request.input("BloodGroup", sql.VarChar(10), payload.BloodGroup ?? null);
      request.input("DOB", sql.DateTime, safeDate(payload.DOB));
      request.input("FoodPref", sql.VarChar(100), payload.FoodPref ?? null);
      request.input("Disabled", sql.Bit, payload.Disabled ? 1 : 0);
      request.input("Pregnant", sql.Bit, payload.Pregnant ? 1 : 0);
      request.input("RegisteredCompanyNumber", sql.VarChar(50), payload.RegisteredCompanyNumber ?? null);
      request.input("RegisteredCompanyName", sql.VarChar(50), payload.RegisteredCompanyName ?? null);
      request.input("DrivingLicence", sql.VarChar(100), payload.DrivingLicence ?? null);
      request.input("PassportNo", sql.VarChar(100), payload.PassportNo ?? null);
      request.input("RationCard", sql.VarChar(100), payload.RationCard ?? null);
      request.input("VoterID", sql.VarChar(100), payload.VoterID ?? null);
      request.input("Others", sql.VarChar(500), payload.Others ?? null);
      request.input("NRI", sql.Bit, payload.NRI ? 1 : 0);
      request.input("CreatedBy", sql.Int, payload.CreatedBy ?? 1);
      request.input("SavePassengerDetails", sql.VarChar(50), saveFlag);
      request.input("JourneyDate", sql.Date, payload.JourneyDate);

      // ✅ Execute stored procedure
      const result = await request.execute(proc);

      // ✅ Capture BusBookingSeatID from SP result
      const insertedId = result.recordset?.[0]?.BusBookingSeatID;
      if (insertedId) lastInsertedSeatId = insertedId;

      // ============================================
      // ✅ Manage Seat Lock table & update booking
      // ============================================

      // 1️⃣ Delete temporary lock for this seat and journey date
      const unlockRequest = pool.request();
      unlockRequest.input("BusOperatorID", sql.Int, payload.BusOperatorID);
      unlockRequest.input("SeatNo", sql.VarChar(50), seat);
      unlockRequest.input("JourneyDate", sql.Date, payload.JourneyDate);
      await unlockRequest.query(`
        DELETE FROM SeatLock
        WHERE BusOperatorID = @BusOperatorID
          AND SeatNo = @SeatNo
          AND CAST(JourneyDate AS DATE) = @JourneyDate
      `);

      // 2️⃣ Update seat booking status to "Booked"
      const updateRequest = pool.request();
      updateRequest.input("BusOperatorID", sql.Int, payload.BusOperatorID);
      updateRequest.input("SeatNo", sql.VarChar(50), seat);
      updateRequest.input("JourneyDate", sql.Date, payload.JourneyDate);
      await updateRequest.query(`
        UPDATE BusBookingSeat
        SET Status = 'Booked',
            PaymentStatus = 'Pending',
            LockStatus = 'Unlocked'
        WHERE BusOperatorID = @BusOperatorID
          AND SeatNo = @SeatNo
          AND CAST(JourneyDate AS DATE) = @JourneyDate
      `);
    }

    // ============================================
    // ✅ Final Response to Frontend
    // ============================================
    res.status(201).json({
      success: true,
      message: "✅ Booking saved successfully for given JourneyDate",
      BusBookingSeatID: lastInsertedSeatId,
    });
       console.log("🚀 BusBookingSeatID", { lastInsertedSeatId });

  } catch (err) {
    console.error("❌ SQL INSERT error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// ------------------- USER SIGNUP & LOGIN -------------------
app.post("/api/seat/lock", async (req, res) => {
  const { busId, seatNo, sessionId } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Check if seat is already locked or booked
    const check = await request.query(`
      SELECT TOP 1 * FROM SeatLock 
      WHERE BusOperatorID = ${busId} AND SeatNo = '${seatNo}' AND ExpiresAt > GETDATE()
    `);

    if (check.recordset.length > 0) {
      return res.json({ success: false, message: "Seat already locked" });
    }

    // Lock expires after 5 minutes
    const lockMinutes = 5;
    await request.query(`
      INSERT INTO SeatLock (BusOperatorID, SeatNo, SessionID, ExpiresAt)
      VALUES (${busId}, '${seatNo}', '${sessionId}', DATEADD(MINUTE, ${lockMinutes}, GETDATE()))
    `);

    return res.json({ success: true, message: "Seat locked successfully" });
  } catch (err) {
    console.error("Lock error:", err);
    return res.status(500).json({ success: false, message: "Lock error" });
  }
});

app.post("/api/seat/unlock", async (req, res) => {
  const { busId, seatNo, sessionId } = req.body;

  try {
    const pool = await sql.connect(connectionString);
    const request = pool.request();

    // Only unlock if the same session locked it
    await request.query(`
      DELETE FROM SeatLock
      WHERE BusOperatorID = ${busId} AND SeatNo = '${seatNo}' AND SessionID = '${sessionId}'
    `);

    return res.json({ success: true, message: "Seat unlocked" });
  } catch (err) {
    console.error("Unlock error:", err);
    return res.status(500).json({ success: false, message: "Unlock error" });
  }
});

app.post("/api/user/get-or-create", async (req, res) => {
  try {
    const {
      FirstName,
      MiddleName,
      LastName,
      Email,
      ContactNo,
      Gender,
      Age,
      AadharNo,
      PancardNo,
      BloodGroup,
      DOB,
      FoodPref,
      Disabled,
      DrivingLicence,
      PassportNo,
      RationCard,
      VoterID,
      Others,
      NRI,
      CreatedBy
    } = req.body;

    const pool = await sql.connect(dbConfig);

    // 1️⃣ Check if contact exists
    const existing = await pool.request()
      .input("ContactNo", sql.VarChar, ContactNo)
      .query(`
        SELECT UserID 
        FROM SavedPassengerDtls
        WHERE ContactNo = @ContactNo
      `);

    // ✅ If exists → return existing user
    if (existing.recordset.length > 0) {
      return res.json({ UserID: existing.recordset[0].UserID });
    }

    // 2️⃣ Create new User
    const newUser = await pool.request()
      .query(`
        INSERT INTO [User] (UserType, Status, CreatedBy, CreatedDt)
        OUTPUT INSERTED.UserID
        VALUES (1, 1, 1, GETDATE())
      `);

    const newUserId = newUser.recordset[0].UserID;

    // 3️⃣ Insert passenger info (FULL DETAILS)
    await pool.request()
      .input("UserID", sql.Int, newUserId)
      .input("FirstName", sql.VarChar, FirstName)
      .input("MiddleName", sql.VarChar, MiddleName)
      .input("LastName", sql.VarChar, LastName)
      .input("Email", sql.VarChar, Email)
      .input("ContactNo", sql.VarChar, ContactNo)
      .input("Gender", sql.VarChar, Gender)
      .input("Age", sql.Int, Age)
      .input("AadharNo", sql.VarChar, AadharNo)
      .input("PancardNo", sql.VarChar, PancardNo)
      .input("BloodGroup", sql.VarChar, BloodGroup)
      .input("DOB", sql.Date, DOB)
      .input("FoodPref", sql.VarChar, FoodPref)
      .input("Disabled", sql.Bit, Disabled)
      .input("DrivingLicence", sql.VarChar, DrivingLicence)
      .input("PassportNo", sql.VarChar, PassportNo)
      .input("RationCard", sql.VarChar, RationCard)
      .input("VoterID", sql.VarChar, VoterID)
      .input("Others", sql.VarChar, Others)
      .input("NRI", sql.Bit, NRI)
      .input("CreatedBy", sql.Int, newUserId)
      .query(`
        INSERT INTO SavedPassengerDtls 
        (UserID, FirstName, MiddleName, LastName, Email, ContactNo, Gender, Age, 
         AadharNo, PancardNo, BloodGroup, DOB, FoodPref, Disabled, DrivingLicence, 
         PassportNo, RationCard, VoterID, Others, NRI, PrimaryUser, CreatedBy, CreatedDt)
        VALUES 
        (@UserID, @FirstName, @MiddleName, @LastName, @Email, @ContactNo, @Gender, @Age,
         @AadharNo, @PancardNo, @BloodGroup, @DOB, @FoodPref, @Disabled, @DrivingLicence,
         @PassportNo, @RationCard, @VoterID, @Others, @NRI, 1, @CreatedBy, GETDATE())
      `);

    return res.json({ UserID: newUserId });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


 app.get("/api/package-list", (req, res) => {
  const packages = [
    { PackageID: "1", PackageName: "Tirupati 1 Night / 1 Days Dharma Darshan Package" },
    { PackageID: "2", PackageName: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights" }
  ];
  res.json(packages);
});
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

app.get("/api/busBoardingCounts", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
          bo.BusOperatorID,
          COUNT(bbp.BusBoardingPointID) AS NumBoardingPoints
      FROM BusOperator bo
      LEFT JOIN BusBookingSeat bbs 
          ON bbs.BusOperatorID = bo.BusOperatorID
      LEFT JOIN BusBoardingPoint bbp
          ON bbp.BusBooKingDetailID = bbs.BusBookingDetailsID
      GROUP BY bo.BusOperatorID;
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error", details: err.message });
  } finally {
    sql.close();
  }
});

/////// phone pe payment ///////////

app.post("/api/success", async (req, res) => {
  try {
    const {
      UserID,
      BusBookingSeatID,
       BookingdtlsID, 
      Amount,
      PaymentMode,
      TransactionID,
      TransactionResponse,
      TransactionCode,
      PaymentStatus,
      ErrorCode,
      CreatedBy,
      orderId,
      transactionId,
      status,
      code,
    } = req.body;

    // 🧩 Normalize incoming values
    const normalizedAmount = parseInt(Amount || req.body.amount || 0);
    const normalizedTxnId = TransactionID || transactionId || orderId || null;
    const normalizedStatus = PaymentStatus || status || "Success";
    const normalizedCode = TransactionCode || code || "00";
    const normalizedResponse =
      TransactionResponse || JSON.stringify(req.body);

    // ⚠️ Validate
    if (!normalizedTxnId || !normalizedAmount) {
      return res.status(400).json({
        success: false,
        message: "Amount and TransactionID are required",
      });
    }

    // ✅ If Booking details not present, try to fetch from session/local cache
    // (optional logic - only if you store booking data in DB or Redis)
    // Example:
    // const bookingInfo = await getBookingFromCache(orderId);

    // ✅ Connect to SQL
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    // 🧾 Prepare SQL parameters
    request.input("Flag", sql.Char(1), "I");
    request.input("PaymentID", sql.Int, 0);
    request.input("UserID", sql.Int, UserID ?? null);
    request.input("BookingdtlsID", sql.Int, BookingdtlsID ?? null);
    // ✅ Safely parse and validate BusBookingSeatID
const parsedBusBookingSeatId =
  BusBookingSeatID && BusBookingSeatID !== "undefined"
    ? parseInt(BusBookingSeatID)
    : null;

request.input("BusBookingSeatID", sql.Int, parsedBusBookingSeatId);


    request.input("Amount", sql.Int, normalizedAmount);
    request.input("PaymentMode", sql.VarChar(50), PaymentMode ?? "PhonePe");
    request.input("TransactionID", sql.VarChar(sql.MAX), normalizedTxnId);
    request.input("TransactionResponse", sql.VarChar(sql.MAX), normalizedResponse);
    request.input("TransactionCode", sql.VarChar(50), normalizedCode);
    request.input("PaymentStatus", sql.VarChar(50), normalizedStatus);
    request.input("ErrorCode", sql.VarChar(500), ErrorCode ?? null);
    request.input("CreatedBy", sql.Int, CreatedBy ?? UserID ?? 1);

    // ✅ Execute Stored Procedure
    await request.execute("dbo.sp_Payment");

    console.log("✅ Payment recorded successfully:", normalizedTxnId);

    res.status(201).json({
      success: true,
      message: "✅ Payment recorded successfully in database",
    });
  } catch (err) {
    console.error("❌ Error saving payment:", err);
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: err.message,
    });
  }
});


// ---------------------------------------------
// ✅ PHONEPE PAYMENT CREATION
// ---------------------------------------------
const MERCHANT_ID = "TEST-M222NJL8ZHVEM_25041";
const CLIENT_SECRET = "NjIxZTdiZGYtMzlkOS00ZTkyLWFhNjItZTZhNTBjNTgyM2I0";
const CLIENT_VERSION = "1";
const SANDBOX_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

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

app.post("/api/payment/create-order", async (req, res) => {
  try {
   const { merchantOrderId, amount, userId, bookingdtlsId, busBookingSeatId } = req.body;


    if (!merchantOrderId || !amount)
      return res.status(400).json({ error: "merchantOrderId and amount are required" });

    const token = await getOAuthToken();
    if (!token)
      return res.status(500).json({ error: "Failed to get OAuth token" });

    const requestBody = {
      merchantOrderId,
      amount: parseInt(amount),
      expireAfter: 1200,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Payment for Tirupati Package",
        merchantUrls: {
          // ✅ Include IDs in callback URL
        //  redirectUrl: `http://localhost:5000/api/payment/callback?orderId=${merchantOrderId}&amount=${amount}&userId=${userId}&bookingdtlsId=${bookingdtlsId}&busBookingSeatId=${busBookingSeatId}`,

         redirectUrl: `https://api.tirupatipackagetours.com/api/payment/callback?orderId=${merchantOrderId}&amount=${amount}&userId=${userId}&bookingdtlsId=${bookingdtlsId}&busBookingSeatId=${busBookingSeatId}`,
        },
      },
    };

    const response = await axios.post(
      `${SANDBOX_BASE_URL}/checkout/v2/pay`,
      requestBody,
      {
        headers: {
          Authorization: `O-Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ orderId: merchantOrderId, phonepeResponse: response.data });
  } catch (err) {
    console.error("Error creating order:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ---------------------------------------------
// ✅ CALLBACK AFTER PAYMENT SUCCESS
// ---------------------------------------------
app.get("/api/payment/callback", async (req, res) => {
  try {
    const { orderId, amount, userId, bookingdtlsId,busBookingSeatId } = req.query;
console.log("🔄 CALLBACK PARAMS:", req.query); 
    // ✅ Auto-call your success API to record payment
    await axios.post("https://api.tirupatipackagetours.com/api/success", {
      UserID: userId,
      BookingdtlsID: bookingdtlsId,
     BusBookingSeatID: busBookingSeatId,
      Amount: amount / 100,
      PaymentMode: "PhonePe",
      TransactionID: orderId,
      PaymentStatus: "Success",
      TransactionCode: "00",
      TransactionResponse: "Payment successful via PhonePe",
      CreatedBy: userId || 1,
    });

    // ✅ Redirect user to frontend success page
    res.redirect(`https://www.tirupatipackagetours.com/payment-result?orderId=${orderId}`);
  } catch (err) {
    console.error("❌ Payment callback error:", err);
    res.redirect(`https://www.tirupatipackagetours.com/payment-failed`);
  }
});


//////////////// phone pe payment ///////
////////////////////////////////////

// ----------------------------

app.get("/api/bus/boardingPoints/:busId", async (req, res) => {
  const { busId } = req.params;
  console.log("🔍 Fetching boarding points for busId =", busId);
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("busId", sql.Int, parseInt(busId))
      .query(`
        SELECT 
          PointType,
          BusBooKingDetailID,
          PointName,
          AreaName,
          Pincode,
          latitude,
          longitude,
          CONVERT(varchar, [Time], 108) AS [Time]
        FROM vw_BusBoardingAndDroppingPoints
        WHERE BusBooKingDetailID = @busId
          AND LTRIM(RTRIM(PointType)) = 'B'
        ORDER BY Time ASC
      `);
    res.json({
      success: true,
      count: result.recordset.length,
      boardingPoints: result.recordset,
    });
  } catch (err) {
    console.error("❌ Error fetching boarding points:", err);
    res.status(500).json({ success: false, message: "Error fetching boarding points" });
  }
});

app.get("/api/bus/droppingPoints/:busId", async (req, res) => {
  const { busId } = req.params;
  console.log("🔍 Fetching dropping points for busId =", busId);
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("busId", sql.Int, parseInt(busId))
      .query(`
        SELECT 
          PointType,
          BusBooKingDetailID,
          PointName,
          AreaName,
          Pincode,
          latitude,
          longitude,
          CONVERT(varchar, [Time], 108) AS [Time]
        FROM vw_BusBoardingAndDroppingPoints
        WHERE BusBooKingDetailID = @busId
          AND LTRIM(RTRIM(PointType)) = 'D'
        ORDER BY Time ASC
      `);
    res.json({
      success: true,
      count: result.recordset.length,
      droppingPoints: result.recordset,
    });
  } catch (err) {
    console.error("❌ Error fetching dropping points:", err);
    res.status(500).json({ success: false, message: "Error fetching dropping points" });
  }
});


//////////////////////////////

// app.post("/api/success", async (req, res) => {
//   try {
//     const {
//       UserID,
//       BookingdtlsID,
//       Amount,
//       PaymentMode,
//       TransactionID,
//       TransactionResponse,
//       TransactionCode,
//       PaymentStatus,
//       ErrorCode,
//       CreatedBy,
//       orderId,
//       transactionId,
//       status,
//       code,
//     } = req.body;

//     // ✅ Normalize & fallback handling
//     const normalizedAmount = parseInt(Amount || req.body.amount || 0);
//     const normalizedTxnId = TransactionID || transactionId || orderId || null;
//     const normalizedStatus = PaymentStatus || status || "Success";
//     const normalizedCode = TransactionCode || code || "00";
//     const normalizedResponse = TransactionResponse
//       ? TransactionResponse
//       : JSON.stringify(req.body);

//     // ✅ Basic validation
//     if (!normalizedAmount || !normalizedTxnId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Amount and TransactionID are required" });
//     }

//     // ✅ Connect to SQL Server
//     const pool = await sql.connect(dbConfig);
//     const request = pool.request();

//     // ✅ Input parameters for stored procedure
//     request.input("Flag", sql.Char(1), "I");
//     request.input("PaymentID", sql.Int, 0);
//     request.input("UserID", sql.Int, UserID ?? null);
//     request.input("BookingdtlsID", sql.Int, BookingdtlsID ?? null);
//     request.input("Amount", sql.Int, normalizedAmount);
//     request.input("PaymentMode", sql.VarChar(50), PaymentMode ?? "PhonePe");
//     request.input("TransactionID", sql.VarChar(sql.MAX), normalizedTxnId);
//     request.input("TransactionResponse", sql.VarChar(sql.MAX), normalizedResponse);
//     request.input("TransactionCode", sql.VarChar(50), normalizedCode);
//     request.input("PaymentStatus", sql.VarChar(50), normalizedStatus);
//     request.input("ErrorCode", sql.VarChar(500), ErrorCode ?? null);
//     request.input("CreatedBy", sql.Int, CreatedBy ?? 1);

//     // ✅ Execute your stored procedure
//     await request.execute("dbo.sp_Payment");

//     console.log("✅ Payment recorded successfully:", normalizedTxnId);

//     // ✅ Return success
//     res.status(201).json({
//       success: true,
//       message: "✅ Payment recorded successfully in database",
//     });
//   } catch (err) {
//     console.error("❌ Error saving payment:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to record payment",
//       error: err.message,
//     });
//   }
// });


/////////////////////////////

/////////////////////////////////////////

// ✅ Start the server
app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



/////////////////////////////////////////////////////////////////////

// the below code is same  as sanchar6t code



// the above code is with msnodesqlv8 below is with mssql


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


// // // ------------------- DATABASE CONFIG -------------------
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

// // // Serve static files from the "public" folder
//  app.use(express.static(path.join(process.cwd(), "public")));




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
// app.get("/api/package-list", async (req, res) => {
//   try {
//     const rows = await queryAsync(`SELECT PackageID, PackageName FROM Package ORDER BY PackageID`);
//     res.json(rows);
//   } catch (err) {
//     console.error("SQL error:", err);
//     res.status(500).send("Server error");
//   }
// });

// app.get("/api/bus-details", async (req, res) => {
//   try {
//     let pool = await sql.connect(dbConfig);

//     const result = await pool.request().query(`
//       SELECT 
//         b.[BusBooKingDetailID],
//         b.[OperatorID],
//         b.[PackageID],
//         b.[WkEndSeatPrice],
//         b.[WkDaySeatPrice],
//         b.[DepartureTime],
//         b.[Arrivaltime],
//         b.[Status],
//         b.[PackageName],
//         b.[BusNo],
//         b.[BusSeats],
//         b.[BusType],
//         b.[FemaleSeatNo],
//         a.[AMName]
//       FROM [dbo].[vw_BusBookingDetails] b
//       LEFT JOIN [dbo].[vw_BusAmenities] a
//         ON b.OperatorID = a.BusOperatorID
//     `);

//     // Now group amenities for each bus
//     const buses = {};
//     result.recordset.forEach(row => {
//       if (!buses[row.BusBooKingDetailID]) {
//         buses[row.BusBooKingDetailID] = {
//           BusBooKingDetailID: row.BusBooKingDetailID,
//           OperatorID: row.OperatorID,
//           PackageID: row.PackageID,
//           WkEndSeatPrice: row.WkEndSeatPrice,
//           WkDaySeatPrice: row.WkDaySeatPrice,
//           DepartureTime: row.DepartureTime,
//           Arrivaltime: row.Arrivaltime,
//           Status: row.Status,
//           PackageName: row.PackageName,
//           BusNo: row.BusNo,
//           BusSeats: row.BusSeats,
//           BusType: row.BusType,
//           FemaleSeatNo: row.FemaleSeatNo,
//           amenities: []
//         };
//       }
//       if (row.AMName) {
//         buses[row.BusBooKingDetailID].amenities.push(row.AMName);
//       }
//     });

//     const finalData = Object.values(buses);
//     console.log("Bus Details with amenities:", finalData);
//     res.json(finalData);

//   } catch (err) {
//     console.error("Error fetching bus details:", err);
//     res.status(500).json({ error: "Server error fetching bus details" });
//   }
// });

// // // API to get package list
// app.get("/api/package-list", (req, res) => {
//   const packages = [
//     { PackageID: "1", PackageName: "Tirupati 1 Night / 1 Days Dharma Darshan Package" },
//     { PackageID: "2", PackageName: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights" }
//   ];
//   res.json(packages);
// });

// // ------------------- FEEDBACK API -------------------
// app.post("/api/submit-feedback", async (req, res) => {
//   try {
//     const { name, contactNo, emailId, userFeedback, packageId } = req.body;
//     if (!name || !contactNo || !emailId || !userFeedback || !packageId)
//       return res.status(400).json({ error: "All fields are required" });

//     const query = `
//       EXEC sp_UserFeedback
//         @Flag='I',
//         @Name='${name}',
//         @ContactNo='${contactNo}',
//         @EmailId='${emailId}',
//         @UserFeedback='${userFeedback}',
//         @PackageId=${packageId},
//         @CreatedBy=0
//     `;
//     await queryAsync(query);
//     res.json({ success: true, message: "Thank you for submitting, we will get back to you soon!" });
//   } catch (err) {
//     console.error("SQL error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// //the above code isfor db 

// // API endpoint to receive contact form submissions
// // app.post("/api/submit-feedback", async (req, res) => {
// //   const { name, emailId, contactNo, userFeedback, packageId } = req.body;

// //   if (!name || !emailId || !contactNo || !userFeedback || !packageId) {
// //     return res.status(400).json({ success: false, message: "All fields are required" });
// //   }

// //   // Construct professional email body
// //   const mailOptions = {
// //     from: process.env.EMAIL_USER,
// //     to: process.env.EMAIL_USER, // receive submissions in your Gmail
// //     subject: `New Contact Form Submission from ${name}`,
// //     html: `
// //       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
// //         <h2 style="color: #6B4E3D;">New Contact Form Submission Received</h2>
// //         <p>Dear Team,</p>
// //         <p>We have received a new contact form submission from a visitor on the website. Below are the details:</p>
// //         <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
// //           <tr>
// //             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
// //             <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
// //           </tr>
// //           <tr>
// //             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
// //             <td style="padding: 8px; border: 1px solid #ddd;">${emailId}</td>
// //           </tr>
// //           <tr>
// //             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
// //             <td style="padding: 8px; border: 1px solid #ddd;">${contactNo}</td>
// //           </tr>
// //           <tr>
// //             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Selected Package:</strong></td>
// //             <td style="padding: 8px; border: 1px solid #ddd;">${packageId}</td>
// //           </tr>
// //           <tr>
// //             <td style="padding: 8px; border: 1px solid #ddd;"><strong>Feedback / Message:</strong></td>
// //             <td style="padding: 8px; border: 1px solid #ddd;">${userFeedback}</td>
// //           </tr>
// //         </table>
// //         <p style="margin-top: 15px;">Please reach out to the visitor at the earliest convenience.</p>
// //         <p>Best Regards,<br/>Sanchar6T Team</p>
// //       </div>
// //     `,
// //   };

// //   try {
// //     await transporter.sendMail(mailOptions);
// //     return res.status(200).json({ success: true, message: "Feedback submitted successfully" });
// //   } catch (err) {
// //     console.error("Error sending email:", err);
// //     return res.status(500).json({ success: false, message: "Server error, could not send email" });
// //   }
// // });

// // SPA fallback: serve index.html for all other routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(process.cwd(), "public", "index.html"));
// });
// // ------------------- START SERVER -------------------
//  const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
// // the above is going good


// server.js
// const express = require("express");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const SibApiV3Sdk = require('@sendinblue/client');
// const dotenv = require("dotenv");

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Health check
// app.get("/", (req, res) => {
//   res.send("Backend is running successfully 🚀");
// });

// // ✅ Mock API to return package list
// app.get("/api/package-list", (req, res) => {
//   const packages = [
//     { PackageID: 1, PackageName: "  APTDC Tirupati 1 Night / 1 Days Dharma Darshan Package" },
//     { PackageID: 2, PackageName: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights" },
    
//   ];
//   res.json(packages);
// });



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



// // ✅ Feedback submission via WhatsApp
// // app.post("/api/submit-feedback", (req, res) => {
// //   const { name, contactNo, emailId, userFeedback, packageId } = req.body;

// //   if (!name || !contactNo || !emailId || !userFeedback || !packageId) {
// //     return res.status(400).json({ success: false, message: "Missing required fields" });
// //   }

// //   try {
// //     // Create WhatsApp message link
// //     const adminWhatsAppNumber = "919964060505"; // Replace with your number with country code
// //     const message = `
// // New Inquiry:
// // Name: ${name}
// // Email: ${emailId}
// // Phone: ${contactNo}
// // Package ID: ${packageId}
// // Message: ${userFeedback}
// // `;

// //     // URL encode the message
// //     const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;

// //     console.log(`📩 Feedback received from ${name}, open WhatsApp link: ${whatsappUrl}`);

// //     res.json({
// //       success: true,
// //       message: "Feedback ready to send via WhatsApp",
// //       whatsappUrl
// //     });

// //   } catch (error) {
// //     console.error("❌ WhatsApp message preparation failed:", error);
// //     res.status(500).json({ success: false, message: "Error preparing WhatsApp message" });
// //   }
// // });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () =>
//   console.log(`✅ Server running on port ${PORT}`)
// );
