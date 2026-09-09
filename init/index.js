const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

//  Safety: only run against local dev database
const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust"

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed in production. This script is for local dev only.");
  process.exit(1);
}

main()
    .then(() => {
    console.log("Connected to DB");
    })
    .catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect(Mongo_url);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj,owner: process.env.ADMIN_ID}));
    await Listing.insertMany( initdata.data );
    console.log("data was initialized");
}
initDB();


