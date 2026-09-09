const Listing = require("../models/listing");
const { cloudinary } = require("../cloudconfig.js");
const googlemapkey = process.env.GOOGLE_MAPS_API_KEY;
module.exports.index = async (req, res) => {
    const { q } = req.query;
    const term = q && q.trim();
    const filter = term
        ? {
            $or: [
                { title: { $regex: term, $options: "i" } },
                { location: { $regex: term, $options: "i" } },
                { country: { $regex: term, $options: "i" } },
            ],
          }
        : {};
    const allListings = await Listing.find(filter);
    res.render("./listings/index", { allListings, q: term || "" });
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

    const previousImageFilename = listing.image && listing.image.filename;

    // update basic fields
    listing.title = req.body.listing.title;
    listing.price = req.body.listing.price;
    listing.description = req.body.listing.description;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // update image if new file uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    // Remove the replaced Cloudinary image (only real uploaded public IDs —
    // seeded listings use a shared placeholder filename and Unsplash URLs).
    if (req.file && previousImageFilename && previousImageFilename !== "listingimage") {
        try {
            await cloudinary.uploader.destroy(previousImageFilename);
        } catch (err) {
            console.log("Could not delete previous Cloudinary image:", err.message);
        }
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};