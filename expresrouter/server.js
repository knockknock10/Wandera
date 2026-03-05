const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

const sessionOption= {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: false,
}

app.use(session(sessionOption));
app.use(flash());

app.use((req,res,next)=>{
  res.locals.sucesssMsg = req.flash("success");
  res.locals.errormsg = req.flash("error"); 
  next();
})

app.get("/register",(req,res)=>{
  let {name = "anonymous"} = req.query;
  req.session.name = name;
  if(name=="anonymous"){
    req.flash("error","Not registered");
  }else{
    req.flash("success","User registered successfully !");
  }
  
  //console.log(req.session.name);
  res.redirect("/hello");
})
app.get("/hello",(req,res)=>{
  
  res.render("hello.ejs",{name:req.session.name  }); //use locals or     ,msg:req.flash("success")
})

// app.get("/recount",(req,res)=>{
//   if(req.session.count){
//     req.session.count++;
//   }else{
//     req.session.count = 1;
//   }
//   res.send(`You  sent requests ${req.session.count} times`);
// })

// app.get("/test", (req, res) => {
//   res.send("Test Success");
// })




app.listen(3000, () => {
  console.log("Server Listening to port 3000");
});





//const cookieParser = require("cookie-parser");

// app.use(cookieParser("secretcode")); //cookie parser middleware

// app.get("/getsignedcookie", (req, res) => {
//   res.cookie("made-in", "India", { signed: true });
//   res.send("Signed cookie sent");
// });

// app.get("/verify", (req, res) => {
//   //console.log(req.cookies); //{ india: 'comethi' }  if not changed then {}
//   console.log(req.signedCookies); //[Object: null prototype] { 'made-in': 'India' }   and if any chaneges in mine original cookies then {}
//   //if here only original value is changed then it shows [Object: null prototype] { 'made-in': false }
//   res.send("Verified");
// });

// app.get("/getcookies", (req, res) => {
//   res.cookie("Gree", "Namaste");
//   res.cookie("location", "India");
//   res.send("We sent a Cookie");
// });
// app.get("/names", (req, res) => {
//   let { name = "Annonyomus" } = req.cookies;
//   res.send(`Hi ${name}`);
// });

// app.get("/", (req, res) => {
//   console.dir(req.cookies);
//   res.send("Hi!, I am Root ,for Cookie");
// });

// //
// app.get("/", (req, res) => {
//   res.send("Hi I am root");
// });

// //get the common route name starting then here it macthes with /user then mapping on users.js
// app.use("/user", users);
// app.use("/posts", posts);

// //cookies

// //
