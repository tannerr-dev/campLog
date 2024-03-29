const Campground = require("../models/campground");
const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid data bruh", 400);
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename})); //implicit return arrow function 
    console.log(campground.images);
    //req.files comes from multer??
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Created new campground.");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground =  async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', 
        populate:{
            path:'author'
        }
    }).populate('author'); //is populate a mongoose thing?
    // console.log(campground.reviews)
    if (!campground){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    // imgs make the array and then we can spread it into the push, this way we dont push and array at the end of the images array
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            // cloudinary api looks easier than mongoose lol
            await cloudinary.uploader.destroy(filename);
        }
        // below is mongoose i believe
        await campground.updateOne({$pull: {images:{filename:{$in: req.body.deleteImages}}}});
    }
    req.flash("success", "Updated campground.");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Deleted campground.");
    res.redirect("/campgrounds");
}