const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust"
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
    initdata.data = initdata.data.map((obj)=>({...obj,owner:"695d04d97f65b0a9801f10a1"}));
    await Listing.insertMany( initdata.data );
    console.log("data was initialized");
}
initDB();
// const ADMIN_ID = "695d04d97f65b0a9801f10a1";

// const initDB = async () => {
//   await Listing.deleteMany({});

//   initdata.data = initdata.data.map(obj => ({
//     ...obj,
//     owner: ADMIN_ID
//   }));

//   await Listing.insertMany(initdata.data);
//   console.log("all listings assigned to one user");
// };

// initDB();


