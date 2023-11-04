const express = require("express");
const router = express.Router({mergeParams: true});// MERGE PARAMS TAKES SAME PARAMS FROM APP.JS BECAUSE BY DEFAULT THEY ARE SEPARATE PARAMS
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview } = require("../middleware");



//THESE ARE THE REVIEW ROUTES
router.post("/", validateReview, catchAsync( async( req, res )=>{
    // res.send("you made it bro")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review.")
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", catchAsync( async(req, res)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{ reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted review.")
    res.redirect(`/campgrounds/${id}`)
}));

module.exports = router;