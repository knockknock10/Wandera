const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().max(140),
    description: Joi.string().required().max(2000),
    price: Joi.number().required().min(0).max(1000000),
    country: Joi.string().required().max(80),
    location: Joi.string().required().max(120),
    image: Joi.alternatives().try(
      Joi.string().allow("", null),
      Joi.object({
        filename: Joi.string().allow("", null).max(255),
        url: Joi.string().allow("", null).max(2000),
      }).allow(null)
    ),
  }).required().unknown(false),
}).unknown(true);

//For review validation
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().pattern(/\S/).max(2000),
  }).required(),
}).unknown(true);
