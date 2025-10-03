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


const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


// ------------------- DATABASE CONFIG -------------------
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

// Serve static files from the "public" folder
app.use(express.static(path.join(process.cwd(), "public")));






// Helper function for queries
async function queryAsync(query) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error:", err);
    throw err;
  } finally {
    if (pool) await pool.close();
  }
}

// ------------------- TOUR OPTIONS -------------------
// ------------------- TOUR OPTIONS -------------------
const TOUR_OPTIONS = {
  serenity: {
    id: "serenity",
    title: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights",
    days: [
      {
        dayNumber: 1,
        date: "",
        activities: [
          { timeStart: "06:00", timeEnd: "08:00", title: "Travel to Tirupati", type: "Travel", location: "From Bangalore", estimatedDurationMinutes: 120, notes: "Start early in the morning" },
          { timeStart: "08:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 210, notes: "Follow the queue; book special entry if needed" },
          { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Hotel or Local Restaurant", estimatedDurationMinutes: 90, notes: "Try local Andhra cuisine" }
        ]
      },
      {
        dayNumber: 2,
        date: "",
        activities: [
          { timeStart: "07:00", timeEnd: "09:00", title: "Srikalahasti Darshan", type: "Temple", location: "Srikalahasti Temple", estimatedDurationMinutes: 120, notes: "Famous for Vayu Linga" },
          { timeStart: "09:30", timeEnd: "12:00", title: "Local Sightseeing & Photography", type: "Sightseeing", location: "Nearby scenic spots", estimatedDurationMinutes: 150, notes: "Capture the temple town beauty" }
        ]
      }
    ],
    hotels: [{ name: "Tirupati Grand Hotel", area: "Tirupati", recommendedFor: "Families, Couples", approxPriceRange: "₹2500 - ₹4000/night" }],
    darshanEstimates: [
      { templeName: "Tirumala Temple", recommendedSlot: "08:30 - 12:00", estimatedWaitMinutes: 180, notes: "Peak hours in morning" },
      { templeName: "Srikalahasti Temple", recommendedSlot: "07:00 - 09:00", estimatedWaitMinutes: 120, notes: "Less crowded in early morning" }
    ],
    timelineForChart: [
      { label: "Travel", day: 1, startHourDecimal: 6, endHourDecimal: 8 },
      { label: "Tirumala Darshan", day: 1, startHourDecimal: 8.5, endHourDecimal: 12 },
      { label: "Lunch", day: 1, startHourDecimal: 12.5, endHourDecimal: 14 },
      { label: "Srikalahasti Darshan", day: 2, startHourDecimal: 7, endHourDecimal: 9 },
      { label: "Sightseeing", day: 2, startHourDecimal: 9.5, endHourDecimal: 12 }
    ],
    packageTitle: "Divine Blessings & Sacred Serenity – Tirupati & Srikalahasti in 2 Days 2 Nights"
  },

  templeTrails: {
    id: "templeTrails",
    title: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night (Free Dharshan)",
    days: [
      {
        dayNumber: 1,
        date: "",
        activities: [
          { timeStart: "06:00", timeEnd: "10:00", title: "Travel to Tirupati", type: "Travel", location: "From Chennai", estimatedDurationMinutes: 240, notes: "Morning bus ride" },
          { timeStart: "10:30", timeEnd: "12:00", title: "Tirumala Darshan", type: "Temple", location: "Tirumala Temple", estimatedDurationMinutes: 90, notes: "Free darshan slot" },
          { timeStart: "12:30", timeEnd: "14:00", title: "Lunch", type: "Meal", location: "Local eatery", estimatedDurationMinutes: 90, notes: "Andhra special dishes" }
        ]
      },
      {
        dayNumber: 2,
        date: "",
        activities: [
          { timeStart: "07:00", timeEnd: "09:00", title: "Local Temple Hopping", type: "Temple", location: "Kapila Theertham & Govindaraja Swamy Temple", estimatedDurationMinutes: 120, notes: "Short walks and photo ops" }
        ]
      }
    ],
    hotels: [{ name: "Temple Trails Inn", area: "Tirupati", recommendedFor: "Solo travelers, Pilgrims", approxPriceRange: "₹1500 - ₹2500/night" }],
    darshanEstimates: [
      { templeName: "Tirumala Temple", recommendedSlot: "10:30 - 12:00", estimatedWaitMinutes: 90, notes: "Morning free darshan" }
    ],
    timelineForChart: [
      { label: "Travel", day: 1, startHourDecimal: 6, endHourDecimal: 10 },
      { label: "Tirumala Darshan", day: 1, startHourDecimal: 10.5, endHourDecimal: 12 },
      { label: "Lunch", day: 1, startHourDecimal: 12.5, endHourDecimal: 14 },
      { label: "Temple Hopping", day: 2, startHourDecimal: 7, endHourDecimal: 9 }
    ],
    packageTitle: "Discover Tirupati by Bus & Temple Trails – 2 Days 1 Night (Free Dharshan)"
  }
};

// ------------------- PLAN API -------------------
app.post("/api/plan", async (req, res) => {
  try {
    const { tourId } = req.body;
    if (!tourId || !TOUR_OPTIONS[tourId]) return res.status(400).json({ error: "Invalid tourId" });

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
    res.json({ success: true, plan: TOUR_OPTIONS[tourId] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
});

// ------------------- PACKAGE LIST API -------------------
app.get("/api/package-list", async (req, res) => {
  try {
    const rows = await queryAsync(`SELECT PackageID, PackageName FROM Package ORDER BY PackageID`);
    res.json(rows);
  } catch (err) {
    console.error("SQL error:", err);
    res.status(500).send("Server error");
  }
});

// ------------------- FEEDBACK API -------------------
app.post("/api/submit-feedback", async (req, res) => {
  try {
    const { name, contactNo, emailId, userFeedback, packageId } = req.body;
    if (!name || !contactNo || !emailId || !userFeedback || !packageId)
      return res.status(400).json({ error: "All fields are required" });

    const query = `
      EXEC sp_UserFeedback
        @Flag='I',
        @Name='${name}',
        @ContactNo='${contactNo}',
        @EmailId='${emailId}',
        @UserFeedback='${userFeedback}',
        @PackageId=${packageId},
        @CreatedBy=0
    `;
    await queryAsync(query);
    res.json({ success: true, message: "Thank you for submitting, we will get back to you soon!" });
  } catch (err) {
    console.error("SQL error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SPA fallback: serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});
// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
