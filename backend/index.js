import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/index.js";
import mongoose from "mongoose";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const validateEnvironment = () => {
  const requiredEnvVars = ["TOKEN_SECRET_KEY", "FRONTEND_URLS", "SESSION_SECRET"];
  const missingVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGODB_URI) {
      missingVars.push("MONGODB_URI");
    }
    if (!process.env.SESSION_SECRET) {
      missingVars.push("SESSION_SECRET");
    }
  }

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars);
    process.exit(1);
  }
};

validateEnvironment();

console.log("🚀 Starting server...");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log(
  `   MONGODB_URI: ${process.env.MONGODB_URI ? "✓ Set" : "✗ NOT SET"}`,
);

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((origin) => origin.trim())
  : [];

// Add admin panel production URL if set
if (process.env.ADMIN_PANEL_URL) {
  const adminUrls = process.env.ADMIN_PANEL_URL.split(",").map((url) => url.trim());
  allowedOrigins.push(...adminUrls);
}

// Add admin panel origins for development
const adminOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://localhost:5182',
  'http://localhost:5183',
  'http://localhost:5184',
  'http://localhost:5185',
  'http://localhost:5186',
  'http://localhost:5187',
  'http://localhost:5188',
  'http://localhost:5189',
  'http://localhost:5190',
];
allowedOrigins.push(...adminOrigins);

const isDev = process.env.NODE_ENV !== "production";
const localhostOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (isDev && localhostOriginPattern.test(origin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Platform"],
  optionsSuccessStatus: 200,
};

// Handle preflight requests before helmet or any other middleware
app.options("*", cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Configure session middleware for CSRF protection
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: "lax",
    },
  }),
);

app.use(xss());
app.use(mongoSanitize());

app.use("/api", router);

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    status: 404,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

// Serve static files only in production mode
const buildPath = path.join(__dirname, "build");
if (process.env.NODE_ENV === "production" && fs.existsSync(buildPath)) {
  app.use(
    express.static(buildPath, {
      setHeaders: (res) => {
        res.setHeader("X-Frame-Options", "DENY");
      },
    }),
  );

  // Serve index.html for SPA routing in production
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // Development mode: return 404 for unmatched routes instead of serving HTML
  app.use((req, res) => {
    if (!req.path.startsWith("/api")) {
      res.status(404).json({
        error: "Not found",
        message: "API endpoint not found. Use /api/* for backend APIs.",
        path: req.path,
      });
    }
  });
}

const PORT = process.env.PORT || 5000;

// Start server immediately — DB connects in background
// This ensures CORS, routes and health checks work even during DB reconnect
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔓 CORS mode: ${isDev ? "RESTRICTED (dev allowlist + localhost ports)" : "RESTRICTED (production)"}`);
});

connectDB()
  .then(() => {
    const db = mongoose.connection;
    console.log(`✅ MongoDB Connected`);
    console.log(`   Host: ${db.host}`);
    console.log(`   Port: ${db.port}`);
    console.log(`   Database: ${db.name}`);
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.warn("⚠️  Running without database — DB-dependent routes will fail.");
    }
  });
