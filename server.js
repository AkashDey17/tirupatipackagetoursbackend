// const express = require("express");
// const cors = require("cors");
// const sql = require("msnodesqlv8");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve static files
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
//           { timeStart: "06:00", timeEnd: "08:00", title: "Travel to Tirupati", type: "Travel", location: "From Bangalore", estimatedDurationMinutes: 120 },
//           { timeStart: "08:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 210 },
//           { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Hotel or Local Restaurant", estimatedDurationMinutes: 90 }
//         ]
//       },
//       {
//         dayNumber: 2,
//         date: "",
//         activities: [
//           { timeStart: "07:00", timeEnd: "09:00", title: "Srikalahasti Darshan", type: "Temple", location: "Srikalahasti Temple", estimatedDurationMinutes: 120 },
//           { timeStart: "09:30", timeEnd: "12:00", title: "Local Sightseeing", type: "Sightseeing", location: "Nearby scenic spots", estimatedDurationMinutes: 150 }
//         ]
//       }
//     ],
//     hotels: [{ name: "Tirupati Grand Hotel", area: "Tirupati", approxPriceRange: "₹2500 - ₹4000/night" }],
//   },
//   templeTrails: {
//     id: "templeTrails",
//     title: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night",
//     days: [
//       {
//         dayNumber: 1,
//         date: "",
//         activities: [
//           { timeStart: "06:00", timeEnd: "10:00", title: "Travel to Tirupati", type: "Travel", location: "From Chennai", estimatedDurationMinutes: 240 },
//           { timeStart: "10:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 90 },
//           { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Local eatery", estimatedDurationMinutes: 90 }
//         ]
//       },
//       {
//         dayNumber: 2,
//         date: "",
//         activities: [
//           { timeStart: "07:00", timeEnd: "09:00", title: "Local Temple Hopping", type: "Temple", location: "Kapila Theertham & Govindaraja Swamy Temple", estimatedDurationMinutes: 120 }
//         ]
//       }
//     ],
//     hotels: [{ name: "Temple Trails Inn", area: "Tirupati", approxPriceRange: "₹1500 - ₹2500/night" }],
//   }
// };

// // ------------------- APIs -------------------

// // 1️⃣ Plan API
// app.post("/api/plan", async (req, res) => {
//   try {
//     const { tourId } = req.body;
//     if (!tourId || !TOUR_OPTIONS[tourId]) {
//       return res.status(400).json({ error: "Invalid tourId" });
//     }
//     res.json({ success: true, plan: TOUR_OPTIONS[tourId] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch itinerary" });
//   }
// });

// // 2️⃣ Bus Details API
// app.get("/api/bus-details", async (req, res) => {
//   try {
//     const query = `
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
//     `;

//     const rows = await queryAsync(query);

//     // Group amenities by BusBooKingDetailID
//     const buses = {};
//     rows.forEach(row => {
//       if (!buses[row.BusBooKingDetailID]) {
//         buses[row.BusBooKingDetailID] = { ...row, amenities: [] };
//       }
//       if (row.AMName) buses[row.BusBooKingDetailID].amenities.push(row.AMName);
//     });

//     res.json(Object.values(buses));

//   } catch (err) {
//     console.error("Error fetching bus details:", err);
//     res.status(500).json({ error: "Server error fetching bus details" });
//   }
// });

// // 3️⃣ Package List API
// app.get("/api/package-list", async (req, res) => {
//   try {
//     const query = `SELECT PackageID, PackageName FROM [dbo].[Package] ORDER BY PackageID`;
//     const rows = await queryAsync(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).send("Server error");
//   }
// });

// // 4️⃣ Feedback API
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

//     await queryAsync(query);
//     res.json({ success: true, message: "Thank you for submitting, we will get back to you soon!" });
//   } catch (err) {
//     console.error("SQL error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // bus booking seat
// app.post("/api/bus-booking-seat", async (req, res) => {
//   try {
//     const payload = req.body;
//     const pool = await sql.connect(dbConfig);
//     const procFullName = "dbo.sp_BusBookingSeat";

//     // Convert SavePassengerDetails to 'Yes' or 'No' string for SP
//     const saveFlag = payload.SavePassengerDetails === "Y" ? "Yes" : "No";

//     const request = pool.request();

//     // Map all parameters expected by your SP
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
//     request.input("DOB", sql.DateTime, payload.DOB ? new Date(payload.DOB) : null);
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

//     const result = await request.execute(procFullName);

//     res.status(201).json({ message: "Booking saved successfully", result: result.recordset });
//     //console.log (result);
//   } catch (err) {
//     console.error("SQL INSERT error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// // 5️⃣ SPA fallback
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });



// // ------------------- SERVER START -------------------
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0",() => console.log(`Server running on port ${PORT}`));

// THE ABOVE IS GOOD but bus booking seat api is not working due to db config

// the below code is same  as sanchar6t code

const express = require("express");
const cors = require("cors");
const axios = require("axios");
// const sql = require("mssql/msnodesqlv8");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ------------------- DATABASE CONFIG -------------------
// const dbConfig = {
//   server: process.env.DB_SERVER,
//   database: process.env.DB_NAME,
//   options: {
//     trustedConnection: true,
//     trustServerCertificate: true,
//   },
//   driver: "msnodesqlv8",
// };

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

// Get all bus booking details
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

// Get bus booking detail by ID
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

// Insert bus booking detail
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

// Get all buses with amenities
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

// Book a seat
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

// ------------------- USER SIGNUP & LOGIN -------------------

// mail

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

// mail

// Signup
// app.post("/api/signup", async (req, res) => {
//   try {
//     const { Fname, Mname, Lname, email, phoneNumber, password, gender } = req.body;
//     if (!Fname || !Lname || !password || (!email && !phoneNumber)) {
//       return res.status(400).json({ success: false, message: "Fill all required fields" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const pool = await sql.connect(dbConfig);

//     await pool.request()
//       .input("Flag", sql.Char(1), "I")
//       .input("UserID", sql.Int, 0)
//       .input("UserType", sql.Int, 2)
//       .input("Status", sql.VarChar(250), "true")
//       .input("Password", sql.VarChar(2000), hashedPassword)
//       .input("FirstName", sql.VarChar(250), Fname)
//       .input("MiddleName", sql.VarChar(250), Mname || null)
//       .input("LastName", sql.VarChar(250), Lname)
//       .input("Email", sql.VarChar(500), email || "")
//       .input("ContactNo", sql.VarChar(50), phoneNumber || "")
//       .input("Gender", sql.VarChar(50), gender || null)
//       .input("CreatedBy", sql.Int, 0)
//       .execute("sp_User");

//     res.json({
//       success: true,
//       message: "Signup successful!",
//       user: { Fname, Mname, Lname, email, phoneNumber, gender }
//     });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// Login
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, phoneNumber, password } = req.body;
//     if (!password || (!email && !phoneNumber)) return res.status(400).json({ success: false, message: "Fill all required fields" });

//     const pool = await sql.connect(dbConfig);
//     let query = `
//       SELECT spd.UserID, spd.FirstName, spd.MiddleName, spd.LastName, spd.Email, spd.ContactNo, spd.Gender, us.Password
//       FROM SavedPassengerDtls spd
//       JOIN UserSecurity us ON spd.UserID = us.UserID
//       WHERE `;

//     if (email && phoneNumber) query += `(spd.Email = @email OR spd.ContactNo = @phoneNumber)`;
//     else if (email) query += `spd.Email = @email`;
//     else if (phoneNumber) query += `spd.ContactNo = @phoneNumber`;

//     const request = pool.request();
//     if (email) request.input("email", sql.VarChar(500), email);
//     if (phoneNumber) request.input("phoneNumber", sql.VarChar(50), phoneNumber);

//     const result = await request.query(query);
//     if (!result.recordset.length) return res.status(400).json({ success: false, message: "User not found" });

//     const user = result.recordset[0];
//     const isMatch = await bcrypt.compare(password, user.Password);
//     if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

//     res.json({
//       success: true,
//       message: "Login successful",
//       user: {
//         Fname: user.FirstName,
//         Mname: user.MiddleName,
//         Lname: user.LastName,
//         email: user.Email,
//         phoneNumber: user.ContactNo,
//         gender: user.Gender,
//         UserID: user.UserID
//       }
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



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

// // ✅ Email submission endpoint
// // app.post("/api/submit-feedback", async (req, res) => {
// //   const { name, contactNo, emailId, userFeedback, packageId } = req.body;

// //   if (!name || !contactNo || !emailId || !userFeedback || !packageId) {
// //     return res.status(400).json({ success: false, message: "Missing required fields" });
// //   }

// //   try {
// //     const transporter = nodemailer.createTransport({
// //       service: "gmail",
// //       auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS.replace(/\s/g, ""), // remove accidental spaces
// //       },
// //     });

// //     const mailOptions = {
// //       from: process.env.EMAIL_USER,
// //       to: process.env.EMAIL_USER, // send to yourself (admin inbox)
// //       subject: `📩 New Inquiry from ${name} - Package ID ${packageId}`,
// //       html: `
// //         <h2>New Contact Form Submission</h2>
// //         <p><b>Name:</b> ${name}</p>
// //         <p><b>Email:</b> ${emailId}</p>
// //         <p><b>Phone:</b> ${contactNo}</p>
// //         <p><b>Selected Package ID:</b> ${packageId}</p>
// //         <p><b>Message:</b></p>
// //         <p>${userFeedback}</p>
// //         <hr>
// //         <p>🕉️ Sent via Tirupati Package Tours Contact Form</p>
// //       `,
// //     };

// //     await transporter.sendMail(mailOptions);

// //     res.json({ success: true, message: "Email sent successfully" });
// //   } catch (error) {
// //     console.error("Email send failed:", error);
// //     res.status(500).json({ success: false, message: "Error sending email" });
// //   }
// // });

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
