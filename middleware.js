const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema} = require("./schema.js");


// Resolve the authenticated user regardless of how middleware is invoked.
// res.locals.currUser is set by an app-level middleware; req.user is set by
// Passport. Prefer req.user, fall back to locals.
const currentUser = (req, res) => req.user || (res.locals && res.locals.currUser) || null;

module.exports.isLoggedIn = (req,res,next)=>{
  
    //console.log(req.user);  //get the log in or log out user info
    if(!req.isAuthenticated()){
      //redirect url save 
      req.session.redirectUrl = req.originalUrl;
    req.flash("error","You must be logged In");
    return res.redirect("/login");
  }
  next();
}


// middleware for  save redirect url
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; 
  }
  next();
};

module.exports.isowner = async(req,res,next)=>{
  let{id} = req.params;
  let listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing does not exist!");
    return res.redirect("/listings");
  }
  const user = currentUser(req, res);
  const ownerId = listing.owner && (listing.owner._id || listing.owner);
  if(!user || !ownerId || !ownerId.equals(user._id)){
    req.flash("error","You are not the owner of this listing!");
    return  res.redirect(`/listings/${id}`); 
  }
  next();
}


//middleware for validateSchema
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//for Review
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isreviewAuthor = async(req,res,next)=>{
  let{id,reviewId} = req.params;
  let review = await Review.findById(reviewId);
  if(!review){
    req.flash("error","Review does not exist!");
    return res.redirect(`/listings/${id}`); 
  }
  const user = currentUser(req, res);
  const authorId = review.author && (review.author._id || review.author);
  if(!user || !authorId || !authorId.equals(user._id)){
    req.flash("error","You are not author of this review!");
    return  res.redirect(`/listings/${id}`); 
  }
  next();
}
