var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/catalog");
});

router.get("/cool", function (req, res, next) {
  res.render("cool");
});

module.exports = router;
