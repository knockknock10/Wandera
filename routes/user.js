const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(authLimiter, wrapAsync(userController.signup))

router.route("/login")
  .get(userController.renderLoginForm)
  .post(authLimiter,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    saveRedirectUrl,
    userController.login
  )


router.post("/logout", userController.logout);


module.exports = router;