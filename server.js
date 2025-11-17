//////////////////////////////////////////////////
const express = require("express");
const sql = require("mssql");
const moment = require("moment-timezone");
 const cors = require("cors");
const axios = require("axios");
//const pdf = require("html-pdf-node");
const puppeteer = require("puppeteer-core");
const path = require("path");
const chromium = require("@sparticuz/chromium");

 const nodemailer = require("nodemailer");
 const bcrypt = require("bcryptjs");
require("dotenv").config();


const app = express();
//app.use(cors());
app.use(
  cors({
    origin: [
      "https://www.tirupatipackagetours.com",
      "https://tirupatipackagetours.com",
      "http://localhost:8080"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));



const PORT = process.env.PORT || 5000;




// const dbConfig = {
//   user: "sqladmin",
//   password: "Sanchar6t1",
//   server: "sqldatabase01.cx204wkac5t2.ap-south-1.rds.amazonaws.com",
//   port: 1433,
//   database: "Sanchar6T_Dev",
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
// };



const dbConfig = {
  user: process.env.DB_USER,       
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,   
  port: parseInt(process.env.DB_PORT),  // <-- use port from .env
  database: process.env.DB_NAME,
  options: {
    encrypt: false,                // false for local dev
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};




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
    const { packageId, journeyDate } = req.query;

    if (!journeyDate) {
      return res.status(400).json({ error: "journeyDate is required" });
    }

    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input("journeyDate", sql.Date, journeyDate);

    let query = `
      SELECT 
        b.BusBooKingDetailID,
        b.OperatorID,
        b.PackageID,
        b.DepartureTime,
        b.Arrivaltime,
        b.BusNo,
        b.BusSeats,
        b.BusType,

        -- Calculate Final Price
        ISNULL(
          sp.SpecialPrice,  
          CASE 
            WHEN wc.DayName IS NOT NULL 
              THEN pc.WeekendPrice
            ELSE pc.WeekdayPrice
          END
        ) AS FinalSeatPrice,

        a.AMName
      FROM vw_BusBookingDetails b
      LEFT JOIN BusPriceConfig pc 
          ON b.BusBooKingDetailID = pc.BusBookingDetailID
          AND pc.IsActive = 1

      LEFT JOIN BusSpecialPrice sp 
          ON b.BusBooKingDetailID = sp.BusBookingDetailID
          AND sp.PriceDate = @journeyDate

      LEFT JOIN WeekendConfig wc
          ON wc.DayName = DATENAME(WEEKDAY, @journeyDate)

      LEFT JOIN vw_BusAmenities a 
          ON b.OperatorID = a.BusOperatorID

      LEFT JOIN vw_BusOperator o 
          ON b.OperatorID = o.BusOperatorID

      WHERE 
          o.SourceSystem = 'TirupatiPackage'
          AND b.Status = 1  
    `;

    if (packageId) {
      query += " AND b.PackageID = @packageId";
      request.input("packageId", sql.Int, packageId);
    }

    query += " ORDER BY b.DepartureTime";

    const result = await request.query(query);

    const buses = {};
    result.recordset.forEach(row => {
      if (!buses[row.BusBooKingDetailID]) {
        buses[row.BusBooKingDetailID] = {
          BusBooKingDetailID: row.BusBooKingDetailID,
          OperatorID: row.OperatorID,
          PackageID: row.PackageID,
          BusNo: row.BusNo,
          BusSeats: row.BusSeats,
          BusType: row.BusType,
          DepartureTime: row.DepartureTime,
          Arrivaltime: row.Arrivaltime,
          FinalSeatPrice: row.FinalSeatPrice,
          amenities: []
        };
      }
      if (row.AMName) {
        buses[row.BusBooKingDetailID].amenities.push(row.AMName);
      }
    });

    res.json(Object.values(buses));

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

//////////////////////////////////////
// app.post("/api/bus-booking-seat", async (req, res) => {
//   try {
//     const payload = req.body;

//     // Validate JourneyDate
//     if (!payload.JourneyDate) {
//       return res
//         .status(400)
//         .json({ success: false, message: "JourneyDate is required" });
//     }

//     const pool = await sql.connect(dbConfig);
//     const proc = "dbo.sp_BusBookingSeat";
//     const saveFlag = payload.SavePassengerDetails === "Y" ? "Yes" : "No";

//     const seats = Array.isArray(payload.SeatNo) ? payload.SeatNo : [payload.SeatNo];

//     // ✅ Helper to normalize date
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

//     // ============================================
//     // ✅ Insert for each seat
//     // ============================================
//     let lastInsertedSeatId = null;

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

//       // ✅ Execute stored procedure
//       const result = await request.execute(proc);

//       // ✅ Capture BusBookingSeatID from SP result
//       const insertedId = result.recordset?.[0]?.BusBookingSeatID;
//       if (insertedId) lastInsertedSeatId = insertedId;

//       // ============================================
//       // ✅ Manage Seat Lock table & update booking
//       // ============================================

//       // // 1️⃣ Delete temporary lock for this seat and journey date
//       // const unlockRequest = pool.request();
//       // unlockRequest.input("BusBookingDetailsID", sql.Int, payload.BusBookingDetailsID);
//       // unlockRequest.input("SeatNo", sql.VarChar(50), seat);
//       // unlockRequest.input("JourneyDate", sql.Date, payload.JourneyDate);
//       // await unlockRequest.query(`
//       //   DELETE FROM SeatLock
//       //   WHERE BusBookingDetailsID = @BusBookingDetailsID
//       //     AND SeatNo = @SeatNo
//       //     AND CAST(JourneyDate AS DATE) = @JourneyDate
//       // `);

//       // 2️⃣ Update seat booking status to "Booked"
//       const updateRequest = pool.request();
//       updateRequest.input("BusBookingDetailsID", sql.Int, payload.BusBookingDetailsID);
//       updateRequest.input("SeatNo", sql.VarChar(50), seat);
//       updateRequest.input("JourneyDate", sql.Date, payload.JourneyDate);
//       await updateRequest.query(`
//         UPDATE BusBookingSeat
//         SET Status = 'Pending',
//             PaymentStatus = 'Pending',
//             LockStatus = 'Locked'
//         WHERE BusBookingDetailsID = @BusBookingDetailsID
//           AND SeatNo = @SeatNo
//           AND CAST(JourneyDate AS DATE) = @JourneyDate
//       `);
//     }

//     // ============================================
//     // ✅ Final Response to Frontend
//     // ============================================
//     res.status(201).json({
//       success: true,
//       message: "✅ Booking saved successfully for given JourneyDate",
//       BusBookingSeatID: lastInsertedSeatId,
//     });
//        console.log("🚀 BusBookingSeatID", { lastInsertedSeatId });

//   } catch (err) {
//     console.error("❌ SQL INSERT error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

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

app.post("/api/seat/lock", async (req, res) => {
  const { busBookingId, seatNo, sessionId, journeyDate1 } = req.body;

  // ⚠️ Basic validation
  if (!busBookingId || !seatNo || !sessionId || !journeyDate1) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (busBookingId, seatNo, sessionId, journeyDate1)",
    });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    const request = new sql.Request(transaction);

    // 1️⃣ Cleanup expired locks before proceeding
    await request.query(`
      DELETE FROM SeatLock WHERE ExpiresAt < GETDATE();
    `);

    // 2️⃣ Check if seat is already locked
    request.input("BusBookingDetailsID", sql.Int, busBookingId);
    request.input("SeatNo", sql.VarChar(50), seatNo);
    request.input("JourneyDate", sql.Date, journeyDate1);

    const checkLock = await request.query(`
      SELECT TOP 1 1 
      FROM SeatLock 
      WHERE BusBookingDetailsID = @BusBookingDetailsID
        AND SeatNo = @SeatNo
        AND CAST(JourneyDate AS DATE) = @JourneyDate
        AND ExpiresAt > GETDATE();
    `);

    if (checkLock.recordset.length > 0) {
      await transaction.rollback();
      return res.status(200).json({
        success: false,
        message: `🚫 Seat ${seatNo} is already locked for this journey date.`,
      });
    }

    // 3️⃣ Check if seat is already booked
    const checkBooked = await request.query(`
      SELECT TOP 1 1 
      FROM BusBookingSeat
      WHERE BusBookingDetailsID = @BusBookingDetailsID
        AND SeatNo = @SeatNo
        AND CAST(JourneyDate AS DATE) = @JourneyDate
        AND Status IN ('Booked', 'Pending');
    `);

    if (checkBooked.recordset.length > 0) {
      await transaction.rollback();
      return res.status(200).json({
        success: false,
        message: `🚫 Seat ${seatNo} is already booked or pending confirmation.`,
      });
    }

    // 4️⃣ Insert seat lock
    const lockMinutes = 5;

    const insertRequest = new sql.Request(transaction);
    insertRequest.input("BusBookingDetailsID", sql.Int, busBookingId);
    insertRequest.input("SeatNo", sql.VarChar(50), seatNo);
    insertRequest.input("SessionID", sql.VarChar(100), sessionId);
    insertRequest.input("JourneyDate", sql.Date, journeyDate1);
    insertRequest.input("LockMinutes", sql.Int, lockMinutes);

    await insertRequest.query(`
      INSERT INTO SeatLock (BusBookingDetailsID, SeatNo, SessionID, JourneyDate, ExpiresAt)
      VALUES (@BusBookingDetailsID, @SeatNo, @SessionID, @JourneyDate, DATEADD(MINUTE, @LockMinutes, GETDATE()));
    `);

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `✅ Seat ${seatNo} locked successfully for journey date ${journeyDate1}`,
      expiresInMinutes: lockMinutes,
    });
  } catch (err) {
    console.error("❌ Seat Lock Error:", err);
    try {
      if (transaction && transaction._aborted !== true) await transaction.rollback();
    } catch (rollbackErr) {
      console.error("⚠️ Transaction rollback error:", rollbackErr);
    }

    return res.status(500).json({
      success: false,
      message: "Internal error while locking seat",
      error: err.message,
    });
  }
});

app.post("/api/seat/unlock", async (req, res) => {
  const { busBookingId, seatNo, sessionId } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    // Only unlock if the same session locked it
    await request.query(`
      DELETE FROM SeatLock
      WHERE BusBookingDetailsID = ${busBookingId} AND SeatNo = '${seatNo}' AND SessionID = '${sessionId}'
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
        VALUES (2, 1, 1, GETDATE())
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

// app.post("/api/success", async (req, res) => {
//   try {
//     const {
//       UserID,
//       BusBookingSeatID,
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
//       JourneyDate, // 👈 Optional, pass from frontend/callback
//     } = req.body;

//     // 🧩 Normalize incoming values
//     const normalizedAmount = parseInt(Amount || req.body.amount || 0);
//     const normalizedTxnId = TransactionID || transactionId || orderId || null;
//     const normalizedStatus = PaymentStatus || status || "Success";
//     const normalizedCode = TransactionCode || code || "00";
//     const normalizedResponse =
//       TransactionResponse || JSON.stringify(req.body);
//     const normalizedJourneyDate =
//       JourneyDate || new Date().toISOString().split("T")[0];

//     // ⚠️ Validate essential fields
//     if (!normalizedTxnId || !normalizedAmount) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount and TransactionID are required",
//       });
//     }

//     const pool = await sql.connect(dbConfig);

//     // ✅ 1️⃣ Record the payment in your table
//     const request = pool.request();
//     request.input("Flag", sql.Char(1), "I");
//     request.input("PaymentID", sql.Int, 0);
//     request.input("UserID", sql.Int, UserID ?? null);
//     request.input("BookingdtlsID", sql.Int, BookingdtlsID ?? null);

//     const parsedBusBookingSeatId =
//       BusBookingSeatID && BusBookingSeatID !== "undefined"
//         ? parseInt(BusBookingSeatID)
//         : null;
//     request.input("BusBookingSeatID", sql.Int, parsedBusBookingSeatId);

//     request.input("Amount", sql.Int, normalizedAmount);
//     request.input("PaymentMode", sql.VarChar(50), PaymentMode ?? "PhonePe");
//     request.input("TransactionID", sql.VarChar(sql.MAX), normalizedTxnId);
//     request.input("TransactionResponse", sql.VarChar(sql.MAX), normalizedResponse);
//     request.input("TransactionCode", sql.VarChar(50), normalizedCode);
//     request.input("PaymentStatus", sql.VarChar(50), normalizedStatus);
//     request.input("ErrorCode", sql.VarChar(500), ErrorCode ?? null);
//     request.input("CreatedBy", sql.Int, CreatedBy ?? UserID ?? 1);

//     await request.execute("dbo.sp_Payment");

//     console.log("✅ Payment recorded successfully:", normalizedTxnId);

//     const updateSeat = pool.request();
// updateSeat.input("BusBookingSeatID", sql.Int, parsedBusBookingSeatId);
// updateSeat.input("BookingdtlsID", sql.Int, BookingdtlsID);
// updateSeat.input("JourneyDate", sql.Date, normalizedJourneyDate);

// // 🧩 If JourneyDate is NULL, update without it
// await updateSeat.query(`
//   UPDATE BusBookingSeat
//   SET Status = 'Booked',
//       PaymentStatus = 'Success',
//       LockStatus ='Unlocked'

//   WHERE 
//     (BusBookingSeatID = @BusBookingSeatID OR BusBookingDetailsID = @BookingdtlsID)
//     ${normalizedJourneyDate ? "AND CAST(JourneyDate AS DATE) = @JourneyDate" : ""}
// `);


//     console.log("✅ Booking status updated successfully");

//     // ✅ 3️⃣ Delete corresponding SeatLock records
//     const cleanup = pool.request();
//     cleanup.input("BusBookingDetailsID", sql.Int, BookingdtlsID);
//     cleanup.input("JourneyDate", sql.Date, normalizedJourneyDate);

//     await cleanup.query(`
//       DELETE FROM SeatLock
//       WHERE BusBookingDetailsID = @BusBookingDetailsID
//         AND CAST(JourneyDate AS DATE) = @JourneyDate
//     `);

//     console.log("🧹 Seat locks cleaned up after successful payment");

//     // ✅ 4️⃣ Respond to frontend
//     res.status(201).json({
//       success: true,
//       message: "✅ Payment recorded, seat booked, and lock cleared successfully",
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

app.post("/api/success", async (req, res) => {
  try {
    const {
      UserID,
      BookingdtlsID,
      Amount,
      PaymentMode,
      TransactionID,
      TransactionResponse,
      TransactionCode,
      PaymentStatus,
      ErrorCode,
      CreatedBy,
      JourneyDate,
      BusBookingSeatIDs // ⭐ now array from callback
    } = req.body;

    // Convert seat IDs → Array<int>
    const seatIdArray = Array.isArray(BusBookingSeatIDs)
      ? BusBookingSeatIDs.map((id) => parseInt(id))
      : [];

    console.log("🎯 Seat IDs for ticket generation:", seatIdArray);

    // Normalize fields
    const normalizedAmount = parseInt(Amount || 0);
    const normalizedTxnId = TransactionID || null;
    const normalizedStatus = PaymentStatus || "Success";
    const normalizedCode = TransactionCode || "00";
    const normalizedResponse =
      TransactionResponse || JSON.stringify(req.body);
    const normalizedJourneyDate =
      JourneyDate || new Date().toISOString().split("T")[0];

    if (!normalizedTxnId || !normalizedAmount) {
      return res.status(400).json({
        success: false,
        message: "Amount and TransactionID are required",
      });
    }

    const pool = await sql.connect(dbConfig);

    // ------------------------------------------------------------------
    // 1️⃣ SAVE PAYMENT
    // ------------------------------------------------------------------
    const payReq = pool.request();
    payReq.input("Flag", sql.Char(1), "I");
    payReq.input("PaymentID", sql.Int, 0);
    payReq.input("UserID", sql.Int, UserID);
    payReq.input("BookingdtlsID", sql.Int, BookingdtlsID);

    payReq.input("BusBookingSeatID", sql.Int, seatIdArray[0]); // ✔ any one seat ID

    payReq.input("Amount", sql.Int, normalizedAmount);
    payReq.input("PaymentMode", sql.VarChar(50), PaymentMode || "PhonePe");
    payReq.input("TransactionID", sql.VarChar(sql.MAX), normalizedTxnId);
    payReq.input(
      "TransactionResponse",
      sql.VarChar(sql.MAX),
      normalizedResponse
    );
    payReq.input("TransactionCode", sql.VarChar(50), normalizedCode);
    payReq.input("PaymentStatus", sql.VarChar(50), normalizedStatus);
    payReq.input("ErrorCode", sql.VarChar(500), ErrorCode || null);
    payReq.input("CreatedBy", sql.Int, CreatedBy || UserID || 1);

    await payReq.execute("dbo.sp_Payment");

    console.log("💾 Payment saved successfully:", normalizedTxnId);

    /// ------------------------------------------------------
    // 2️⃣ Generate Tickets for multiple seat IDs
    // ------------------------------------------------------
    const ticketReq = pool.request();

    // regular inputs
    ticketReq.input("UserID", sql.Int, UserID);
    ticketReq.input("BookingdtlsID", sql.Int, BookingdtlsID);
    ticketReq.input("JourneyDate", sql.Date, normalizedJourneyDate);

    // ⭐ Create TVP for seat IDs
    const seatList = new sql.Table("dbo.IntList");
    seatList.columns.add("SeatID", sql.Int);

    seatIdArray.forEach((id) => seatList.rows.add(id));

    // ⭐ MUST specify sql.TVP
    ticketReq.input("SeatIDs", sql.TVP, seatList);

    const ticketRes = await ticketReq.execute("sp_GenerateTicketsAndUpdateBooking");

    console.log("🎫 Tickets generated:", ticketRes.recordset);

    return res.status(201).json({
      success: true,
      message: "Payment recorded and tickets generated successfully.",
      tickets: ticketRes.recordset,
    });
  } catch (err) {
    console.error("❌ Error in /api/success:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment success.",
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



// app.post("/api/payment/create-order", async (req, res) => {
//   try {
//    const { merchantOrderId, amount, userId, bookingdtlsId, busBookingSeatId ,selectedDate, packageId,} = req.body;


//     if (!merchantOrderId || !amount)
//       return res.status(400).json({ error: "merchantOrderId and amount are required" });

//     const token = await getOAuthToken();
//     if (!token)
//       return res.status(500).json({ error: "Failed to get OAuth token" });

//     const requestBody = {
//       merchantOrderId,
//       amount: parseInt(amount),
//       expireAfter: 1200,
//       paymentFlow: {
//         type: "PG_CHECKOUT",
//         message: "Payment for Tirupati Package",
//         merchantUrls: {
//           // ✅ Include IDs in callback URL
        

//         // redirectUrl: `https://api.tirupatipackagetours.com/api/payment/callback?orderId=${merchantOrderId}&amount=${amount}&userId=${userId}&bookingdtlsId=${bookingdtlsId}&busBookingSeatId=${busBookingSeatId}&journeyDate=${selectedDate}`,
//            redirectUrl: `http://localhost:5000/api/payment/callback?orderId=${merchantOrderId}&amount=${amount}&userId=${userId}&bookingdtlsId=${bookingdtlsId}&busBookingSeatId=${busBookingSeatId}&journeyDate=${selectedDate}`,
                  

//         },
//       },
//     };

//     const response = await axios.post(
//       `${SANDBOX_BASE_URL}/checkout/v2/pay`,
//       requestBody,
//       {
//         headers: {
//           Authorization: `O-Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.json({ orderId: merchantOrderId, phonepeResponse: response.data });
//   } catch (err) {
//     console.error("Error creating order:", err.response?.data || err.message);
//     res.status(500).json({ error: err.response?.data || err.message });
//   }
// });
// ---------------------------------------------
// ✅ CALLBACK AFTER PAYMENT SUCCESS
// ---------------------------------------------

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const {
      merchantOrderId,
      amount,
      userId,
      bookingdtlsId,
      busBookingSeatIds,   // ⭐ ARRAY coming from frontend
      selectedDate,
      packageId,
      from,
    } = req.body;

    if (!merchantOrderId || !amount) {
      return res.status(400).json({
        error: "merchantOrderId and amount are required",
      });
    }

    // ✔ Convert array → comma string for callback
    const seatIdsString = Array.isArray(busBookingSeatIds)
      ? busBookingSeatIds.join(",")
      : "";

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
          // ⭐ Pass MULTIPLE seat IDs
       //   redirectUrl: `http://localhost:5000/api/payment/callback?orderId=${merchantOrderId}&amount=${amount}&userId=${userId}&bookingdtlsId=${bookingdtlsId}&busBookingSeatIds=${seatIdsString}&journeyDate=${selectedDate}&packageId=${packageId}&from=${from}`,
         redirectUrl: `https://api.tirupatipackagetours.com/api/payment/callback?orderId=${merchantOrderId}&amount=${amount}&userId=${userId}&bookingdtlsId=${bookingdtlsId}&busBookingSeatIds=${seatIdsString}&journeyDate=${selectedDate}&packageId=${packageId}&from=${from}`,
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

    res.json({
      orderId: merchantOrderId,
      phonepeResponse: response.data,
    });
  } catch (err) {
    console.error(
      "Error creating order:",
      err.response?.data || err.message
    );
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
});


// app.get("/api/payment/callback", async (req, res) => {
//   try {
//     const { orderId, amount, userId, bookingdtlsId, busBookingSeatId, journeyDate,packageId } = req.query;

//     console.log("🔄 CALLBACK PARAMS:", req.query);

//     // ✅ 1️⃣ Post to your success endpoint to record payment and update seats
//      //  await axios.post("https://api.tirupatipackagetours.com/api/success", {
//   await axios.post("http://localhost:5000/api/success", {
//       UserID: userId,
//       BookingdtlsID: bookingdtlsId,
//       BusBookingSeatID: busBookingSeatId,
//       Amount: amount / 100,
//       PaymentMode: "PhonePe",
//       TransactionID: orderId,
//       PaymentStatus: "Success",
//       TransactionCode: "00",
//       TransactionResponse: "Payment successful via PhonePe",
//       CreatedBy: userId || 1,
//       JourneyDate: journeyDate || new Date().toISOString().split("T")[0], // ✅ Pass journey date
//     });

//     // ✅ 2️⃣ Redirect user to success page
//      //  res.redirect(`https://www.tirupatipackagetours.com/payment-result?orderId=${orderId}`);
//     res.redirect(`http://localhost:8080/payment-result?orderId=${orderId}`);
//   } catch (err) {
//     console.error("❌ Payment callback error:", err);

//     try {
//       const pool = await sql.connect(dbConfig);

//       // ✅ 3️⃣ Mark booking as Cancelled + Failed
//       const failUpdate = pool.request();
//       failUpdate.input("BusBookingSeatID", sql.Int, parseInt(req.query.busBookingSeatId || 0));
//       failUpdate.input("BookingdtlsID", sql.Int, parseInt(req.query.bookingdtlsId || 0));
//       failUpdate.input("JourneyDate", sql.Date, req.query.journeyDate || new Date().toISOString().split("T")[0]);

//       await failUpdate.query(`
//         UPDATE BusBookingSeat
//         SET Status = 'Cancelled',
//             PaymentStatus = 'Failed'
//         WHERE 
//           (BusBookingSeatID = @BusBookingSeatID OR BusBookingDetailsID = @BookingdtlsID)
//           AND CAST(JourneyDate AS DATE) = @JourneyDate
//       `);

//       console.log("🚫 Booking marked as failed/cancelled");

//       // ✅ 4️⃣ Clean up SeatLock entries
//       const cleanup = pool.request();
//       cleanup.input("BusBookingDetailsID", sql.Int, parseInt(req.query.bookingdtlsId || 0));
//       cleanup.input("JourneyDate", sql.Date, req.query.journeyDate || new Date().toISOString().split("T")[0]);

//       await cleanup.query(`
//         DELETE FROM SeatLock
//         WHERE BusBookingDetailsID = @BusBookingDetailsID
//           AND CAST(JourneyDate AS DATE) = @JourneyDate
//       `);

//       console.log("🧹 Seat locks removed after failed payment");
//     } catch (innerErr) {
//       console.error("⚠️ Cleanup/DB update failed:", innerErr);
//     }

//     // ✅ 5️⃣ Redirect user to frontend failure page
//   //  res.redirect(`https://www.tirupatipackagetours.com/payment-failed`);
//     res.redirect(`http://localhost:8080/payment-failed`);
//   }
// });


//////////////// phone pe payment ///////
////////////////////////////////////

// ----------------------------


app.get("/api/payment/callback", async (req, res) => {
  try {
    const {
      orderId,
      amount,
      userId,
      bookingdtlsId,
      busBookingSeatIds,   // ⭐ Now receiving comma separated seat IDs
      journeyDate,
      packageId,
    } = req.query;

    console.log("🔄 CALLBACK PARAMS:", req.query);

    // ⭐ Convert CSV to array
    const seatIdArray = busBookingSeatIds
      ? busBookingSeatIds.split(",").map((id) => parseInt(id))
      : [];

    console.log("🆔 Parsed Seat ID Array:", seatIdArray);

    // ⭐ Send the array into /api/success
    // const successResponse = await axios.post(
    //   "http://localhost:5000/api/success",
    //   {
   const successResponse = await axios.post("https://api.tirupatipackagetours.com/api/success", {
        UserID: userId,
        BookingdtlsID: bookingdtlsId,

        // ⭐ Send array instead of single ID
        BusBookingSeatIDs: seatIdArray,

        Amount: amount / 100,
        PaymentMode: "PhonePe",
        TransactionID: orderId,
        PaymentStatus: "Success",
        TransactionCode: "00",
        TransactionResponse: "Payment successful via PhonePe",
        CreatedBy: userId || 1,
        JourneyDate: journeyDate,
      }
    );

    // ⭐ Encode ticket numbers for frontend
    const ticketsEncoded = encodeURIComponent(
      JSON.stringify(successResponse.data.tickets)
    );

    // ⭐ Redirect to payment result page
    // res.redirect(
    //   `http://localhost:8080/payment-result?orderId=${orderId}&tickets=${ticketsEncoded}`
    // );
    res.redirect(`https://www.tirupatipackagetours.com/payment-result?orderId=${orderId}&tickets=${ticketsEncoded}`);

  } catch (err) {
    console.error("❌ Payment callback error:", err);

    try {
      const pool = await sql.connect(dbConfig);

      // ⭐ Parse multiple seat IDs if present
      const seatIdArray =
        req.query.busBookingSeatIds?.split(",").map((id) => parseInt(id)) ||
        [];

      console.log("❌ Handling failure for seats:", seatIdArray);

      // ⭐ Cancel MULTIPLE booked seats
      if (seatIdArray.length > 0) {
        await pool.request().query(`
          UPDATE BusBookingSeat
          SET Status = 'Cancelled',
              PaymentStatus = 'Failed'
          WHERE BusBookingSeatID IN (${seatIdArray.join(",")})
        `);
      }

     

      console.log("🚫 Booking marked as failed/cancelled");

      // ⭐ Cleanup SeatLock for journey date
      await pool.request().query(`
        DELETE FROM SeatLock
        WHERE BusBookingDetailsID = ${parseInt(req.query.bookingdtlsId || 0)}
          AND CAST(JourneyDate AS DATE) = '${req.query.journeyDate || new Date().toISOString().split("T")[0]}'
      `);

      console.log("🧹 Seat locks removed after failed payment");
    } catch (innerErr) {
      console.error("⚠️ Cleanup/DB update failed:", innerErr);
    }

    // Redirect to failure page
    // res.redirect(`http://localhost:8080/payment-failed`);
     res.redirect(`https://www.tirupatipackagetours.com/payment-failed`);
  }
});

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

// ---------------------------------------------------
// 🧹 AUTO-CLEANUP JOB FOR EXPIRED SEAT LOCKS
// ---------------------------------------------------
const CLEANUP_INTERVAL_MINUTES = 5; // runs every 5 minutes

setInterval(async () => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.query(`
      DELETE FROM SeatLock
      WHERE ExpiresAt < GETDATE();
    `);

    if (result.rowsAffected[0] > 0) {
      console.log(`🧹 Cleaned ${result.rowsAffected[0]} expired seat locks`);
    }
  } catch (err) {
    console.error("❌ Seat lock cleanup error:", err.message);
  }
}, CLEANUP_INTERVAL_MINUTES * 60 * 1000);

// ---------------------------------------------------
// 🧹 AUTO-CLEANUP JOB TO mark old “Pending” seats as “Failed” if not paid within 15 min
// ---------------------------------------------------
setInterval(async () => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.query(`
      UPDATE BusBookingSeat
      SET Status = 'Cancelled', PaymentStatus = 'Failed'
      WHERE PaymentStatus = 'Pending' AND DATEDIFF(MINUTE, CreatedDt, GETDATE()) > 15;
    `);
  } catch (err) {
    console.error("Payment cleanup error:", err.message);
  }
}, 10 * 60 * 1000);
/////////////////////////////////////////
// HARD CODED CHROMIUM PATH (Linux servers)
// app.post("/api/send-ticket", async (req, res) => {
//   try {
//     const { travellerData, contactData, totalPrice, tripData } = req.body;
//     const passenger = travellerData?.[0] || {};

//     // ------------------------------
//     // HTML TO CONVERT INTO PDF
//     // ------------------------------
//     const htmlContent = `
//     <div style="font-family: Arial; padding: 20px; line-height: 1.5;">
//       <h2 style="color: #2b3e50;">eTicket Confirmation</h2>

//       <p><b>Passenger:</b> ${passenger.FirstName || ""} ${passenger.LastName || ""}</p>
//       <p><b>Bus Operator:</b> ${tripData?.operator || "N/A"}</p>
//       <p><b>Date of Travel:</b> ${tripData?.travelDate}</p>
//       <p><b>Seats:</b> ${travellerData.map(p => p.SeatNo || p.SeatNumber).join(", ")}</p>
//       <p><b>Total Paid:</b> ₹${totalPrice}</p>

//       <p><b>Boarding:</b> ${tripData?.boardingPoint?.PointName || "N/A"}</p>
//       <p><b>Dropping:</b> ${tripData?.droppingPoint?.PointName || "N/A"}</p>

//       <hr/>
//       <p>Thank you for booking with <b>Tirupati Package Tours</b>.</p>
//     </div>
//     `;

//     // ------------------------------
//     // PUPPETEER-CORE + CHROMIUM
//     // ------------------------------
//     const browser = await puppeteer.launch({
//       args: chromium.args,
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath(),
//       headless: chromium.headless,
//     });

//     const page = await browser.newPage();
//     await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({ format: "A4" });

//     await browser.close();

//     // ------------------------------
//     // EMAIL SENDING
//     // ------------------------------
//     const transporter = nodemailer.createTransport({
//       host: "smtpout.secureserver.net",
//       port: 465,
//       secure: true,
//       auth: {
//         user: "enquiry@tirupatipackagetours.com",
//         pass: "Nagesh1987@",
//       },
//     });

//     const mailOptions = {
//       from: `"Tirupati Package Tours" <enquiry@tirupatipackagetours.com>`,
//       to: contactData?.Email,
//       subject: `Your eTicket - ${tripData?.operator || "Bus Trip"} (${tripData?.travelDate})`,
//       html: `
//         <p>Dear ${passenger.FirstName || "Passenger"},</p>
//         <p>Thank you for booking with Tirupati Package Tours.</p>
//         <p>Your eTicket is attached below.</p>
//         <br/>
//         <p>Warm regards,<br/>
//         <b>Tirupati Package Tours</b><br/>
//         +91 9731312275 / +91 8197882511</p>
//       `,
//       attachments: [
//         {
//           filename: `eTicket_${passenger.FirstName || "Passenger"}.pdf`,
//           content: pdfBuffer,
//           contentType: "application/pdf",
//         },
//       ],
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ success: true, message: "Ticket email sent successfully!" });

//   } catch (error) {
//     console.error("❌ SEND TICKET ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to send ticket email",
//       error: error.message,
//     });
//   }
// });











// AUTO-ARCHIVE JOB FOR OLD BUS BOOKING RECORDS (using stored procedure)
// ---------------------------------------------------

// Runs every 6 hours (adjust as needed)
const ARCHIVE_INTERVAL_HOURS = 24;

setInterval(async () => {
  console.log("🕐 Running archive stored procedure:", new Date().toISOString());

  try {
    const pool = await sql.connect(dbConfig);

    // Execute the stored procedure in SQL Server
    await pool.request().execute("sp_ArchiveOldBusBookingSeats");

    console.log("Archive stored procedure executed successfully!");
  } catch (err) {
    console.error("Archive stored procedure failed:", err.message);
  } finally {
    // 🧹 Always close the SQL connection (only if you're not using a global pool)
    await sql.close();
  }
}, ARCHIVE_INTERVAL_HOURS * 60 * 60 * 1000); // every 6 hours
// ✅ Start the server
app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

/////////////////////////////////////////////////////////////////////

