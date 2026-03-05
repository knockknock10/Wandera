const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");
require("dotenv").config();
const googlemapkey = process.env.GOOGLE_MAPS_API_KEY;



module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {

  res.render("listings/new");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author"
        }   //nested populate
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Requested Listing doesn't exist!");
      return res.redirect("/listings");
    }
    
    res.render("listings/show.ejs", { listing , googlemapkey});
};

module.exports.createListings = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // Attach image only if uploaded
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();

  req.flash("success", "New listing created");
  res.redirect("/listings");

  // let result = listingSchema.validate(req.body);
  // console.log(result);
  // let url = req.file.path;
  // let filename = req.file.filename;

  // const newListing = new Listing(req.body.listing);
  // newListing.owner = req.user._id;
  // newListing.image = {url,filename};
  // await newListing.save();
  // req.flash("success", "New listing created ");
  // res.redirect("/listings");
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250")

    res.render("listings/edit.ejs", { listing,originalImageUrl });
};
module.exports.updateListings = async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // update basic fields
    listing.title = req.body.listing.title;
    listing.price = req.body.listing.price;
    listing.description = req.body.listing.description;

    // update image if new file uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("error", "listing Deleted!");
    res.redirect("/listings");
};