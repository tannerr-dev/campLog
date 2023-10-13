const express = require("express");
const router = express.Router({mergeParams: true});// MERGE PARAMS TAKES SAME PARAMS FROM APP.JS BECAUSE BY DEFAULT THEY ARE SEPARATE PARAMS
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const {reviewSchema} = require("../schemas"); //JOI schema
const Review = require("../models/review");


const validateReview = (req, res, next)=>{
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        console.log(msg);
        console.log("hell yea from the server, joi validateReview stopped you")
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}




//THESE ARE THE REVIEW ROUTES
router.post("/",validateReview, catchAsync( async( req, res )=>{
    // res.send("you made it bro")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", catchAsync( async(req, res)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{ reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}));

module.exports = router;