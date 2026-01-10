const express = require("express");
const router = express.Router();

//Index-POst
router.get("/", (req, res) => {
  res.send("Get for POst");
});

//Show -POst
router.get("/:id", (req, res) => {
  res.send("Get for show Post Id");
});
//Post -POst
router.post("/", (req, res) => {
  res.send("Post rout fror Post");
});
//Delete POst
router.delete("/:id", (req, res) => {
  res.send("Delete for POst");
});

module.exports = router;
