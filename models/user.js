const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;  //mported as an object instead of a function.

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
    }
})   

userSchema.plugin(passportLocalMongoose);   //PLugin here bcz it automatically adds here user salting pass 

module.exports = mongoose.model("User",userSchema);