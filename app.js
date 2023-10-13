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
const cookieParser = require("cookie-parser")

const campgrounds = require("./routes/campgrounds");



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






app.use("/campgrounds", campgrounds)

// Beginning of all the routing after the middleware
app.get("/", (req, res) => {
    // res.send('Hello, I am campLog');
    res.render("home");
    // console.log(`yer request date: ${req.requestTime}`);
});






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
