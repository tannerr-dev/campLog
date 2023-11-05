const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

// const Joi = require("joi");
const {campgroundSchema, reviewSchema} = require("./schemas");//JOI schema

const Review = require("./models/review");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user")

// NEW ROUTES
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


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

// serve static public dir
app.use(express.static(path.join(__dirname, "public")));

// cookie sessions config and use
const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 *60 * 24 *7
    }
}


app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))//User.authenticate is added by passport 
passport.serializeUser(User.serializeUser());//log/store user into session
passport.deserializeUser(User.deserializeUser());//log/store user out of session


// MIDDLESWARE SECTION, they require the next function as a parameter
app.use((req, res, next) => {
    req.requestTime = Date.now();
    // console.log(req.method, req.path);
    console.log(req.request);
    next();
});

// this is FLASH setup, and storing local data so all app components can access data
app.use((req,res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


// ROUTES
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes); //EMBEDDING THE :id makes it so we have to merge params on the router page



// Beginning of all the routing after the middleware
app.get("/", (req, res) => {
    // res.send('Hello, I am campLog');
    res.render("home");
    // console.log(`yer request date: ${req.requestTime}`);
});



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
