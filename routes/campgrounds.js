const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

const Campground = require("../models/campground");

const {isLoggedIn, validateCampground, isAuthor} = require("../middleware");

const campgrounds = require("../controllers/campgrounds")




router.get("/", catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);
//order matters, this needs to be before the /:id otherwise the 'new' will be handled as an id


//THESE ARE THE CAMPGROUND ROUTES
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get("/:id", catchAsync(campgrounds.showCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


module.exports = router;