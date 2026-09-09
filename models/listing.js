const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { cloudinary } = require("../cloudconfig.js");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=60",
    },
  },
  price: {
    type: Number,
    default: 2000,
  },
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },

});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    // remove the Cloudinary image so we don't leave orphaned uploads
    if (listing.image && listing.image.filename) {
      try {
        await cloudinary.uploader.destroy(listing.image.filename);
      } catch (err) {
        console.log("Could not delete Cloudinary image:", err.message);
      }
    }
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
