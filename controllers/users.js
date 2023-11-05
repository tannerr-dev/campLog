const User = require("../models/user");

module.exports.renderRegisterForm = (req, res)=>{
    res.render("users/register");
};

module.exports.register = async (req , res) => {
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
};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login");
};

module.exports.login = (req, res)=>{
    req.flash("success", "Welcome back!");
    const redirectURL = res.locals.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectURL);
    // middleware passport.authenticate with some options in an object
    // passport is actually doing the logging in in the routes page this is flashing and redirecting
};


module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};