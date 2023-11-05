const express = require("express");
const router = express.Router({mergeParams: true});// MERGE PARAMS TAKES SAME PARAMS FROM APP.JS BECAUSE BY DEFAULT THEY ARE SEPARATE PARAMS
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const reviews = require("../controllers/reviews");


//THESE ARE THE REVIEW ROUTES
router.post("/",isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;