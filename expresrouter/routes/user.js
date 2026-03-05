const express = require("express");
//Router Object
const router = express.Router();

//Index-Users
router.get("/", (req, res) => {
  res.send("Get for Users");
});

//Show -route
router.get("/:id", (req, res) => {
  res.send("Get for show users id");
});

//Post -User
router.post("/", (req, res) => {
  res.send("Post rout fror users");
});
//Delete User
router.delete("/:id", (req, res) => {
  res.send("Delete for POst");
});

module.exports = router;
