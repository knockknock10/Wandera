const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const { wrap } = require("module"); // not required
const Listing = require("../models/listing.js");
const { isLoggedIn, isowner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudconfig.js");

const upload = multer({ storage });  //dest: 'uploads/' 


const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");


router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
  isLoggedIn,
  validateListing,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListings)
)

  //.post(,(req,res)=>{res.send(req.file)})

//Create /new route  here bcz rotuer will interprete new as id n search in db so error  
router.get("/new", isLoggedIn,listingController.renderNewForm );
  
router.route("/:id")  
  .get(wrapAsync(listingController.showListing))
  .put(
  isLoggedIn,
  isowner,
  upload.single("listing[image]"),   
  validateListing,
  wrapAsync(listingController.updateListings)
)
  .delete(
  isLoggedIn, isowner,
  wrapAsync(listingController.destroyListing))

// //index route
// router.get("/",wrapAsync(listingController.index));


//show Route
// router.get(
//   "/:id",wrapAsync(listingController.showListing));

// //Create route
// router.post(
//   "/",
//   isLoggedIn,
//   validateListing,
//   wrapAsync(listingController.createListings)
// );

// Edit Route
router.get(
  "/:id/edit", isLoggedIn, isowner,
  wrapAsync(listingController.renderEditForm)
);


//update route
// router.put(
//   "/:id",
//   isLoggedIn,
//   isowner,
//   validateListing,
//   wrapAsync(listingController.updateListings)
// );

//Delete Route
// router.delete(
//   "/:id",
//   isLoggedIn, isowner,
//   wrapAsync(listingController.destroyListing)
// );

module.exports = router;
