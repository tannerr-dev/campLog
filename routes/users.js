const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { storeReturnTo, isLoggedIn } = require("../middleware");


router.get("/register", (req, res)=>{
    res.render("users/register");
});

router.post("/register", catchAsync( async (req , res) => {
    try{
        const {email, username, password}= req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); //User.register is a passport feature i believe
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash("success", "Welcome to campLog");
            res.redirect("/campgrounds");
        })
        
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/register");
    }
}));

router.get("/login", (req,res)=>{
    res.render("users/login");

})
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 

router.post("/login", storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res)=>{
    req.flash("success", "Welcome back!");
    const redirectURL = res.locals.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectURL);
});// middle ware passport.authenticate with some options in an object


module.exports = router;
