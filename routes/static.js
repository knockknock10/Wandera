const express = require("express");
const router = express.Router();

router.get("/privacy", (req, res) => {
  res.render("static/privacy");
});

router.get("/terms", (req, res) => {
  res.render("static/terms");
});

router.get("/contact", (req, res) => {
  res.render("static/contact");
});

module.exports = router;
