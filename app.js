if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
  //console.log(process.env.SECRET);
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
// const { wrap } = require("module");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const staticRoutes = require("./routes/static");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


//  Database 
//const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
const dburl = process.env.ATLASTDB_URL
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
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
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000
  }
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
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;  // for styling bcz navbar doesnt hve direct acces req.user
  next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//     email:"kr@gmail",
//     username : "kr"
//   });
//   let registeredUser = await User.register(fakeUser, "hello");   //here it auto saves the ifno to db
//   res.send(registeredUser);
// })

app.get("/", (req, res) => {
  res.redirect("/listings");
});
//  Routes 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", staticRoutes);
app.use("/", userRouter);



//  error handling 
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found !"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message, err });
  next();
});

//  server 
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server is listening to Port", PORT);
});
