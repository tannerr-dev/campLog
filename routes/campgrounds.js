const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const {campgroundSchema} = require("../schemas");//JOI schema



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

router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});
//order matters, this needs to be before the /:id otherwise the 'new' will be handled as an id


//THESE ARE THE CAMPGROUND ROUTES
router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid data bruh", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Created new campground.");
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground.reviews)
    res.render("campgrounds/show", { campground });
}));

router.get("/:id/edit", catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
}));

router.put("/:id", validateCampground, catchAsync(async (req, res, next) => {
    // res.send("it worked")
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash("success", "Updated campground.");
    res.redirect(`/campgrounds/${campground._id}`);
}));


router.delete("/:id", catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Deleted campground.");
    res.redirect("/campgrounds");
}));


module.exports = router;