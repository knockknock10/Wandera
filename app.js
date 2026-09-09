if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

if (!process.env.SECRET) {
  console.error(
    "FATAL: SECRET environment variable is required for session security. " +
    "See .env.example."
  );
  process.exit(1);
}

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const staticRouter = require("./routes/static.js");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// normalize requests that arrive with no parseable body (e.g. empty POSTs),
// so controllers never have to cope with `req.body` being undefined
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== "object") req.body = {};
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// security headers (helmet) — CSP disabled because views use inline scripts
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    // Allow the browser to send the referrer origin to Google Maps so that
    // referrer-restricted API keys validate (helmet's default no-referrer
    // would break them). Never sends the full URL cross-origin.
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Permissive CORP so Cloudinary/Unsplash images load; COEP is disabled.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// rate limiting — generous global, tighter on auth (auth limiter lives in routes/user.js)
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(globalLimiter);

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  app.set("trust proxy", 1);
}

//  Database 
const dburl = process.env.ATLASTDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Database connection failed:", err.message);
  });

async function main() {
  await mongoose.connect(dburl);
}


const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in mongo session store", err);
});
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOption));
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  // Read flash only when a session may already exist. connect-flash mutates
  // session.flash on read, which would otherwise create a session (and cookie)
  // on every anonymous page view, defeating saveUninitialized:false.
  const hasSessionCookie = /(^|;\s*)connect\.sid=/i.test(req.headers.cookie || "");
  if (hasSessionCookie) {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
  } else {
    res.locals.success = [];
    res.locals.error = [];
  }
  res.locals.currUser = req.user;   // for styling bcz navbar doesnt hve direct acces req.user
  next();
});

//  Routes 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/", staticRouter);



app.get("/", (req, res) => {
  res.redirect("/listings");
});

//  health check — lightweight, for uptime monitors (no DB, no render, no uploads) 
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

//  error handling 
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // invalid ObjectId (e.g. malformed listing/review id) -> treat as not found
  if (err.name === "CastError") {
    err.statusCode = 404;
    err.message = "Resource not found";
  }

  // multer upload errors (bad/oversized file) -> client error
  if (err.name === "MulterError") {
    err.statusCode = 400;
  }

  // cloudinary-style API errors carry http_code instead of statusCode
  if (!err.statusCode && typeof err.http_code === "number" && err.http_code < 500) {
    err.statusCode = err.http_code;
    err.message = err.message || "Bad request";
  }

  // errors surfaced when express-session cannot sign is done via errors that
  // match /decrypt ciphertext|unserialize/i and contain a malformed session store value
  const sessionErr = err && err.message &&
    /decrypt ciphertext|ciphertext object|ciphertext/i.test(String(err.message)) ? true : false;
  if (sessionErr) {
    // session could not be decrypted (e.g. SECRET was rotated or the cookie is
    // stale) — clear it and send the user back to login instead of a 500 page
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect("/login");
  }

  let { statusCode = 500, message = "Something Went Wrong" } = err;

  if (statusCode >= 500) {
    console.error("Server error:", err);
    // don't leak internal details to the client in production
    if (isProduction) {
      message = "Something went wrong on our end. Please try again later.";
    }
  }

  res.status(statusCode).render("error.ejs", { message, err, statusCode });
});

//  server 
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening to Port ${PORT}`);
});
