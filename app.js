const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
// const Joi = require("joi");
const {campgroundSchema, reviewSchema} = require("./schemas");
const Review = require("./models/review");



mongoose.connect("mongodb://127.0.0.1:27017/campLog", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}); // useCreateIndex: true,// docs says it always acts as true now

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DataBASS connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // parses the req.body from the sent form
app.use(methodOverride("_method"));
app.use(morgan("common"));

// MIDDLESWARE SECTION, they require the next function as a parameter
app.use((req, res, next) => {
    req.requestTime = Date.now();
    // console.log(req.method, req.path);
    console.log(req.request);
    next();
});

const validateCampground = (req, res, next)=>{
    // new validation using JOI instead of old above jank validate
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        console.log(msg);
        console.log("hell yea from the server, joi stopped you")
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

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








// Beginning of all the routing after the middleware
app.get("/", (req, res) => {
    // res.send('Hello, I am campLog');
    res.render("home");
    // console.log(`yer request date: ${req.requestTime}`);
});

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});
//order matters, this needs to be before the /:id otherwise the 'new' will be handled as an id


//THESE ARE THE CAMPGROUND ROUTES
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid data bruh", 400);
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground.reviews)
    res.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res, next) => {
    // res.send("it worked")
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,});
    res.redirect(`/campgrounds/${campground._id}`);
}));


app.delete("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));




//THESE ARE THE REVIEW ROUTES
app.post("/campgrounds/:id/reviews",validateReview, catchAsync( async( req, res )=>{
    // res.send("you made it bro")
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync( async(req, res)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{ reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}));









// THESE ARE THE CATCH ALLS/EVERY TIME
app.all("*", (req, res, next) => {
    next(new ExpressError("Page NOTTTT found", 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something fucc'd" } = err;
    res.status(statusCode).render("error", { err });
    // res.send("oh man");
});

app.listen(3000, () => {
    console.log("Listening for data waves on port 3000");
});
