const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { wrap } = require("module");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const{validateReview, isLoggedIn,isreviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

//Review Route
//Post route bcz reviews will be only accesed by its listing
//Post review rout
router.post(
  "/",isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//delete Review Route
router.delete(
  "/:reviewId",isLoggedIn,isreviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
