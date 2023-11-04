const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const {campgroundSchema} = require("../schemas");//JOI schema
const {isLoggedIn} = require("../middleware");



const validateCampground = (req, res, next)=>{
    // new validation using JOI instead of old above jank validate
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        console.log(msg);
        console.log("hey from the server, joi stopped you")
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}



router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggedIn, (req, res) => {
    // if (!req.isAuthenticated()){
    //     req.flash("error", "You must be signed in.");
    //     return res.redirect("/login");
    // } // moved into middleware
    res.render("campgrounds/new");
});
//order matters, this needs to be before the /:id otherwise the 'new' will be handled as an id


//THESE ARE THE CAMPGROUND ROUTES
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid data bruh", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Created new campground.");
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    // console.log(campground.reviews)
    if (!campground){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const { id } = req.params;
    if (!campground){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    if (!campground.author.equals(req.user._id)){
        req.flash("error", "You do no have permission to do that.")
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render("campgrounds/edit", { campground });
}));

router.put("/:id", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash("error", "You do no have permission to do that.")
        return res.redirect(`/campgrounds/${id}`);
    }
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash("success", "Updated campground.");
    res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete("/:id", isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Deleted campground.");
    res.redirect("/campgrounds");
}));


module.exports = router;