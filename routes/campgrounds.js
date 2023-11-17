const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const {isLoggedIn, validateCampground, isAuthor} = require("../middleware");
const campgrounds = require("../controllers/campgrounds")
const multer = require("multer");
const {storage}=require("../cloudinary"); //node automatically searches for index.js in a folder so there is no need to specify the filename
const upload = multer({storage});

router.route("/")
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.array("image"), (req, res)=>{
        // console.log(req.body, req.files)
        res.send("It worked.")
    })

router.get("/new", isLoggedIn, campgrounds.renderNewForm);
//order matters, this needs to be before the /:id otherwise the 'new' will be handled as an id

//THESE ARE THE CAMPGROUND ROUTES
router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;